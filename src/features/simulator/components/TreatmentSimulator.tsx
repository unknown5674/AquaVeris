"use client"

import { useState, useMemo } from "react"
import {
  SIMULATOR_PRESETS,
  SIMULATION_TREATMENTS,
  simulateTreatmentImpact,
  type SimulatorPreset,
} from "@/lib/engine/simulator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  Sliders,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Droplets,
  Flame,
  Filter,
  Zap,
  CheckCircle2,
  XCircle,
  TrendingDown,
  TrendingUp,
  Info,
  RotateCcw,
  Check,
  AlertCircle,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react"

interface TreatmentSimulatorProps {
  initialReadings?: Record<string, number>
  initialSourceName?: string
}

const PARAMETER_SLIDER_CONFIG: Record<string, { min: number; max: number; step: number }> = {
  ph: { min: 4.0, max: 11.0, step: 0.1 },
  turbidity: { min: 0, max: 25.0, step: 0.5 },
  tds: { min: 0, max: 2000, step: 10 },
  lead: { min: 0, max: 0.08, step: 0.001 },
  arsenic: { min: 0, max: 0.08, step: 0.001 },
  nitrates: { min: 0, max: 150, step: 1 },
  fluoride: { min: 0, max: 8.0, step: 0.1 },
  chlorine: { min: 0, max: 5.0, step: 0.1 },
  bacteria: { min: 0, max: 100, step: 1 },
}

const PRESET_HIGHLIGHTS: Record<string, string> = {
  agricultural_well: "Nitrates: 78 mg/L • Bacteria",
  aging_plumbing: "Lead: 0.028 mg/L • Silt",
  hard_groundwater: "TDS: 1150 • Arsenic • Fluoride",
  river_monsoon: "Turbidity: 12 NTU • Bacteria: 45",
}

export default function TreatmentSimulator({
  initialReadings,
  initialSourceName,
}: TreatmentSimulatorProps) {
  const defaultPreset = SIMULATOR_PRESETS[0]
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialReadings ? "custom_session" : defaultPreset.id
  )

  const [readings, setReadings] = useState<Record<string, number>>(
    initialReadings ?? defaultPreset.readings
  )

  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>("boiling")

  const simulation = useMemo(() => {
    return simulateTreatmentImpact(readings, selectedTreatmentId)
  }, [readings, selectedTreatmentId])

  function handleSelectPreset(preset: SimulatorPreset) {
    setSelectedPresetId(preset.id)
    setReadings({ ...preset.readings })
  }

  function handleReadingChange(code: string, value: number) {
    setSelectedPresetId("custom")
    setReadings((prev) => ({
      ...prev,
      [code]: Math.max(0, value),
    }))
  }

  function handleReset() {
    if (initialReadings && selectedPresetId === "custom_session") {
      setReadings({ ...initialReadings })
      return
    }
    const p = SIMULATOR_PRESETS.find((x) => x.id === selectedPresetId) ?? defaultPreset
    setReadings({ ...p.readings })
  }

  const currentTreatment =
    SIMULATION_TREATMENTS.find((t) => t.id === selectedTreatmentId) ?? SIMULATION_TREATMENTS[0]

  const scoreDelta = simulation.simulatedScore - simulation.baselineScore
  const hasConcentrationRisk = simulation.parameterDeltas.some((d) => d.isConcentrated)

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      {/* Header Banner */}
      <div className="rounded-2xl border border-sky-200/80 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-blue-500/10 p-6 md:p-8 backdrop-blur-xs dark:border-sky-900/60 dark:from-sky-950/40 dark:via-slate-900/50 dark:to-blue-950/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-slate-900 text-sky-700 dark:text-sky-300 text-xs font-bold tracking-wide uppercase border border-sky-200 dark:border-sky-800 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" /> Interactive Laboratory Tool
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              &ldquo;What-If&rdquo; Treatment Simulator
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
              Test whether rolling boil, 5-stage RO, activated carbon, or chlorination will actually fix your water.
              Model physical filtration efficiencies and detect chemical concentration hazards before investing in hardware.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="self-start md:self-auto gap-2 border-slate-300 bg-white/80 hover:bg-white text-slate-700 font-semibold shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <RotateCcw className="h-4 w-4" /> Reset Scenario
          </Button>
        </div>
      </div>

      {/* STEP 1: Choose Baseline Contamination Scenario */}
      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold shadow-xs">
              1
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Choose Baseline Water Scenario
            </h2>
          </div>
          {initialSourceName && (
            <Badge variant="outline" className="border-sky-300 bg-sky-50 text-sky-800 font-semibold text-xs dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300">
              Imported from: {initialSourceName}
            </Badge>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Custom session pill if available */}
          {initialReadings && (
            <button
              type="button"
              onClick={() => {
                setSelectedPresetId("custom_session")
                setReadings({ ...initialReadings })
              }}
              className={`text-left p-4 rounded-xl border transition-all relative ${
                selectedPresetId === "custom_session"
                  ? "border-sky-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-sky-500/20 dark:border-sky-500"
                  : "border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                  {initialSourceName ?? "My Water Report"}
                </span>
                {selectedPresetId === "custom_session" ? (
                  <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-[10px]">Session</Badge>
                )}
              </div>
              <p className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                Active test measurements
              </p>
            </button>
          )}

          {SIMULATOR_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id
            const highlight = PRESET_HIGHLIGHTS[preset.id]
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-4 rounded-xl border transition-all relative ${
                  isSelected
                    ? "border-sky-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-sky-500/20 dark:border-sky-500"
                    : "border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {preset.name}
                  </span>
                  {isSelected ? (
                    <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  ) : (
                    <Badge variant="outline" className="text-[10px] capitalize text-slate-500 border-slate-200 dark:border-slate-700">
                      {preset.sourceType}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {preset.description}
                </p>
                {highlight && (
                  <span className="inline-block text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50">
                    {highlight}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* STEP 2: Select Purification Method */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-white text-xs font-bold shadow-xs">
            2
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Select Purification Method to Simulate
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {SIMULATION_TREATMENTS.map((treatment) => {
            const isSelected = selectedTreatmentId === treatment.id
            return (
              <button
                key={treatment.id}
                type="button"
                onClick={() => setSelectedTreatmentId(treatment.id)}
                className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "border-sky-500 bg-white dark:bg-slate-900 shadow-md ring-2 ring-sky-500/25 dark:border-sky-500"
                    : "border-slate-200/90 bg-white/70 hover:bg-white hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        treatment.id === "boiling"
                          ? "bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
                          : treatment.id === "carbon_pitcher"
                          ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          : treatment.id === "reverse_osmosis"
                          ? "bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-300"
                          : treatment.id === "ultrafiltration"
                          ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-950/60 dark:text-cyan-300"
                          : "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
                      }`}
                    >
                      {treatment.id === "boiling" ? (
                        <Flame className="h-4.5 w-4.5" />
                      ) : treatment.id === "carbon_pitcher" ? (
                        <Filter className="h-4.5 w-4.5" />
                      ) : treatment.id === "reverse_osmosis" ? (
                        <Zap className="h-4.5 w-4.5" />
                      ) : treatment.id === "ultrafiltration" ? (
                        <Droplets className="h-4.5 w-4.5" />
                      ) : (
                        <ShieldCheck className="h-4.5 w-4.5" />
                      )}
                    </div>

                    {isSelected && (
                      <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block mb-1">
                    {treatment.label}
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {treatment.description}
                  </p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Selected Method Details / Strengths & Limitations Strip */}
        <div className="rounded-xl border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Info className="h-4 w-4 text-sky-600" /> Technology Profile: {currentTreatment.label}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {currentTreatment.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-[11px] border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                Key Strength: {currentTreatment.strengths[0] ?? "Disinfection"}
              </Badge>
              {currentTreatment.warnings.length > 0 && (
                <Badge variant="outline" className="text-[11px] border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  Limitation: {currentTreatment.warnings[0]?.split(":")[0] ?? "Chemical Bypass"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* REAL-TIME SAFETY SCORE & OUTCOME SCORECARD */}
      <Card className="border-sky-300/80 bg-white dark:bg-slate-900 dark:border-sky-900/60 shadow-lg shadow-sky-500/5 overflow-hidden">
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600" />
        <CardContent className="p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-3 items-center">
            {/* Raw Baseline Score */}
            <div className="text-center md:text-left space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Raw Baseline Safety
              </span>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-4xl font-black text-slate-900 dark:text-slate-100">
                  {simulation.baselineScore}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({simulation.baselineSafeCount}/{simulation.totalParameters} Safe)
                </span>
              </div>
              <Badge
                variant={simulation.baselineScore < 60 ? "destructive" : simulation.baselineScore < 85 ? "warning" : "success"}
                className="text-[11px] font-bold"
              >
                {simulation.baselineScore < 60 ? "Severe Health Hazard" : simulation.baselineScore < 85 ? "Moderate Ingestion Risk" : "Generally Safe"}
              </Badge>
            </div>

            {/* Transition Indicator */}
            <div className="flex flex-col items-center justify-center space-y-2 text-center py-2">
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shadow-xs dark:bg-slate-800 dark:border-slate-700 dark:text-sky-400">
                  <ArrowRight className="h-5 w-5 md:rotate-0 rotate-90" />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Simulating: {currentTreatment.label}
                </span>
                {scoreDelta > 0 ? (
                  <Badge variant="success" className="text-[10px] mt-1 gap-1 font-bold">
                    <TrendingUp className="h-3 w-3" /> +{scoreDelta}% Improvement
                  </Badge>
                ) : scoreDelta < 0 ? (
                  <Badge variant="destructive" className="text-[10px] mt-1 gap-1 font-bold">
                    <TrendingDown className="h-3 w-3" /> {scoreDelta}% Hazard Increase
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] mt-1 text-slate-500">
                    Net Score Unchanged
                  </Badge>
                )}
              </div>
            </div>

            {/* Projected Purified Score */}
            <div className="text-center md:text-right space-y-2 p-4 rounded-xl bg-slate-50/80 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                Projected Purified Score
              </span>
              <div className="flex items-baseline gap-2 justify-center md:justify-end">
                <span
                  className={`text-4xl font-black ${
                    simulation.simulatedScore >= 90
                      ? "text-emerald-600 dark:text-emerald-400"
                      : simulation.simulatedScore > simulation.baselineScore
                      ? "text-sky-600 dark:text-sky-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {simulation.simulatedScore}%
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  ({simulation.simulatedSafeCount}/{simulation.totalParameters} Safe)
                </span>
              </div>
              <Badge
                variant={
                  simulation.simulatedScore >= 95
                    ? "success"
                    : simulation.simulatedScore > simulation.baselineScore
                    ? "info"
                    : "destructive"
                }
                className="text-[11px] font-bold"
              >
                {simulation.simulatedScore >= 95
                  ? "Fully WHO Guideline Compliant ✓"
                  : simulation.simulatedScore > simulation.baselineScore
                  ? "Partial Protection (Gaps Remain)"
                  : "Hazardous Concentration Detected ⚠️"}
              </Badge>
            </div>
          </div>

          {/* Concentration Hazard Alert Box */}
          {hasConcentrationRisk && (
            <div className="mt-6 rounded-xl border border-red-300 bg-red-50/70 p-4 text-xs dark:border-red-900/60 dark:bg-red-950/40">
              <div className="flex items-start gap-3 text-red-950 dark:text-red-200">
                <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-red-900 dark:text-red-100">
                    Scientific Caution: Contaminant Concentration Detected
                  </h4>
                  <p className="leading-relaxed">
                    Because this treatment method involves thermal boiling without filtration, water evaporates as steam while heavy metals, nitrates, and fluoride remain dissolved, <strong>increasing toxic concentration per liter by ~12%</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* STEP 3: Live Parameter Comparison Matrix */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Parameter Impact Matrix & Live Sliders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Simulated outcomes based on laboratory filtration kinetics. Drag the sliders to test custom baseline values.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            <Info className="h-3.5 w-3.5 text-sky-600" /> Standard: WHO Drinking Water Guidelines
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {simulation.parameterDeltas.map((delta) => {
            const isImproved = delta.simulatedStatus === "normal" && delta.baselineStatus === "flagged"
            const isWorse = delta.isConcentrated
            const isStillFlagged = delta.simulatedStatus === "flagged"
            const sliderCfg = PARAMETER_SLIDER_CONFIG[delta.code] || { min: 0, max: 100, step: 1 }

            return (
              <Card
                key={delta.code}
                className={`p-5 space-y-4 border transition-all rounded-2xl shadow-xs ${
                  isWorse
                    ? "border-red-300 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20"
                    : isImproved
                    ? "border-emerald-300 bg-emerald-50/20 dark:border-emerald-900/60 dark:bg-emerald-950/20"
                    : isStillFlagged
                    ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/15"
                    : "border-slate-200/90 bg-white hover:border-sky-300 dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                {/* Header: Parameter Name + Delta Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                      {delta.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      WHO Limit: {delta.thresholdMax !== null ? `Max ${delta.thresholdMax}` : `Min ${delta.thresholdMin}`} {delta.unit}
                    </span>
                  </div>

                  {isWorse ? (
                    <Badge variant="destructive" className="text-[10px] gap-1 font-bold animate-pulse">
                      <TrendingUp className="h-3 w-3" /> +{delta.percentChange}%
                    </Badge>
                  ) : delta.percentChange < 0 ? (
                    <Badge variant="success" className="text-[10px] gap-1 font-bold">
                      <TrendingDown className="h-3 w-3" /> {delta.percentChange}%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 dark:border-slate-700">
                      0% (No Effect)
                    </Badge>
                  )}
                </div>

                {/* Values Comparison Strip */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70 dark:bg-slate-800/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Baseline Raw
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {delta.baselineValue} <span className="text-[10px] font-normal text-slate-400">{delta.unit}</span>
                    </span>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-400" />

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block mb-0.5">
                      Simulated After
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        delta.simulatedStatus === "normal"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {delta.simulatedValue} <span className="text-[10px] font-normal text-slate-400">{delta.unit}</span>
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 text-[11px]">Outcome:</span>
                  {delta.simulatedStatus === "normal" ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Safe for Consumption
                    </span>
                  ) : isWorse ? (
                    <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1 text-[11px]">
                      <AlertTriangle className="h-3.5 w-3.5" /> Toxic Concentration
                    </span>
                  ) : (
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                      <XCircle className="h-3.5 w-3.5" /> Above WHO Limit
                    </span>
                  )}
                </div>

                {/* Interactive Slider */}
                <div className="pt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Adjust baseline input</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                      {delta.baselineValue} {delta.unit}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={sliderCfg.min}
                    max={sliderCfg.max}
                    step={sliderCfg.step}
                    value={delta.baselineValue}
                    onChange={(e) => handleReadingChange(delta.code, parseFloat(e.target.value) || 0)}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:bg-slate-700 hover:accent-sky-500 transition-all"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>{sliderCfg.min}</span>
                    <span>Max {sliderCfg.max}</span>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
