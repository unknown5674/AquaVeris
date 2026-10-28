"use client"

import { useState, useMemo } from "react"
import {
  SIMULATOR_PRESETS,
  SIMULATION_TREATMENTS,
  simulateTreatmentImpact,
  type SimulatorPreset,
} from "@/lib/engine/simulator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"

interface TreatmentSimulatorProps {
  initialReadings?: Record<string, number>
  initialSourceName?: string
}

export default function TreatmentSimulator({
  initialReadings,
  initialSourceName,
}: TreatmentSimulatorProps) {
  // Select preset or custom
  const defaultPreset = SIMULATOR_PRESETS[0]
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    initialReadings ? "custom_session" : defaultPreset.id
  )

  // Current baseline readings state
  const [readings, setReadings] = useState<Record<string, number>>(
    initialReadings ?? defaultPreset.readings
  )

  // Current selected treatment
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string>("boiling")

  // Compute live simulation result
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
    const p = SIMULATOR_PRESETS.find((x) => x.id === selectedPresetId) ?? defaultPreset
    setReadings({ ...p.readings })
  }

  const currentTreatment =
    SIMULATION_TREATMENTS.find((t) => t.id === selectedTreatmentId) ?? SIMULATION_TREATMENTS[0]

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/70 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-bold tracking-wider uppercase mb-2 border border-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" /> Interactive Laboratory Tool
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            &ldquo;What-If&rdquo; Treatment Simulator
          </h1>
          <p className="text-slate-500 mt-1 text-sm max-w-2xl dark:text-slate-400">
            Simulate how different purification systems alter chemical ions, bacterial pathogens, and heavy metals. Verify true efficacy before purchasing filters.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="self-start md:self-auto gap-1.5 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset Values
        </Button>
      </div>

      {/* Preset Water Scenarios */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Step 1: Choose Baseline Contamination Scenario
          </span>
          {initialSourceName && (
            <span className="text-xs text-sky-600 font-semibold dark:text-sky-400">
              Loaded from: {initialSourceName}
            </span>
          )}
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {SIMULATOR_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`text-left p-3.5 rounded-xl border transition-all ${
                  isSelected
                    ? "border-sky-500 bg-sky-50/80 shadow-xs ring-2 ring-sky-500/20 dark:bg-sky-950/50 dark:border-sky-600"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    {preset.name}
                  </span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {preset.sourceType}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
                  {preset.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Treatment System Toggle */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Step 2: Select Purification Method to Test
        </span>

        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {SIMULATION_TREATMENTS.map((treatment) => {
            const isSelected = selectedTreatmentId === treatment.id
            return (
              <button
                key={treatment.id}
                type="button"
                onClick={() => setSelectedTreatmentId(treatment.id)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "border-sky-500 bg-gradient-to-br from-sky-50 to-blue-50/70 shadow-sm ring-2 ring-sky-500/25 dark:from-slate-900 dark:to-sky-950/60 dark:border-sky-500"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:bg-slate-900 dark:border-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {treatment.id === "boiling" ? (
                    <Flame className="h-4 w-4 text-orange-500" />
                  ) : treatment.id === "carbon_pitcher" ? (
                    <Filter className="h-4 w-4 text-slate-600" />
                  ) : treatment.id === "reverse_osmosis" ? (
                    <Zap className="h-4 w-4 text-sky-500" />
                  ) : treatment.id === "ultrafiltration" ? (
                    <Droplets className="h-4 w-4 text-cyan-500" />
                  ) : (
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  )}
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {treatment.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 dark:text-slate-400">
                  {treatment.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Safety Score Impact Banner */}
      <Card className="border-sky-200/80 bg-gradient-to-r from-sky-50/70 via-white to-blue-50/50 shadow-md dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/30">
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-3 items-center">
            {/* Baseline Score */}
            <div className="text-center md:text-left space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Raw Baseline Safety
              </span>
              <div className="flex items-baseline gap-2 justify-center md:justify-start">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                  {simulation.baselineScore}%
                </span>
                <span className="text-xs text-slate-500">
                  ({simulation.baselineSafeCount}/{simulation.totalParameters} Safe)
                </span>
              </div>
              <Badge
                variant={simulation.baselineScore < 70 ? "destructive" : "warning"}
                className="text-[10px]"
              >
                {simulation.baselineScore < 70 ? "High Ingestion Risk" : "Moderate Risk"}
              </Badge>
            </div>

            {/* Transition Arrow */}
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="h-10 w-10 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs dark:bg-slate-800 dark:text-sky-400">
                <ArrowRight className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                {currentTreatment.label}
              </span>
            </div>

            {/* Projected Score */}
            <div className="text-center md:text-right space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Projected Purified Score
              </span>
              <div className="flex items-baseline gap-2 justify-center md:justify-end">
                <span className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
                  {simulation.simulatedScore}%
                </span>
                <span className="text-xs text-slate-500">
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
                className="text-[10px] font-bold"
              >
                {simulation.simulatedScore >= 95
                  ? "Fully WHO Compliant ✓"
                  : simulation.simulatedScore > simulation.baselineScore
                  ? "Partial Protection"
                  : "Contaminants Concentrated ⚠️"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Warnings / Reality Check Callout */}
      {simulation.criticalWarnings.length > 0 && (
        <div className="space-y-2">
          {simulation.criticalWarnings.map((warning, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-semibold text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 shadow-xs"
            >
              <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live Parameter Comparison Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Live Parameter Impact Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Side-by-side projected outcomes based on documented physical and chemical filtration limits.
            </p>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" /> Benchmark: WHO 2026 Guidelines
          </span>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {simulation.parameterDeltas.map((delta) => {
            const isImproved = delta.simulatedStatus === "normal" && delta.baselineStatus === "flagged"
            const isWorse = delta.isConcentrated
            const isStillFlagged = delta.simulatedStatus === "flagged"

            return (
              <Card
                key={delta.code}
                className={`p-4 space-y-3 border transition-all ${
                  isWorse
                    ? "border-red-300 bg-red-50/30 dark:border-red-900 dark:bg-red-950/20"
                    : isImproved
                    ? "border-emerald-300 bg-emerald-50/25 dark:border-emerald-900 dark:bg-emerald-950/20"
                    : isStillFlagged
                    ? "border-amber-200 bg-amber-50/20 dark:border-amber-900"
                    : "border-slate-200/90 bg-white dark:bg-slate-900"
                }`}
              >
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                      {delta.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Standard: Max {delta.thresholdMax ?? "—"} {delta.unit}
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
                    <Badge variant="outline" className="text-[10px] text-slate-500">
                      0% (No Effect)
                    </Badge>
                  )}
                </div>

                {/* Values Comparison */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      Raw Baseline
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                      {delta.baselineValue} {delta.unit}
                    </span>
                  </div>

                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                      After Treatment
                    </span>
                    <span
                      className={`font-bold text-sm ${
                        delta.simulatedStatus === "normal"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {delta.simulatedValue} {delta.unit}
                    </span>
                  </div>
                </div>

                {/* Status Indicator Bar */}
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Projected Status:</span>
                  {delta.simulatedStatus === "normal" ? (
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Safe for Ingestion
                    </span>
                  ) : isWorse ? (
                    <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> Toxic Concentration
                    </span>
                  ) : (
                    <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <XCircle className="h-3.5 w-3.5" /> Still Above Limit
                    </span>
                  )}
                </div>

                {/* Quick Slider Adjustment */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Adjust baseline</span>
                    <span className="font-mono">{delta.baselineValue}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={delta.code === "tds" ? 2000 : delta.code === "bacteria" ? 100 : delta.code === "nitrates" ? 150 : delta.code === "lead" ? 0.08 : 20}
                    step={delta.code === "lead" || delta.code === "arsenic" ? 0.001 : 0.5}
                    value={delta.baselineValue}
                    onChange={(e) => handleReadingChange(delta.code, parseFloat(e.target.value) || 0)}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600 dark:bg-slate-700"
                  />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
