export interface NormalizedReading {
  parameterCode: string
  originalValue: number | null
  originalUnit: string | null
  normalizedValue: number | null
  normalizedUnit: string
}

/**
 * Converts user entered units to reference standard units.
 * For example:
 *   lead: 10 ug/L -> 0.01 mg/L
 *   lead: 15 ppb -> 0.015 mg/L
 *   tds: 500 ppm -> 500 mg/L (1:1 aqueous approximation)
 */
export function normalizeUnit(
  parameterCode: string,
  value: number | null,
  unit: string | null
): NormalizedReading {
  if (value === null || isNaN(value)) {
    return {
      parameterCode,
      originalValue: null,
      originalUnit: unit,
      normalizedValue: null,
      normalizedUnit: getDefaultStandardUnit(parameterCode),
    }
  }

  const u = (unit ?? "").toLowerCase().trim()
  let normalizedValue = value
  let normalizedUnit = getDefaultStandardUnit(parameterCode)

  switch (parameterCode) {
    case "lead":
    case "arsenic":
      // Standard target is mg/L
      if (u === "ug/l" || u === "ppb" || u === "µg/l") {
        normalizedValue = value / 1000.0
        normalizedUnit = "mg/L"
      } else {
        normalizedValue = value
        normalizedUnit = "mg/L"
      }
      break

    case "tds":
    case "nitrates":
    case "fluoride":
    case "chlorine":
      // ppm and mg/L are equivalent for dilute water solutions
      normalizedValue = value
      normalizedUnit = "mg/L"
      break

    case "turbidity":
      // NTU is the standard benchmark
      normalizedValue = value
      normalizedUnit = "NTU"
      break

    case "bacteria":
      normalizedValue = value
      normalizedUnit = "CFU/100mL"
      break

    default:
      normalizedValue = value
      normalizedUnit = unit ?? ""
      break
  }

  return {
    parameterCode,
    originalValue: value,
    originalUnit: unit,
    normalizedValue,
    normalizedUnit,
  }
}

function getDefaultStandardUnit(paramCode: string): string {
  switch (paramCode) {
    case "ph":
      return "pH units"
    case "turbidity":
      return "NTU"
    case "bacteria":
      return "CFU/100mL"
    default:
      return "mg/L"
  }
}

