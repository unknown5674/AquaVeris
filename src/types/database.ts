/**
 * Placeholder database types.
 * Replace with auto-generated types after running:
 *   pnpm supabase gen types typescript --project-id <your-project-ref> > src/types/database.ts
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          preferred_language: string
          created_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          preferred_language?: string
          created_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          preferred_language?: string
          created_at?: string
        }
      }
      water_sources: {
        Row: {
          id: string
          user_id: string
          source_name: string
          source_type: string
          treatment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source_name: string
          source_type: string
          treatment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source_name?: string
          source_type?: string
          treatment_method?: string | null
          created_at?: string
        }
      }
      test_sessions: {
        Row: {
          id: string
          user_id: string
          water_source_id: string
          reference_standard_id: string
          test_date: string
          assessment_status: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          water_source_id: string
          reference_standard_id: string
          test_date?: string
          assessment_status?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          water_source_id?: string
          reference_standard_id?: string
          test_date?: string
          assessment_status?: string
          created_at?: string
        }
      }
      parameter_readings: {
        Row: {
          id: string
          test_session_id: string
          parameter_code: string
          measured_value: number | null
          unit: string | null
          evaluation_status: string | null
          reference_min: number | null
          reference_max: number | null
        }
        Insert: {
          id?: string
          test_session_id: string
          parameter_code: string
          measured_value?: number | null
          unit?: string | null
          evaluation_status?: string | null
          reference_min?: number | null
          reference_max?: number | null
        }
        Update: {
          id?: string
          test_session_id?: string
          parameter_code?: string
          measured_value?: number | null
          unit?: string | null
          evaluation_status?: string | null
          reference_min?: number | null
          reference_max?: number | null
        }
      }
      reference_standards: {
        Row: {
          id: string
          standard_name: string
          parameter_code: string
          unit: string
          acceptable_min: number | null
          acceptable_max: number | null
          qualitative_req: string | null
          standard_version: string | null
          source_url: string | null
          effective_date: string | null
        }
        Insert: {
          id?: string
          standard_name: string
          parameter_code: string
          unit: string
          acceptable_min?: number | null
          acceptable_max?: number | null
          qualitative_req?: string | null
          standard_version?: string | null
          source_url?: string | null
          effective_date?: string | null
        }
        Update: {
          id?: string
          standard_name?: string
          parameter_code?: string
          unit?: string
          acceptable_min?: number | null
          acceptable_max?: number | null
          qualitative_req?: string | null
          standard_version?: string | null
          source_url?: string | null
          effective_date?: string | null
        }
      }
      treatment_compatibility: {
        Row: {
          id: string
          treatment_method: string
          parameter_code: string
          effectiveness_level: string
          effectiveness_summary: string
          limitations: string | null
          validation_source: string | null
          last_reviewed_at: string | null
        }
        Insert: {
          id?: string
          treatment_method: string
          parameter_code: string
          effectiveness_level: string
          effectiveness_summary: string
          limitations?: string | null
          validation_source?: string | null
          last_reviewed_at?: string | null
        }
        Update: {
          id?: string
          treatment_method?: string
          parameter_code?: string
          effectiveness_level?: string
          effectiveness_summary?: string
          limitations?: string | null
          validation_source?: string | null
          last_reviewed_at?: string | null
        }
      }
      generated_reports: {
        Row: {
          id: string
          test_session_id: string
          summary: string | null
          risk_explanations: Json | null
          treatment_assessment: Json | null
          recommended_actions: Json | null
          model_metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          test_session_id: string
          summary?: string | null
          risk_explanations?: Json | null
          treatment_assessment?: Json | null
          recommended_actions?: Json | null
          model_metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          test_session_id?: string
          summary?: string | null
          risk_explanations?: Json | null
          treatment_assessment?: Json | null
          recommended_actions?: Json | null
          model_metadata?: Json | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type WaterSource = Database["public"]["Tables"]["water_sources"]["Row"]
export type TestSession = Database["public"]["Tables"]["test_sessions"]["Row"]
export type ParameterReading = Database["public"]["Tables"]["parameter_readings"]["Row"]
export type ReferenceStandard = Database["public"]["Tables"]["reference_standards"]["Row"]
export type TreatmentCompatibility = Database["public"]["Tables"]["treatment_compatibility"]["Row"]
export type GeneratedReport = Database["public"]["Tables"]["generated_reports"]["Row"]

