-- ====================================================================
-- AquaVeris: Database Migration (Phase 2)
-- 7 Core Tables, Relationships, Indexes, RLS Policies & Auth Trigger
-- ====================================================================

-- 1. Create Profiles Table (links to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  preferred_language TEXT DEFAULT 'en' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create Water Sources Table
CREATE TABLE IF NOT EXISTS public.water_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'municipal', 'groundwater_well', 'borewell', 'bottled', 'surface_water', 'rainwater'
  treatment_method TEXT,     -- e.g. 'none', 'boiling', 'ro', 'uv', 'activated_carbon', etc.
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_water_sources_user_id ON public.water_sources(user_id);

-- 3. Create Reference Standards Table
CREATE TABLE IF NOT EXISTS public.reference_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_name TEXT NOT NULL,       -- 'WHO Guidelines 2022', 'BIS IS 10500:2012'
  parameter_code TEXT NOT NULL,      -- 'ph', 'turbidity', 'tds', 'lead', 'arsenic', 'nitrates', 'fluoride', 'chlorine', 'bacteria'
  unit TEXT NOT NULL,
  acceptable_min NUMERIC,
  acceptable_max NUMERIC,
  qualitative_req TEXT,
  standard_version TEXT,
  source_url TEXT,
  effective_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ref_standards_code ON public.reference_standards(parameter_code);
CREATE INDEX IF NOT EXISTS idx_ref_standards_name ON public.reference_standards(standard_name);

-- 4. Create Test Sessions Table
CREATE TABLE IF NOT EXISTS public.test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  water_source_id UUID NOT NULL REFERENCES public.water_sources(id) ON DELETE CASCADE,
  reference_standard_id UUID REFERENCES public.reference_standards(id) ON DELETE SET NULL,
  test_date DATE DEFAULT CURRENT_DATE NOT NULL,
  assessment_status TEXT DEFAULT 'pending' NOT NULL, -- 'pending', 'complete', 'flagged'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_test_sessions_user_id ON public.test_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_test_sessions_water_source_id ON public.test_sessions(water_source_id);

-- 5. Create Parameter Readings Table
CREATE TABLE IF NOT EXISTS public.parameter_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  parameter_code TEXT NOT NULL,
  measured_value NUMERIC,
  unit TEXT,
  evaluation_status TEXT DEFAULT 'not_tested' NOT NULL, -- 'normal', 'elevated', 'below_min', 'not_tested', 'invalid'
  reference_min NUMERIC,
  reference_max NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_param_readings_session ON public.parameter_readings(test_session_id);

-- 6. Create Treatment Compatibility Table
CREATE TABLE IF NOT EXISTS public.treatment_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_method TEXT NOT NULL,     -- 'boiling', 'ro', 'uv', 'activated_carbon', 'chlorination', 'sand_filter', 'distillation', 'none'
  parameter_code TEXT NOT NULL,       -- 'ph', 'turbidity', 'tds', 'lead', 'arsenic', 'nitrates', 'fluoride', 'chlorine', 'bacteria'
  effectiveness_level TEXT NOT NULL,  -- 'effective', 'partial', 'ineffective', 'unknown'
  effectiveness_summary TEXT NOT NULL,
  limitations TEXT,
  validation_source TEXT,
  last_reviewed_at DATE DEFAULT CURRENT_DATE
);
CREATE INDEX IF NOT EXISTS idx_treatment_compat ON public.treatment_compatibility(treatment_method, parameter_code);

-- 7. Create Generated Reports Table
CREATE TABLE IF NOT EXISTS public.generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
  summary TEXT,
  risk_explanations JSONB,
  treatment_assessment JSONB,
  recommended_actions JSONB,
  model_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_session ON public.generated_reports(test_session_id);

-- ====================================================================
-- Enable Row Level Security (RLS)
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parameter_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generated_reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view and update own profile" ON public.profiles;
CREATE POLICY "Users can view and update own profile" ON public.profiles
  FOR ALL TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Water Sources Policies
DROP POLICY IF EXISTS "Users manage own water sources" ON public.water_sources;
CREATE POLICY "Users manage own water sources" ON public.water_sources
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Test Sessions Policies
DROP POLICY IF EXISTS "Users manage own test sessions" ON public.test_sessions;
CREATE POLICY "Users manage own test sessions" ON public.test_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Parameter Readings Policies
DROP POLICY IF EXISTS "Users manage readings via session" ON public.parameter_readings;
CREATE POLICY "Users manage readings via session" ON public.parameter_readings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = parameter_readings.test_session_id AND ts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = parameter_readings.test_session_id AND ts.user_id = auth.uid()
    )
  );

-- Generated Reports Policies
DROP POLICY IF EXISTS "Users view reports via session" ON public.generated_reports;
CREATE POLICY "Users view reports via session" ON public.generated_reports
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = generated_reports.test_session_id AND ts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.test_sessions ts
      WHERE ts.id = generated_reports.test_session_id AND ts.user_id = auth.uid()
    )
  );

-- Public Reference Standards (Read-only for authenticated and public)
DROP POLICY IF EXISTS "Allow read access to reference standards" ON public.reference_standards;
CREATE POLICY "Allow read access to reference standards" ON public.reference_standards
  FOR SELECT TO authenticated, anon
  USING (true);

-- Public Treatment Compatibility (Read-only for authenticated and public)
DROP POLICY IF EXISTS "Allow read access to treatment compatibility" ON public.treatment_compatibility;
CREATE POLICY "Allow read access to treatment compatibility" ON public.treatment_compatibility
  FOR SELECT TO authenticated, anon
  USING (true);

-- ====================================================================
-- Automated User Profile Creation Hook
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

