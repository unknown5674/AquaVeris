import { normalizeUnit } from "./unit-converter"

export type ParameterEvaluationStatus =
  | "normal"
  | "elevated"
  | "below_min"
  | "not_tested"
  | "invalid"

export interface EvaluatedParameterResult {
  parameterCode: string
  measuredValue: number | null
  unit: string | null
  normalizedValue: number | null
  standardUnit: string
  status: ParameterEvaluationStatus
  acceptableMin: number | null
  acceptableMax: number | null
  message: string
}

export interface SessionEvaluationSummary {
  status: "complete" | "flagged"
  totalTested: number
  normalCount: number
  flaggedCount: number
  results: EvaluatedParameterResult[]
}

interface ReferenceThreshold {
  parameter_code: string
  acceptable_min: number | null
  acceptable_max: number | null
  unit: string
}

export function evaluateReadings(
  readings: Array<{ parameterCode: string; value: number | null; unit: string; notTested: boolean }>,
  standards: ReferenceThreshold[]
): SessionEvaluationSummary {
  const standardMap = new Map<string, ReferenceThreshold>()
  for (const s of standards) {
    standardMap.set(s.parameter_code, s)
  }

  const results: EvaluatedParameterResult[] = []
  let normalCount = 0
  let flaggedCount = 0
  let totalTested = 0

  for (const item of readings) {
    if (item.notTested || item.value === null || isNaN(item.value)) {
      results.push({
        parameterCode: item.parameterCode,
        measuredValue: null,
        unit: item.unit,
        normalizedValue: null,
        standardUnit: item.unit,
        status: "not_tested",
        acceptableMin: null,
        acceptableMax: null,
        message: "Not measured in this assessment",
      })
      continue
    }

    totalTested += 1
    const normalized = normalizeUnit(item.parameterCode, item.value, item.unit)
    const threshold = standardMap.get(item.parameterCode)

    if (!threshold) {
      results.push({
        parameterCode: item.parameterCode,
        measuredValue: item.value,
        unit: item.unit,
        normalizedValue: normalized.normalizedValue,
        standardUnit: normalized.normalizedUnit,
        status: "normal",
        acceptableMin: null,
        acceptableMax: null,
        message: "No specific guideline threshold established",
      })
      normalCount += 1
      continue
    }

    const val = normalized.normalizedValue!
    const min = threshold.acceptable_min
    const max = threshold.acceptable_max

    let status: ParameterEvaluationStatus = "normal"
    let message = "Within recommended guideline limits"

    if (max !== null && val > max) {
      status = "elevated"
      message = `Exceeds maximum guideline threshold of ${max} ${normalized.normalizedUnit}`
      flaggedCount += 1
    } else if (min !== null && val < min) {
      status = "below_min"
      message = `Below minimum recommended threshold of ${min} ${normalized.normalizedUnit}`
      flaggedCount += 1
    } else {
      normalCount += 1
    }

    results.push({
      parameterCode: item.parameterCode,
      measuredValue: item.value,
      unit: item.unit,
      normalizedValue: val,
      standardUnit: normalized.normalizedUnit,
      status,
      acceptableMin: min,
      acceptableMax: max,
      message,
    })
  }

  return {
    status: flaggedCount > 0 ? "flagged" : "complete",
    totalTested,
    normalCount,
    flaggedCount,
    results,
  }
}

