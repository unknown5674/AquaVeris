export const SOURCE_TYPES = [
  { value: "municipal", label: "Municipal / Piped Tap Water" },
  { value: "borewell", label: "Deep Borewell" },
  { value: "groundwater_well", label: "Open Dug Well / Groundwater" },
  { value: "bottled", label: "Packaged / Bottled Jar Water" },
  { value: "surface_water", label: "River, Lake, or Pond" },
  { value: "rainwater", label: "Harvested Rainwater" },
  { value: "other", label: "Other Source" },
] as const

export const TREATMENT_METHODS = [
  { value: "none", label: "None / Raw Water (Directly Consumed)" },
  { value: "boiling", label: "Boiling (Rolling Boil)" },
  { value: "ro", label: "Reverse Osmosis (RO) Purifier" },
  { value: "uv", label: "Ultraviolet (UV) Disinfection" },
  { value: "activated_carbon", label: "Activated Carbon Candle / Filter" },
  { value: "chlorination", label: "Chlorination / Disinfectant Tablets" },
  { value: "sand_filter", label: "Sand / Gravity Sediment Filter" },
  { value: "distillation", label: "Distillation Unit" },
  { value: "other", label: "Other Treatment Method" },
] as const

