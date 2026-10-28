export interface TreatmentCompatibilityRecord {
  id: string
  treatment_method: string
  parameter_code: string
  effectiveness_level: "effective" | "partial" | "ineffective" | "unknown"
  effectiveness_summary: string
  limitations: string | null
  validation_source: string | null
}

export interface TreatmentGapResult {
  parameterCode: string
  parameterName: string
  treatmentMethod: string
  effectivenessLevel: "effective" | "partial" | "ineffective" | "unknown"
  summary: string
  limitationWarning: string | null
  isDangerousPractice: boolean
}

export interface SmartRealityCheckSummary {
  appliedMethod: string
  totalGaps: number
  hasCriticalGaps: boolean
  gaps: TreatmentGapResult[]
}

/**
 * Evaluates flagged contaminants against the user's active treatment method.
 * Detects severe mismatches, like boiling water contaminated with nitrates or lead.
 */
export function checkTreatmentCompatibility(
  treatmentMethod: string,
  flaggedParameters: Array<{ parameterCode: string; parameterName: string }>,
  compatibilityRecords: TreatmentCompatibilityRecord[]
): SmartRealityCheckSummary {
  const methodNorm = (treatmentMethod || "none").toLowerCase().trim()

  const compatMap = new Map<string, TreatmentCompatibilityRecord>()
  for (const rec of compatibilityRecords) {
    if (rec.treatment_method.toLowerCase() === methodNorm) {
      compatMap.set(rec.parameter_code.toLowerCase(), rec)
    }
  }

  const gaps: TreatmentGapResult[] = []

  for (const flagged of flaggedParameters) {
    const code = flagged.parameterCode.toLowerCase()
    const match = compatMap.get(code)

    if (!match) {
      // No specific matrix match -> treated as unknown gap
      gaps.push({
        parameterCode: flagged.parameterCode,
        parameterName: flagged.parameterName,
        treatmentMethod: methodNorm,
        effectivenessLevel: "unknown",
        summary: `Efficacy of "${methodNorm}" for reducing ${flagged.parameterName} is unverified or undocumented.`,
        limitationWarning: "Consider testing with a certified laboratory or adopting validated filtration methods.",
        isDangerousPractice: false,
      })
      continue
    }

    const isIneffective = match.effectiveness_level === "ineffective"
    const isPartial = match.effectiveness_level === "partial"

    // Boiling + Nitrate / Lead is an active danger because evaporation concentrates toxins
    const isBoilingHazard =
      methodNorm === "boiling" &&
      (code === "nitrates" || code === "lead" || code === "arsenic" || code === "tds")

    if (isIneffective || isPartial) {
      gaps.push({
        parameterCode: flagged.parameterCode,
        parameterName: flagged.parameterName,
        treatmentMethod: methodNorm,
        effectivenessLevel: match.effectiveness_level,
        summary: match.effectiveness_summary,
        limitationWarning: match.limitations,
        isDangerousPractice: isBoilingHazard,
      })
    }
  }

  const hasCriticalGaps = gaps.some(
    (g) => g.effectivenessLevel === "ineffective" || g.isDangerousPractice
  )

  return {
    appliedMethod: methodNorm,
    totalGaps: gaps.length,
    hasCriticalGaps,
    gaps,
  }
}

