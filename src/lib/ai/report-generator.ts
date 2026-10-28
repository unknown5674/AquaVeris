import { GoogleGenerativeAI } from "@google/generative-ai"
import { z } from "zod"

export const aiReportSchema = z.object({
  executiveSummary: z.string(),
  riskLevel: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  parameterInsights: z.array(
    z.object({
      parameterCode: z.string(),
      status: z.string(),
      plainExplanation: z.string(),
      healthRelevance: z.string(),
    })
  ),
  treatmentCompatibilityAssessment: z.object({
    overallAssessment: z.string(),
    criticalWarnings: z.array(z.string()),
    recommendedMethodAdjustments: z.array(z.string()),
  }),
  contaminationDetectiveHypotheses: z.array(
    z.object({
      hypothesis: z.string(),
      plausibility: z.enum(["PLAUSIBLE", "POSSIBLE", "UNLIKELY"]),
      evidenceBasis: z.string(),
    })
  ),
  actionPlan: z.array(
    z.object({
      priority: z.number(),
      title: z.string(),
      description: z.string(),
      timeframe: z.string(),
    })
  ),
  followUpTestsSuggested: z.array(z.string()),
})

export type AIReportData = z.infer<typeof aiReportSchema>

export interface GenerateReportPayload {
  sourceName: string
  sourceType: string
  treatmentMethod: string
  standardName: string
  evaluatedReadings: Array<{
    parameterCode: string
    parameterName: string
    measuredValue: number | null
    unit: string | null
    status: string
    limit: string
  }>
  treatmentGaps: Array<{
    parameterName: string
    effectivenessLevel: string
    summary: string
    isDangerousPractice: boolean
  }>
  contextObservations?: {
    recentRainfall?: boolean
    tasteSmellChange?: string
  }
}

/**
 * Invokes Google Gemini API to translate deterministic water rules & treatment gaps
 * into plain-language guidance, contamination hypotheses, and personalized action plans.
 */
export async function generateAIWaterReport(
  payload: GenerateReportPayload
): Promise<AIReportData> {
  const apiKey = process.env.AI_API_KEY
  const modelName = process.env.AI_MODEL_NAME || "gemini-1.5-flash"

  // Graceful fallback if no Gemini key is provided in development
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return generateLocalFallbackReport(payload)
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      },
    })

    const prompt = `
You are the AI Intelligence Engine for "AquaVeris" — an educational water quality intelligence and treatment guidance web application.
You must analyze the verified rule-engine results and treatment gaps below and output a strictly valid JSON response adhering to this schema:

{
  "executiveSummary": "string (clear 2-3 sentence overview of water safety and key findings)",
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "parameterInsights": [
    {
      "parameterCode": "string",
      "status": "string",
      "plainExplanation": "string (plain English explanation of what this reading means for everyday consumption)",
      "healthRelevance": "string (potential health considerations or why this parameter matters)"
    }
  ],
  "treatmentCompatibilityAssessment": {
    "overallAssessment": "string (evaluation of whether current treatment method works for these specific readings)",
    "criticalWarnings": ["string (e.g. warning if boiling water with high nitrates concentrates the nitrate)"],
    "recommendedMethodAdjustments": ["string"]
  },
  "contaminationDetectiveHypotheses": [
    {
      "hypothesis": "string (plausible explanation for why this contaminant may be present, framed strictly as an educational hypothesis, not a definitive diagnosis)",
      "plausibility": "PLAUSIBLE" | "POSSIBLE" | "UNLIKELY",
      "evidenceBasis": "string"
    }
  ],
  "actionPlan": [
    {
      "priority": 1,
      "title": "string",
      "description": "string",
      "timeframe": "string (e.g. Immediate, Within 24-48 hours, Within 1 week)"
    }
  ],
  "followUpTestsSuggested": ["string"]
}

STRICT SAFETY AND SCIENTIFIC RULES:
1. Do not declare water 100% safe if parameters were marked 'Not Tested'.
2. If boiling is used and nitrates or lead are elevated, prominently explain that boiling DOES NOT remove heavy metals or nitrates and will CONCENTRATE them as water evaporates.
3. Frame all contamination causes as HYPOTHESES requiring physical inspection or accredited testing.
4. Always prioritize urgent bottled/alternative safe water advisories if microbial bacteria, high lead, or high nitrates are detected.

USER WATER QUALITY DATA:
- Source Name: ${payload.sourceName}
- Source Type: ${payload.sourceType}
- Applied Treatment: ${payload.treatmentMethod}
- Reference Standard: ${payload.standardName}
- Observations: Recent heavy rain=${payload.contextObservations?.recentRainfall ? "YES" : "NO"}; Odor/Taste notes="${payload.contextObservations?.tasteSmellChange || "None reported"}"

EVALUATED PARAMETERS:
${JSON.stringify(payload.evaluatedReadings, null, 2)}

DETECTED TREATMENT GAPS:
${JSON.stringify(payload.treatmentGaps, null, 2)}
`

    const generatePromise = model.generateContent(prompt)
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI generation timeout exceeded 5s")), 5000)
    )

    const response = await Promise.race([generatePromise, timeoutPromise])
    let text = response.response.text().trim()
    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim()
    }
    const parsedJson = JSON.parse(text)
    return aiReportSchema.parse(parsedJson)
  } catch (error) {
    console.error("Gemini AI API call failed, using deterministic fallback:", error)
    return generateLocalFallbackReport(payload)
  }
}

/**
 * Deterministic fallback generator if offline or API key missing
 */
function generateLocalFallbackReport(payload: GenerateReportPayload): AIReportData {
  const flagged = payload.evaluatedReadings.filter(
    (r) => r.status === "elevated" || r.status === "below_min"
  )
  const isHighRisk = flagged.length > 0 || payload.treatmentGaps.length > 0

  return {
    executiveSummary: isHighRisk
      ? `Analysis against ${payload.standardName} identified ${flagged.length} parameter(s) requiring attention for "${payload.sourceName}". There are ${payload.treatmentGaps.length} treatment compatibility gap(s) identified with ${payload.treatmentMethod}.`
      : `All tested parameters for "${payload.sourceName}" are currently within acceptable limits defined by ${payload.standardName}.`,
    riskLevel: isHighRisk ? "HIGH" : "LOW",
    parameterInsights: payload.evaluatedReadings.map((r) => ({
      parameterCode: r.parameterCode,
      status: r.status,
      plainExplanation:
        r.status === "elevated"
          ? `${r.parameterName} reading of ${r.measuredValue} ${r.unit} exceeds the guideline limit (${r.limit}).`
          : r.status === "not_tested"
          ? `${r.parameterName} was not tested in this assessment.`
          : `${r.parameterName} is compliant with standard guidelines.`,
      healthRelevance:
        r.status === "elevated"
          ? `Elevated levels of ${r.parameterName} can affect taste, pipe longevity, or health depending on prolonged exposure.`
          : `Standard baseline monitoring helps track long-term drinking safety.`,
    })),
    treatmentCompatibilityAssessment: {
      overallAssessment:
        payload.treatmentGaps.length > 0
          ? `Your current treatment method (${payload.treatmentMethod}) does not adequately remove all detected contaminants.`
          : `Your treatment method (${payload.treatmentMethod}) appears compatible with the tested parameter profile.`,
      criticalWarnings: payload.treatmentGaps
        .filter((g) => g.isDangerousPractice)
        .map(
          (g) =>
            `CRITICAL WARNING: Boiling water does NOT remove ${g.parameterName}. Evaporation can concentrate contaminants.`
        ),
      recommendedMethodAdjustments: payload.treatmentGaps.map(
        (g) => `Consider multi-barrier filtration or RO certified for ${g.parameterName}.`
      ),
    },
    contaminationDetectiveHypotheses: flagged.map((f) => ({
      hypothesis: `Potential environmental or conveyance infiltration causing elevated ${f.parameterName}.`,
      plausibility: "PLAUSIBLE" as const,
      evidenceBasis: `Reading measured at ${f.measuredValue} ${f.unit} vs limit of ${f.limit}.`,
    })),
    actionPlan: [
      {
        priority: 1,
        title: isHighRisk ? "Pause Direct Ingestion of Untreated Water" : "Maintain Scheduled Testing",
        description: isHighRisk
          ? "Switch to certified bottled or validated filtered water while investigating flagged readings."
          : "Continue periodic testing to establish a dependable seasonal baseline.",
        timeframe: isHighRisk ? "Immediate" : "Next 3-6 months",
      },
      {
        priority: 2,
        title: "Confirmatory Laboratory Analysis",
        description: "Submit a sample to an accredited water testing laboratory to confirm initial findings.",
        timeframe: "Within 48-72 hours",
      },
    ],
    followUpTestsSuggested: payload.evaluatedReadings
      .filter((r) => r.status === "not_tested")
      .map((r) => r.parameterName),
  }
}

