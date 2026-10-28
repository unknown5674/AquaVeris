import { WATER_PARAMETERS } from "@/features/tests/constants"

export interface ParameterDelta {
  code: string
  name: string
  unit: string
  baselineValue: number
  simulatedValue: number
  percentChange: number
  isConcentrated: boolean
  baselineStatus: "normal" | "flagged"
  simulatedStatus: "normal" | "flagged"
  thresholdMax: number | null
  thresholdMin: number | null
}

export interface SimulationResult {
  treatmentMethod: string
  treatmentLabel: string
  baselineSafeCount: number
  simulatedSafeCount: number
  totalParameters: number
  baselineScore: number // 0 - 100
  simulatedScore: number // 0 - 100
  criticalWarnings: string[]
  keyBenefits: string[]
  remainingGaps: string[]
  parameterDeltas: ParameterDelta[]
}

export interface SimulatorPreset {
  id: string
  name: string
  description: string
  sourceType: string
  readings: Record<string, number>
}

export const SIMULATOR_PRESETS: SimulatorPreset[] = [
  {
    id: "agricultural_well",
    name: "Agricultural Borewell",
    description: "High nitrates from fertilizer runoff and microbial bacterial count.",
    sourceType: "borewell",
    readings: {
      ph: 7.2,
      turbidity: 3.5,
      tds: 480,
      lead: 0.003,
      arsenic: 0.002,
      nitrates: 78.0, // High! (Limit 50)
      fluoride: 0.9,
      chlorine: 0.0,
      bacteria: 18,   // High! (Limit 0)
    },
  },
  {
    id: "aging_plumbing",
    name: "Older Municipal Tap",
    description: "Corroded lead service lines and high sediment cloudiness.",
    sourceType: "municipal",
    readings: {
      ph: 6.8,
      turbidity: 5.4, // High! (Limit 4.0)
      tds: 310,
      lead: 0.028,   // High! (Limit 0.01)
      arsenic: 0.001,
      nitrates: 22.0,
      fluoride: 0.7,
      chlorine: 0.4,
      bacteria: 0,
    },
  },
  {
    id: "hard_groundwater",
    name: "Deep Mineral Aquifer",
    description: "Severe mineral hardness, toxic arsenic and fluoride concentration.",
    sourceType: "borewell",
    readings: {
      ph: 8.3,
      turbidity: 1.8,
      tds: 1150,      // High! (Limit 600)
      lead: 0.004,
      arsenic: 0.022, // High! (Limit 0.01)
      nitrates: 34.0,
      fluoride: 2.6,  // High! (Limit 1.5)
      chlorine: 0.0,
      bacteria: 0,
    },
  },
  {
    id: "river_monsoon",
    name: "Post-Monsoon Surface Water",
    description: "Heavy silt turbidity, organic matter, and fecal bacterial load.",
    sourceType: "river",
    readings: {
      ph: 7.6,
      turbidity: 12.0, // Very High!
      tds: 280,
      lead: 0.005,
      arsenic: 0.001,
      nitrates: 42.0,
      fluoride: 0.4,
      chlorine: 0.0,
      bacteria: 45,    // Very High!
    },
  },
]

export interface TreatmentOption {
  id: string
  label: string
  category: "thermal" | "filtration" | "membrane" | "chemical" | "radiation"
  description: string
  efficiencyMap: Record<string, number> // negative = reduction, positive = concentration
  warnings: string[]
  strengths: string[]
}

export const SIMULATION_TREATMENTS: TreatmentOption[] = [
  {
    id: "boiling",
    label: "Rolling Boil (1-3 min)",
    category: "thermal",
    description: "Thermal pasteurization kills living microbes. Water evaporation concentrates chemical ions.",
    efficiencyMap: {
      bacteria: -1.0,    // 100% killed
      turbidity: 0.0,    // no change
      tds: 0.12,         // +12% concentrated
      lead: 0.12,        // +12% concentrated!
      arsenic: 0.12,     // +12% concentrated!
      nitrates: 0.12,    // +12% concentrated!
      fluoride: 0.12,    // +12% concentrated!
      chlorine: -0.9,    // evaporated gas
      ph: 0.0,
    },
    warnings: [
      "HAZARD: Boiling does not remove heavy metals, nitrates, or fluoride — water evaporation concentrates them by ~10-15%.",
      "Does not remove sediment, suspended particles, or microplastics.",
    ],
    strengths: [
      "Eliminates 100% of bacterial pathogens, cysts, and viruses.",
      "Requires no electricity or filter cartridge replacements.",
    ],
  },
  {
    id: "carbon_pitcher",
    label: "Activated Carbon Pitcher",
    category: "filtration",
    description: "Adsorbs organic chemicals, chlorine taste, and bad odours. Ineffective against dissolved salts or bacteria.",
    efficiencyMap: {
      bacteria: 0.0,     // 0%
      turbidity: -0.45,  // -45%
      tds: -0.05,        // -5%
      lead: -0.30,       // -30% (standard carbon)
      arsenic: -0.05,    // negligible
      nitrates: 0.0,     // ineffective
      fluoride: 0.0,     // ineffective
      chlorine: -0.95,   // -95%
      ph: 0.0,
    },
    warnings: [
      "Does NOT disinfect microbial pathogens (E. coli, coliforms remain active).",
      "Cannot remove nitrates or fluoride from groundwater.",
      "Filter saturation can cause bacteria colonization if not changed regularly.",
    ],
    strengths: [
      "Excellent removal of free chlorine and volatile organic compounds (VOCs).",
      "Substantially improves taste, smell, and clarity.",
    ],
  },
  {
    id: "reverse_osmosis",
    label: "5-Stage RO + UV Purifier",
    category: "membrane",
    description: "Semi-permeable membrane (0.0001 micron) + UV disinfection chamber. The gold standard for multi-threat water.",
    efficiencyMap: {
      bacteria: -1.0,    // 100% UV + membrane
      turbidity: -0.98,  // -98%
      tds: -0.92,        // -92%
      lead: -0.98,       // -98%
      arsenic: -0.95,    // -95%
      nitrates: -0.90,   // -90%
      fluoride: -0.92,   // -92%
      chlorine: -0.98,   // -98%
      ph: -0.05,         // slightly drops pH
    },
    warnings: [
      "Produces wastewater reject (approx. 2-3L per 1L purified water in standard units).",
      "Demineralizes water: ensure your system includes a remineralization / TDS controller cartridge.",
    ],
    strengths: [
      "Removes 90-98% of toxic heavy metals, arsenic, nitrates, and fluoride.",
      "Dual biological safeguard via physical membrane + UV germicidal lamp.",
    ],
  },
  {
    id: "chlorination",
    label: "Chlorine Disinfection",
    category: "chemical",
    description: "Sodium hypochlorite or chlorine tablets oxidize pathogens and leave protective residual.",
    efficiencyMap: {
      bacteria: -0.999,  // 99.9%
      turbidity: 0.0,
      tds: 0.02,
      lead: 0.0,
      arsenic: 0.0,
      nitrates: 0.0,
      fluoride: 0.0,
      chlorine: 0.8,     // sets residual to safe disinfecting level
      ph: 0.0,
    },
    warnings: [
      "Zero effect on chemical contaminants (lead, nitrates, fluoride, arsenic).",
      "Leaves noticeable chemical chlorine taste if not aerated or filtered.",
    ],
    strengths: [
      "Provides ongoing residual disinfection preventing recontamination in storage tanks.",
      "Extremely cost-effective for rural or emergency biological outbreaks.",
    ],
  },
  {
    id: "ultrafiltration",
    label: "Ultrafiltration (UF Gravity)",
    category: "filtration",
    description: "Hollow fiber membrane (0.01 micron) filters out bacteria and suspended turbidity without electricity.",
    efficiencyMap: {
      bacteria: -0.999,  // 99.9%
      turbidity: -0.95,  // -95%
      tds: 0.0,          // ions pass through
      lead: -0.10,       // only particulate lead
      arsenic: 0.0,
      nitrates: 0.0,
      fluoride: 0.0,
      chlorine: 0.0,
      ph: 0.0,
    },
    warnings: [
      "Does not remove dissolved chemical ions, salts, nitrates, or heavy metals.",
    ],
    strengths: [
      "Zero electricity required; retains natural healthy minerals while removing bacteria.",
      "Zero water wastage compared to RO.",
    ],
  },
]

// WHO Drinking Water Limits
const WHO_THRESHOLDS: Record<string, { min: number | null; max: number | null }> = {
  ph: { min: 6.5, max: 8.5 },
  turbidity: { min: null, max: 4.0 },
  tds: { min: null, max: 600 },
  lead: { min: null, max: 0.01 },
  arsenic: { min: null, max: 0.01 },
  nitrates: { min: null, max: 50.0 },
  fluoride: { min: null, max: 1.5 },
  chlorine: { min: 0.2, max: 5.0 },
  bacteria: { min: null, max: 0 },
}

export function simulateTreatmentImpact(
  baselineReadings: Record<string, number>,
  treatmentId: string
): SimulationResult {
  const treatment =
    SIMULATION_TREATMENTS.find((t) => t.id === treatmentId) ?? SIMULATION_TREATMENTS[0]

  const parameterDeltas: ParameterDelta[] = []
  let baselineFlagged = 0
  let simulatedFlagged = 0
  const criticalWarnings: string[] = [...treatment.warnings]
  const keyBenefits: string[] = [...treatment.strengths]
  const remainingGaps: string[] = []

  for (const param of WATER_PARAMETERS) {
    const rawVal = baselineReadings[param.code]
    if (rawVal === undefined || isNaN(rawVal)) continue

    const threshold = WHO_THRESHOLDS[param.code] || { min: null, max: null }
    const efficiency = treatment.efficiencyMap[param.code] ?? 0.0

    // Compute simulated value
    let simVal = rawVal
    if (efficiency < 0) {
      // Reduction
      simVal = rawVal * (1 + efficiency)
    } else if (efficiency > 0) {
      // Concentration or addition
      if (param.code === "chlorine" && treatment.id === "chlorination") {
        simVal = 1.0 // typical residual addition
      } else {
        simVal = rawVal * (1 + efficiency)
      }
    }

    // Round according to precision
    if (param.step === "0.001") simVal = Math.round(simVal * 1000) / 1000
    else if (param.step === "0.05" || param.step === "0.1") simVal = Math.round(simVal * 10) / 10
    else simVal = Math.round(simVal)

    // Evaluate baseline status
    const isBaselineNormal =
      (threshold.max === null || rawVal <= threshold.max) &&
      (threshold.min === null || rawVal >= threshold.min)
    const baselineStatus: "normal" | "flagged" = isBaselineNormal ? "normal" : "flagged"
    if (!isBaselineNormal) baselineFlagged++

    // Evaluate simulated status
    const isSimulatedNormal =
      (threshold.max === null || simVal <= threshold.max) &&
      (threshold.min === null || simVal >= threshold.min)
    const simulatedStatus: "normal" | "flagged" = isSimulatedNormal ? "normal" : "flagged"
    if (!isSimulatedNormal) {
      simulatedFlagged++
      remainingGaps.push(
        `${param.name} remains above guideline (${simVal} ${param.defaultUnit} vs limit ${threshold.max})`
      )
    }

    const pctChange = rawVal !== 0 ? Math.round(((simVal - rawVal) / rawVal) * 100) : 0
    const isConcentrated = simVal > rawVal && !isBaselineNormal

    parameterDeltas.push({
      code: param.code,
      name: param.name,
      unit: param.defaultUnit,
      baselineValue: rawVal,
      simulatedValue: Math.max(0, simVal),
      percentChange: pctChange,
      isConcentrated,
      baselineStatus,
      simulatedStatus,
      thresholdMax: threshold.max,
      thresholdMin: threshold.min,
    })
  }

  const total = parameterDeltas.length
  const baselineSafe = total - baselineFlagged
  const simulatedSafe = total - simulatedFlagged

  const baselineScore = total > 0 ? Math.round((baselineSafe / total) * 100) : 100
  const simulatedScore = total > 0 ? Math.round((simulatedSafe / total) * 100) : 100

  return {
    treatmentMethod: treatment.id,
    treatmentLabel: treatment.label,
    baselineSafeCount: baselineSafe,
    simulatedSafeCount: simulatedSafe,
    totalParameters: total,
    baselineScore,
    simulatedScore,
    criticalWarnings,
    keyBenefits,
    remainingGaps,
    parameterDeltas,
  }
}

