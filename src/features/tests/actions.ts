"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { evaluateReadings } from "@/lib/engine/evaluator"

const testSubmissionSchema = z.object({
  waterSourceId: z.string().uuid("Invalid water source ID"),
  standardName: z.enum(["WHO Guidelines", "BIS IS 10500"]),
  testDate: z.string().optional(),
  treatmentMethod: z.string().min(1),
  contextRainfall: z.boolean().default(false),
  contextTasteSmell: z.string().optional(),
  readings: z.array(
    z.object({
      parameterCode: z.string(),
      value: z.number().nullable(),
      unit: z.string(),
      notTested: z.boolean().default(false),
    })
  ),
})

export type TestSubmissionResult = {
  success?: boolean
  error?: string
  sessionId?: string
}

export async function submitWaterTestAction(
  payload: z.infer<typeof testSubmissionSchema>
): Promise<TestSubmissionResult> {
  const parsed = testSubmissionSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid assessment payload" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Authentication required to submit assessment" }
  }

  // 1. Fetch reference standards matching chosen standardName
  const { data: standards, error: stdError } = await (supabase.from("reference_standards") as any)
    .select("parameter_code, acceptable_min, acceptable_max, unit")
    .eq("standard_name", parsed.data.standardName)

  if (stdError || !standards || standards.length === 0) {
    return { error: "Could not load reference standard guidelines" }
  }

  // 2. Run deterministic rule engine
  const evaluation = evaluateReadings(parsed.data.readings, standards)

  // 3. Create test session record
  const { data: sessionData, error: sessionError } = await (supabase.from("test_sessions") as any)
    .insert({
      user_id: user.id,
      water_source_id: parsed.data.waterSourceId,
      test_date: parsed.data.testDate || new Date().toISOString().split("T")[0],
      assessment_status: evaluation.status,
    })
    .select("id")
    .single()

  if (sessionError || !sessionData) {
    return { error: sessionError?.message ?? "Failed to save test session" }
  }

  const sessionId = sessionData.id

  // 4. Batch insert parameter readings with their evaluation status
  const readingsToInsert = evaluation.results.map((res) => ({
    test_session_id: sessionId,
    parameter_code: res.parameterCode,
    measured_value: res.measuredValue,
    unit: res.unit,
    evaluation_status: res.status,
    reference_min: res.acceptableMin,
    reference_max: res.acceptableMax,
  }))

  const { error: readingsError } = await (supabase.from("parameter_readings") as any).insert(
    readingsToInsert
  )

  if (readingsError) {
    return { error: readingsError.message }
  }

  // 5. Update water source treatment if user modified it in step 3
  if (parsed.data.treatmentMethod) {
    await (supabase.from("water_sources") as any)
      .update({ treatment_method: parsed.data.treatmentMethod })
      .eq("id", parsed.data.waterSourceId)
      .eq("user_id", user.id)
  }

  // 6. Generate and save AI Report & Reality Check
  try {
    const { data: compatRecords } = await (supabase.from("treatment_compatibility") as any)
      .select("*")
      .eq("treatment_method", parsed.data.treatmentMethod.toLowerCase())

    const { checkTreatmentCompatibility } = await import("@/lib/engine/treatment-checker")
    const { generateAIWaterReport } = await import("@/lib/ai/report-generator")
    const { WATER_PARAMETERS } = await import("@/features/tests/constants")

    const flaggedParams = evaluation.results
      .filter((r) => r.status === "elevated" || r.status === "below_min")
      .map((r) => ({
        parameterCode: r.parameterCode,
        parameterName:
          WATER_PARAMETERS.find((p) => p.code === r.parameterCode)?.name ?? r.parameterCode,
      }))

    const realityCheck = checkTreatmentCompatibility(
      parsed.data.treatmentMethod,
      flaggedParams,
      compatRecords ?? []
    )

    // Fetch water source details for prompt
    const { data: srcData } = await (supabase.from("water_sources") as any)
      .select("source_name, source_type")
      .eq("id", parsed.data.waterSourceId)
      .single()

    const aiPayload = {
      sourceName: srcData?.source_name ?? "Monitored Water Supply",
      sourceType: srcData?.source_type ?? "General",
      treatmentMethod: parsed.data.treatmentMethod,
      standardName: parsed.data.standardName,
      evaluatedReadings: evaluation.results.map((r) => ({
        parameterCode: r.parameterCode,
        parameterName:
          WATER_PARAMETERS.find((p) => p.code === r.parameterCode)?.name ?? r.parameterCode,
        measuredValue: r.measuredValue,
        unit: r.unit,
        status: r.status,
        limit:
          r.acceptableMax !== null
            ? `Max ${r.acceptableMax} ${r.standardUnit}`
            : r.acceptableMin !== null
            ? `Min ${r.acceptableMin} ${r.standardUnit}`
            : "Guideline",
      })),
      treatmentGaps: realityCheck.gaps.map((g) => ({
        parameterName: g.parameterName,
        effectivenessLevel: g.effectivenessLevel,
        summary: g.summary,
        isDangerousPractice: g.isDangerousPractice,
      })),
      contextObservations: {
        recentRainfall: parsed.data.contextRainfall,
        tasteSmellChange: parsed.data.contextTasteSmell,
      },
    }

    const aiReport = await generateAIWaterReport(aiPayload)

    // Store in generated_reports table
    await (supabase.from("generated_reports") as any).insert({
      test_session_id: sessionId,
      summary: aiReport.executiveSummary,
      risk_explanations: aiReport.parameterInsights,
      treatment_assessment: {
        ...aiReport.treatmentCompatibilityAssessment,
        rawGaps: realityCheck.gaps,
      },
      recommended_actions: aiReport.actionPlan,
      model_metadata: {
        model: process.env.AI_MODEL_NAME || "gemini-1.5-flash",
        riskLevel: aiReport.riskLevel,
        detectiveHypotheses: aiReport.contaminationDetectiveHypotheses,
        followUpTestsSuggested: aiReport.followUpTestsSuggested,
      },
    })
  } catch (aiErr) {
    console.error("AI report generation non-fatal error:", aiErr)
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/sources")
  revalidatePath(`/dashboard/reports/${sessionId}`)

  return { success: true, sessionId }
}

