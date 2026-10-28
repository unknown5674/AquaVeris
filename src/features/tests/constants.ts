export interface ParameterConfig {
  code: string
  name: string
  category: "physical" | "chemical" | "microbiological"
  defaultUnit: string
  availableUnits: string[]
  step: string
  placeholder: string
  description: string
  whoLimit: string
  bisLimit: string
}

export const WATER_PARAMETERS: ParameterConfig[] = [
  {
    code: "ph",
    name: "pH Level",
    category: "physical",
    defaultUnit: "pH units",
    availableUnits: ["pH units"],
    step: "0.1",
    placeholder: "6.5 - 8.5",
    description: "Measure of how acidic or alkaline the water is.",
    whoLimit: "6.5 - 8.5",
    bisLimit: "6.5 - 8.5",
  },
  {
    code: "turbidity",
    name: "Turbidity (Clarity)",
    category: "physical",
    defaultUnit: "NTU",
    availableUnits: ["NTU", "FNU", "JTU"],
    step: "0.1",
    placeholder: "< 1.0 NTU",
    description: "Suspended particles, silt, or cloudiness in water.",
    whoLimit: "Max 4.0 NTU (ideally < 1)",
    bisLimit: "Max 1.0 NTU (relax to 5)",
  },
  {
    code: "tds",
    name: "Total Dissolved Solids (TDS)",
    category: "physical",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    step: "1",
    placeholder: "e.g. 250",
    description: "Total dissolved inorganic salts and minerals.",
    whoLimit: "Max 600 mg/L",
    bisLimit: "Max 500 mg/L (relax to 2000)",
  },
  {
    code: "lead",
    name: "Lead (Pb)",
    category: "chemical",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ug/L", "ppb", "ppm"],
    step: "0.001",
    placeholder: "< 0.01 mg/L",
    description: "Toxic heavy metal from corroded plumbing and service pipes.",
    whoLimit: "Max 0.01 mg/L (10 ppb)",
    bisLimit: "Max 0.01 mg/L (no relaxation)",
  },
  {
    code: "arsenic",
    name: "Arsenic (As)",
    category: "chemical",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ug/L", "ppb", "ppm"],
    step: "0.001",
    placeholder: "< 0.01 mg/L",
    description: "Naturally occurring toxic metalloid common in deep borewells.",
    whoLimit: "Max 0.01 mg/L (10 ppb)",
    bisLimit: "Max 0.01 mg/L (relax to 0.05)",
  },
  {
    code: "nitrates",
    name: "Nitrates (NO3)",
    category: "chemical",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    step: "0.1",
    placeholder: "< 45 - 50 mg/L",
    description: "Agricultural fertilizer runoff or sewage contamination indicator.",
    whoLimit: "Max 50 mg/L",
    bisLimit: "Max 45 mg/L (no relaxation)",
  },
  {
    code: "fluoride",
    name: "Fluoride (F)",
    category: "chemical",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    step: "0.1",
    placeholder: "0.5 - 1.5 mg/L",
    description: "Mineral causing dental or skeletal fluorosis in excess.",
    whoLimit: "Max 1.5 mg/L",
    bisLimit: "Max 1.0 mg/L (relax to 1.5)",
  },
  {
    code: "chlorine",
    name: "Free Residual Chlorine",
    category: "chemical",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    step: "0.05",
    placeholder: "0.2 - 2.0 mg/L",
    description: "Active disinfectant residual safeguarding municipal supply.",
    whoLimit: "0.2 - 5.0 mg/L",
    bisLimit: "0.2 - 1.0 mg/L",
  },
  {
    code: "bacteria",
    name: "E. coli / Coliform Count",
    category: "microbiological",
    defaultUnit: "CFU/100mL",
    availableUnits: ["CFU/100mL", "MPN/100mL"],
    step: "1",
    placeholder: "0 (Must not be detectable)",
    description: "Pathogenic indicator for fecal and microbial contamination.",
    whoLimit: "0 CFU/100mL",
    bisLimit: "0 CFU/100mL",
  },
]

