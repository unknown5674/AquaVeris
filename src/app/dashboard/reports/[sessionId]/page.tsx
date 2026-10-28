import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Droplets,
  Calendar,
  Sparkles,
  ShieldAlert,
  Search,
  CheckCircle,
  Clock,
  HelpCircle,
  ShieldCheck,
  Activity,
} from "lucide-react"
import TestSelectionAssistantModal from "@/features/tests/components/TestSelectionAssistantModal"
import { WATER_PARAMETERS } from "@/features/tests/constants"

export const metadata = {
  title: "Water Quality Report",
  description: "AI-Powered Water Risk Assessment & Smart Treatment Guidance",
}

function getParamMeta(code: string) {
  return WATER_PARAMETERS.find((p) => p.code.toLowerCase() === code.toLowerCase())
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Fetch test session and water source
  const { data: session } = await (supabase.from("test_sessions") as any)
    .select(`
      id,
      test_date,
      assessment_status,
      created_at,
      water_sources (
        id,
        source_name,
        source_type,
        treatment_method
      )
    `)
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (!session) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto">
        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Assessment Not Found</h2>
        <p className="text-sm text-slate-500">This test assessment may have been removed or belongs to another user.</p>
        <Button asChild variant="outline" className="border-slate-300">
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  // 2. Fetch parameter readings
  const { data: readings } = await (supabase.from("parameter_readings") as any)
    .select("*")
    .eq("test_session_id", sessionId)

  // 3. Fetch generated AI report if available
  const { data: report } = await (supabase.from("generated_reports") as any)
    .select("*")
    .eq("test_session_id", sessionId)
    .maybeSingle()

  const readingList = (readings ?? []) as Array<{
    id: string
    parameter_code: string
    measured_value: number | null
    unit: string | null
    evaluation_status: string
    reference_min: number | null
    reference_max: number | null
  }>

  const flaggedReadings = readingList.filter(
    (r) => r.evaluation_status === "elevated" || r.evaluation_status === "below_min"
  )

  const treatmentAssessment = report?.treatment_assessment as any
  const modelMeta = report?.model_metadata as any
  const actionPlan = (report?.recommended_actions ?? []) as Array<{
    priority: number
    title: string
    description: string
    timeframe: string
  }>

  const riskLevel = modelMeta?.riskLevel ?? (flaggedReadings.length > 0 ? "FLAGGED" : "SAFE")

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header / Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5 border-slate-200 bg-white text-slate-700 hover:bg-sky-50 hover:text-sky-700 shadow-xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <TestSelectionAssistantModal
            sourceType={session.water_sources?.source_type ?? "General"}
            flaggedParameters={flaggedReadings.map((r) => r.parameter_code)}
            untestedParameters={readingList
              .filter((r) => r.evaluation_status === "not_tested")
              .map((r) => r.parameter_code)}
          />
          <Badge
            variant="outline"
            className={`text-xs px-3 py-1 font-bold tracking-wide uppercase shadow-xs ${
              riskLevel === "CRITICAL" || riskLevel === "HIGH" || riskLevel === "FLAGGED"
                ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900"
                : riskLevel === "MODERATE"
                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900"
            }`}
          >
            {riskLevel} RISK
          </Badge>
        </div>
      </div>

      {/* Main Executive Summary Card */}
      <Card className="relative overflow-hidden border-sky-200/90 shadow-lg shadow-sky-500/5 bg-white dark:bg-slate-900 dark:border-slate-800">
        <div className="h-1.5 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600" />
        <CardHeader className="space-y-4 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-bold tracking-wider uppercase mb-2 border border-sky-100 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-900">
                <Sparkles className="h-3.5 w-3.5 text-sky-600" /> AquaVeris ActionIQ Report
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                Water Safety &amp; Treatment Assessment
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                  <Droplets className="h-3.5 w-3.5 text-sky-600" />
                  {session.water_sources?.source_name} ({session.water_sources?.source_type})
                </span>
                <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  Sampled: {session.test_date}
                </span>
              </div>
            </div>

            <div className="rounded-xl border border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-blue-50/50 p-3 sm:px-4 text-left sm:text-right shrink-0 dark:border-slate-800 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block dark:text-slate-400">
                Applied Treatment
              </span>
              <span className="text-sm font-bold text-sky-950 capitalize dark:text-sky-200">
                {session.water_sources?.treatment_method ?? "None / Raw"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-2xl bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-cyan-50/50 border border-sky-200/80 p-5 shadow-2xs dark:from-slate-800/60 dark:via-slate-800/40 dark:to-sky-950/40 dark:border-slate-700">
            <h4 className="font-bold text-sm mb-2 text-sky-950 dark:text-sky-200 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-sky-600" /> AI Executive Summary
            </h4>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {report?.summary ??
                (flaggedReadings.length > 0
                  ? `Assessment identified ${flaggedReadings.length} measurement(s) outside recommended authoritative guidelines.`
                  : "All tested measurements are within acceptable reference guideline boundaries.")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* SMART TREATMENT REALITY CHECK SECTION */}
      {treatmentAssessment && (
        <Card className="border-amber-300/80 bg-white dark:bg-slate-900 dark:border-amber-900/60 shadow-md overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-amber-50/60 border-b border-amber-200/80 dark:bg-amber-950/30 dark:border-amber-900/60 pb-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" /> Signature Feature: Smart Treatment Reality Check
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              Does your current purification method protect you?
            </CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
              Evaluation comparing detected contaminants against the documented chemical and biological capabilities of{" "}
              <strong className="text-slate-900 font-bold capitalize dark:text-slate-100">
                {session.water_sources?.treatment_method}
              </strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-5">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              {treatmentAssessment.overallAssessment}
            </p>

            {/* Critical Warnings */}
            {treatmentAssessment.criticalWarnings?.length > 0 && (
              <div className="space-y-2">
                {treatmentAssessment.criticalWarnings.map((warning: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 text-xs text-red-950 dark:text-red-200 font-semibold leading-relaxed shadow-xs"
                  >
                    <AlertTriangle className="h-4.5 w-4.5 text-red-600 shrink-0 mt-0.5" />
                    <span>{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Raw Gaps Matrix */}
            {treatmentAssessment.rawGaps?.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {treatmentAssessment.rawGaps.map((gap: any, idx: number) => {
                  const isDangerous = gap.isDangerousPractice || gap.effectivenessLevel === "ineffective"
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 text-xs space-y-2 transition-all ${
                        isDangerous
                          ? "border-red-200 bg-red-50/40 dark:border-red-900 dark:bg-red-950/20"
                          : "border-amber-200 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100 capitalize">
                          {gap.parameterName}
                        </span>
                        <Badge
                          variant={isDangerous ? "destructive" : "warning"}
                          className="text-[10px] uppercase font-bold"
                        >
                          {gap.effectivenessLevel}
                        </Badge>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{gap.summary}</p>
                      {gap.limitationWarning && (
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                          ⚠️ {gap.limitationWarning}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* PARAMETERS GRID */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Evaluated Parameter Measurements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deterministic rule verification against authoritative standards
            </p>
          </div>
          <Badge variant="outline" className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 font-semibold">
            {readingList.length} Parameters Evaluated
          </Badge>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {readingList.map((r) => {
            const isFlagged = r.evaluation_status === "elevated" || r.evaluation_status === "below_min"
            const isNotTested = r.evaluation_status === "not_tested"
            const paramMeta = getParamMeta(r.parameter_code)
            const paramTitle = paramMeta?.name ?? r.parameter_code.toUpperCase()

            return (
              <Card
                key={r.id}
                className={`p-4 space-y-3 border transition-all ${
                  isFlagged
                    ? "border-red-300 bg-red-50/30 dark:border-red-900/60 dark:bg-red-950/20 shadow-xs"
                    : isNotTested
                    ? "border-slate-200 bg-slate-50/50 opacity-70 dark:border-slate-800 dark:bg-slate-900/30"
                    : "border-slate-200/90 bg-white hover:border-sky-300 shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate block">
                    {paramTitle}
                  </span>
                  <Badge
                    variant={
                      isFlagged
                        ? "destructive"
                        : isNotTested
                        ? "secondary"
                        : "success"
                    }
                    className="text-[10px] font-bold uppercase shrink-0"
                  >
                    {isFlagged ? "Flagged" : isNotTested ? "Not Tested" : "Normal"}
                  </Badge>
                </div>

                <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {r.measured_value !== null ? (
                    <>
                      {r.measured_value}{" "}
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {r.unit}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs font-normal text-slate-400 italic">
                      Not Tested
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>Guideline:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {r.reference_max !== null
                      ? `Max ${r.reference_max}`
                      : r.reference_min !== null
                      ? `Min ${r.reference_min}`
                      : "Standard Threshold"}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* AI CONTAMINATION DETECTIVE HYPOTHESES */}
      {modelMeta?.detectiveHypotheses?.length > 0 && (
        <Card className="border-slate-200/80 shadow-md bg-white dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-bold text-xs uppercase tracking-wider">
              <Search className="h-4 w-4" /> AI Contamination Detective
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              Plausible Infiltration Pathways
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Educational hypotheses generated based on your parameter readings, water source type, and physical observations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {modelMeta.detectiveHypotheses.map((item: any, idx: number) => (
              <div
                key={idx}
                className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 space-y-1.5 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{item.hypothesis}</span>
                  <Badge variant="outline" className="text-[10px] font-bold border-sky-300 bg-white text-sky-800 dark:border-slate-700 dark:bg-slate-900 dark:text-sky-300">
                    {item.plausibility}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Basis: {item.evidenceBasis}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* PERSONALIZED ACTION PLAN */}
      {actionPlan.length > 0 && (
        <Card className="border-slate-200/80 shadow-md bg-white dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <CheckCircle className="h-4 w-4" /> Personalized Action Plan
            </div>
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
              Prioritized Next Steps
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Evidence-based actions to safeguard health and verify water conditions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {actionPlan.map((action, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 rounded-xl border border-slate-200/80 p-4 bg-white hover:bg-sky-50/40 transition-colors shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50"
              >
                <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 shadow-xs">
                  {action.priority}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">{action.title}</h5>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold dark:text-slate-400">
                      <Clock className="h-3 w-3 text-sky-600" /> {action.timeframe}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed dark:text-slate-300">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* DISCLAIMER FOOTER */}
      <div className="rounded-xl border border-dashed border-slate-300 p-4 bg-slate-50/70 text-xs text-slate-500 space-y-1.5 leading-relaxed dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
        <div className="font-bold text-slate-800 flex items-center gap-1.5 dark:text-slate-200">
          <HelpCircle className="h-4 w-4 text-sky-600" /> Educational Risk Assessment Disclaimer
        </div>
        <p>
          AquaVeris ActionIQ is designed as an educational decision-support tool. It does not replace certified laboratory testing,
          official drinking water advisories issued by local public health authorities, or professional medical advice.
          Contamination pathways are modeled hypotheses for guidance and investigation purposes.
        </p>
      </div>
    </div>
  )
}
