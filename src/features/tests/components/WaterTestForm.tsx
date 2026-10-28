"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  TestTube2,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Info,
  Sparkles,
} from "lucide-react"
import { WATER_PARAMETERS } from "@/features/tests/constants"
import { TREATMENT_METHODS } from "@/features/sources/constants"
import { submitWaterTestAction } from "@/features/tests/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

interface WaterTestFormProps {
  sources: Array<{
    id: string
    source_name: string
    source_type: string
    treatment_method: string | null
  }>
  preselectedSourceId?: string
}

export default function WaterTestForm({ sources, preselectedSourceId }: WaterTestFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Context & Standards
  const initialSource = sources.find((s) => s.id === preselectedSourceId) ?? sources[0]
  const [selectedSourceId, setSelectedSourceId] = useState<string>(initialSource?.id ?? "")
  const [standardName, setStandardName] = useState<"WHO Guidelines" | "BIS IS 10500">("WHO Guidelines")
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split("T")[0])

  // Step 2: Readings for 9 parameters
  const [readingsState, setReadingsState] = useState<
    Record<string, { value: string; unit: string; notTested: boolean }>
  >(() => {
    const initial: Record<string, { value: string; unit: string; notTested: boolean }> = {}
    for (const p of WATER_PARAMETERS) {
      initial[p.code] = {
        value: "",
        unit: p.defaultUnit,
        notTested: false,
      }
    }
    return initial
  })

  // Step 3: Current Treatment & Conditions
  const currentSource = sources.find((s) => s.id === selectedSourceId)
  const [treatmentMethod, setTreatmentMethod] = useState<string>(
    currentSource?.treatment_method ?? "none"
  )
  const [recentRainfall, setRecentRainfall] = useState(false)
  const [tasteSmellChange, setTasteSmellChange] = useState("")

  function handleValueChange(paramCode: string, val: string) {
    setReadingsState((prev) => ({
      ...prev,
      [paramCode]: {
        ...prev[paramCode],
        value: val,
        notTested: false,
      },
    }))
  }

  function handleUnitChange(paramCode: string, unit: string) {
    setReadingsState((prev) => ({
      ...prev,
      [paramCode]: {
        ...prev[paramCode],
        unit,
      },
    }))
  }

  function handleToggleNotTested(paramCode: string) {
    setReadingsState((prev) => ({
      ...prev,
      [paramCode]: {
        ...prev[paramCode],
        notTested: !prev[paramCode].notTested,
        value: !prev[paramCode].notTested ? "" : prev[paramCode].value,
      },
    }))
  }

  function handleLoadDemoData() {
    setReadingsState({
      ph: { value: "7.4", unit: "pH units", notTested: false },
      turbidity: { value: "2.8", unit: "NTU", notTested: false },
      tds: { value: "480", unit: "mg/L", notTested: false },
      lead: { value: "0.012", unit: "mg/L", notTested: false }, // slightly elevated to trigger reality check & rule flags
      arsenic: { value: "0.003", unit: "mg/L", notTested: false },
      nitrates: { value: "48.0", unit: "mg/L", notTested: false },
      fluoride: { value: "1.1", unit: "mg/L", notTested: false },
      chlorine: { value: "0.6", unit: "mg/L", notTested: false },
      bacteria: { value: "0", unit: "CFU/100mL", notTested: false },
    })
    toast.success("Loaded realistic water test sample data!")
  }

  async function handleFinalSubmit() {
    if (!selectedSourceId) {
      toast.error("Please select a water source")
      return
    }

    setIsSubmitting(true)

    const payloadReadings = WATER_PARAMETERS.map((p) => {
      const state = readingsState[p.code]
      const numVal = state.value !== "" && !state.notTested ? parseFloat(state.value) : null
      return {
        parameterCode: p.code,
        value: numVal,
        unit: state.unit,
        notTested: state.notTested || numVal === null,
      }
    })

    const result = await submitWaterTestAction({
      waterSourceId: selectedSourceId,
      standardName,
      testDate,
      treatmentMethod,
      contextRainfall: recentRainfall,
      contextTasteSmell: tasteSmellChange,
      readings: payloadReadings,
    })

    if (result.error) {
      toast.error(result.error)
      setIsSubmitting(false)
      return
    }

    toast.success("Assessment evaluated successfully!")
    router.push(`/dashboard/reports/${result.sessionId}`)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Progress Steps Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 dark:border-slate-800">
        {[
          { step: 1, title: "Source & Standard" },
          { step: 2, title: "Enter Readings" },
          { step: 3, title: "Treatment & Context" },
        ].map((s) => (
          <div
            key={s.step}
            className={`flex items-center gap-2.5 text-sm font-semibold transition-colors ${
              currentStep === s.step
                ? "text-sky-700 dark:text-sky-400"
                : currentStep > s.step
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                currentStep === s.step
                  ? "bg-sky-600 text-white shadow-sky-500/25"
                  : currentStep > s.step
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              }`}
            >
              {currentStep > s.step ? <CheckCircle2 className="h-4 w-4" /> : s.step}
            </div>
            <span className="hidden sm:inline">{s.title}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Water Source & Standard */}
      {currentStep === 1 && (
        <Card className="border-slate-200/80 shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              1. Select Water Supply &amp; Reference Standard
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              Select the supply location being tested and the reference standard to evaluate compliance against.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sourceSelect" className="font-semibold text-slate-800 dark:text-slate-200">
                Monitored Water Source
              </Label>
              <Select
                value={selectedSourceId}
                onValueChange={(val) => {
                  setSelectedSourceId(val)
                  const s = sources.find((x) => x.id === val)
                  if (s?.treatment_method) {
                    setTreatmentMethod(s.treatment_method)
                  }
                }}
              >
                <SelectTrigger id="sourceSelect" className="h-10">
                  <SelectValue placeholder="Select water source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((src) => (
                    <SelectItem key={src.id} value={src.id}>
                      {src.source_name} ({src.source_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="standardSelect" className="font-semibold text-slate-800 dark:text-slate-200">
                Authoritative Water Standard
              </Label>
              <Select
                value={standardName}
                onValueChange={(val) => setStandardName(val as "WHO Guidelines" | "BIS IS 10500")}
              >
                <SelectTrigger id="standardSelect" className="h-10">
                  <SelectValue placeholder="Select standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WHO Guidelines">
                    WHO Guidelines for Drinking-water Quality (Global Reference)
                  </SelectItem>
                  <SelectItem value="BIS IS 10500">
                    Bureau of Indian Standards IS 10500:2012 (India Statutory)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 dark:text-slate-400">
                <Info className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                Deterministic rule engine compares measurements directly against this chosen guideline.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="testDate" className="font-semibold text-slate-800 dark:text-slate-200">
                Sample / Test Date
              </Label>
              <Input
                id="testDate"
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedSourceId}
              className="gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold"
            >
              Next: Enter Readings <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Parameter Measurements */}
      {currentStep === 2 && (
        <Card className="border-slate-200/80 shadow-md">
          <CardHeader className="space-y-3 pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  2. Enter Measured Water Parameters
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 max-w-xl dark:text-slate-400">
                  Enter laboratory or home test kit readings. You can mark unmeasured parameters as &quot;Not Tested&quot;.
                </CardDescription>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleLoadDemoData}
                  className="h-9 gap-1.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white hover:from-sky-600 hover:to-cyan-600 font-semibold shadow-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                  Fill Demo Values
                </Button>
                <Badge
                  variant="outline"
                  className="h-9 px-3 border-sky-200 bg-sky-50/80 text-sky-800 font-medium whitespace-nowrap dark:border-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                >
                  Evaluating vs: {standardName}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {WATER_PARAMETERS.map((param) => {
                const state = readingsState[param.code]
                const limitGuide =
                  standardName === "WHO Guidelines" ? param.whoLimit : param.bisLimit

                return (
                  <div
                    key={param.code}
                    className={`rounded-xl border p-4 space-y-2.5 transition-all ${
                      state.notTested
                        ? "bg-slate-50/70 border-slate-200 opacity-60 dark:bg-slate-900/40 dark:border-slate-800"
                        : "bg-white border-slate-200/90 shadow-2xs hover:border-sky-300 dark:bg-slate-900 dark:border-slate-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Label className="font-bold text-sm text-slate-900 dark:text-slate-100 block">
                          {param.name}
                        </Label>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate dark:text-slate-400">
                          Standard threshold: {limitGuide}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleNotTested(param.code)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium shrink-0 transition-all ${
                          state.notTested
                            ? "bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 font-semibold"
                            : "text-slate-500 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {state.notTested ? "Not Tested ✓" : "Mark Not Tested"}
                      </button>
                    </div>

                    {!state.notTested ? (
                      <div className="flex items-center gap-2 pt-1">
                        <Input
                          type="number"
                          step={param.step}
                          placeholder={param.placeholder}
                          value={state.value}
                          onChange={(e) => handleValueChange(param.code, e.target.value)}
                          className="flex-1 h-9.5 text-sm"
                        />
                        {param.availableUnits.length > 1 ? (
                          <Select
                            value={state.unit}
                            onValueChange={(u) => handleUnitChange(param.code, u)}
                          >
                            <SelectTrigger className="w-28 h-9.5 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {param.availableUnits.map((u) => (
                                <SelectItem key={u} value={u} className="text-xs">
                                  {u}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-xs text-slate-500 px-2 font-mono whitespace-nowrap dark:text-slate-400">
                            {param.defaultUnit}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic py-1.5">
                        Parameter will be flagged for follow-up testing recommendations.
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setCurrentStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setCurrentStep(3)} className="gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold">
              Next: Treatment Check <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 3: Treatment & Context Confirmation */}
      {currentStep === 3 && (
        <Card className="border-slate-200/80 shadow-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" /> Smart Treatment Reality Check
            </div>
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              3. Current Treatment Method &amp; Observations
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
              Confirm your existing purification setup so AquaVeris can cross-verify if it truly addresses the detected contaminants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="treatment" className="font-semibold text-slate-800 dark:text-slate-200">
                Active Point-of-Use Treatment
              </Label>
              <Select value={treatmentMethod} onValueChange={setTreatmentMethod}>
                <SelectTrigger id="treatment" className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TREATMENT_METHODS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Example: If high nitrates or lead are present, boiling can concentrate toxins rather than remove them.
              </p>
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                Environmental &amp; Physical Observations (AI Detective Context)
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="rainfall"
                  checked={recentRainfall}
                  onChange={(e) => setRecentRainfall(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <Label htmlFor="rainfall" className="cursor-pointer text-sm font-normal text-slate-700 dark:text-slate-300">
                  Recent heavy rainfall or local flooding occurred within the past 48 hours
                </Label>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tasteSmell" className="text-xs text-slate-600 dark:text-slate-400">
                  Noticeable change in taste, odour, or visual clarity (optional)
                </Label>
                <Input
                  id="tasteSmell"
                  placeholder="e.g. Metallic taste, chlorine smell, yellowish tint after monsoon"
                  value={tasteSmellChange}
                  onChange={(e) => setTasteSmellChange(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setCurrentStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Readings
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="gap-2 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-semibold shadow-sm shadow-sky-600/25"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Evaluating Assessment...
                </>
              ) : (
                <>
                  Run Assessment &amp; Reality Check <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
