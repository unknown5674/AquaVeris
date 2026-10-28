import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TestTube2,
  Calendar,
  Droplets,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import HistoricalTrendsChart from "@/features/history/components/HistoricalTrendsChart"
import { WATER_PARAMETERS } from "@/features/tests/constants"

export const metadata = {
  title: "Water Health Passport & Assessment History",
  description: "Review and track historical water testing assessments over time",
}

export default async function HistoryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // 1. Fetch all user test sessions
  const { data: sessions } = await (supabase.from("test_sessions") as any)
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
    .eq("user_id", user.id)
    .order("test_date", { ascending: false })

  const sessionList = (sessions ?? []) as Array<{
    id: string
    test_date: string
    assessment_status: string
    created_at: string
    water_sources: {
      id: string
      source_name: string
      source_type: string
      treatment_method: string | null
    }
  }>

  // 2. Fetch all readings for chart aggregation
  const sessionIds = sessionList.map((s) => s.id)
  let parameterHistory: Record<
    string,
    Array<{
      date: string
      sessionId: string
      value: number | null
      unit: string | null
      status: string
      referenceMax: number | null
    }>
  > = {}

  if (sessionIds.length > 0) {
    const { data: allReadings } = await (supabase.from("parameter_readings") as any)
      .select("test_session_id, parameter_code, measured_value, unit, evaluation_status, reference_max")
      .in("test_session_id", sessionIds)

    const sessionDateMap = new Map<string, string>()
    for (const s of sessionList) {
      sessionDateMap.set(s.id, s.test_date)
    }

    const readingsList = (allReadings ?? []) as Array<{
      test_session_id: string
      parameter_code: string
      measured_value: number | null
      unit: string | null
      evaluation_status: string
      reference_max: number | null
    }>

    for (const r of readingsList) {
      if (r.measured_value === null) continue
      const date = sessionDateMap.get(r.test_session_id) ?? "Unknown"
      if (!parameterHistory[r.parameter_code]) {
        parameterHistory[r.parameter_code] = []
      }
      parameterHistory[r.parameter_code].push({
        date,
        sessionId: r.test_session_id,
        value: r.measured_value,
        unit: r.unit,
        status: r.evaluation_status,
        referenceMax: r.reference_max,
      })
    }

    // Sort chronologically ascending for the charts
    for (const code of Object.keys(parameterHistory)) {
      parameterHistory[code].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }
  }

  const parameterNames: Record<string, string> = {}
  for (const p of WATER_PARAMETERS) {
    parameterNames[p.code] = p.name
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Water Health Passport</h1>
          <p className="text-muted-foreground mt-1">
            Historical assessments, longitudinal parameter charts, and water safety record.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/tests/new">
            <TestTube2 className="h-4 w-4" />
            New Assessment
          </Link>
        </Button>
      </div>

      {/* Historical Trend Chart Component */}
      <HistoricalTrendsChart
        parameterHistory={parameterHistory}
        parameterNames={parameterNames}
      />

      {/* Historical Test Sessions List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold tracking-tight">Saved Assessment Records</h3>

        {sessionList.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center py-12">
              <TestTube2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
              <CardTitle className="text-base">No previous water tests recorded</CardTitle>
              <CardDescription>
                When you input water measurements, your historical reports and trend lines will accumulate here.
              </CardDescription>
              <div className="pt-4 flex justify-center">
                <Button asChild>
                  <Link href="/dashboard/tests/new">Start First Test</Link>
                </Button>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessionList.map((session) => {
              const isFlagged = session.assessment_status === "flagged"

              return (
                <Card
                  key={session.id}
                  className="hover:border-primary/50 transition-colors shadow-sm"
                >
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`p-2.5 rounded-lg ${
                          isFlagged
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        }`}
                      >
                        {isFlagged ? (
                          <AlertTriangle className="h-5 w-5" />
                        ) : (
                          <CheckCircle2 className="h-5 w-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">
                            {session.water_sources?.source_name}
                          </span>
                          <Badge
                            variant={isFlagged ? "warning" : "success"}
                            className="text-[10px]"
                          >
                            {isFlagged ? "Flagged Concerns" : "All Clear"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" />
                            {session.water_sources?.source_type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {session.test_date}
                          </span>
                          <span>
                            Treatment:{" "}
                            <strong className="text-foreground capitalize">
                              {session.water_sources?.treatment_method ?? "None"}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" asChild className="gap-1 text-xs">
                      <Link href={`/dashboard/reports/${session.id}`}>
                        View Report <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

