import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Droplets, TestTube2, AlertTriangle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import SourceFormDialog from "@/features/sources/components/SourceFormDialog"
import SourceCard from "@/features/sources/components/SourceCard"

export const metadata = { title: "Dashboard" }

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle()

  const { data: sources } = await supabase
    .from("water_sources")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const { count: sessionCount } = await supabase
    .from("test_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: flaggedCount } = await supabase
    .from("test_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("assessment_status", "flagged")

  const sourceList = (sources ?? []) as Array<{
    id: string
    source_name: string
    source_type: string
    treatment_method: string | null
    created_at: string
  }>

  const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? "there"

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Good day, {displayName} 👋
            </h1>
          </div>
          <p className="text-slate-500 mt-1 text-sm dark:text-slate-400">
            AquaVeris water quality risk intelligence overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SourceFormDialog />
          <Button asChild className="gap-2 shadow-sm shadow-sky-600/25">
            <Link href="/dashboard/tests/new">
              <TestTube2 className="h-4 w-4" />
              New Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary metric cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Card className="hover:border-sky-300 dark:hover:border-sky-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Water Sources
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 dark:bg-sky-950/60 dark:border-sky-900 dark:text-sky-400">
              <Droplets className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {sourceList.length}
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Active supply profiles</p>
          </CardContent>
        </Card>

        <Card className="hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Total Assessments
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 dark:bg-blue-950/60 dark:border-blue-900 dark:text-blue-400">
              <TestTube2 className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {sessionCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Laboratory &amp; test strip runs</p>
          </CardContent>
        </Card>

        <Card className="hover:border-amber-300 dark:hover:border-amber-800 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Flagged Risks
            </CardTitle>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 dark:bg-amber-950/60 dark:border-amber-900 dark:text-amber-400">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-500">
              {flaggedCount ?? 0}
            </div>
            <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Gaps needing attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Primary Sources Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Your Water Sources
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Points of consumption and their configured treatment
            </p>
          </div>
          {sourceList.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="text-xs gap-1 text-sky-600 hover:text-sky-700 hover:bg-sky-50">
              <Link href="/dashboard/sources">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {sourceList.length === 0 ? (
          <Card className="border-dashed border-sky-200/80 bg-sky-50/30 dark:border-slate-800 dark:bg-slate-900/40">
            <CardHeader className="text-center py-12">
              <div className="h-12 w-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-3 border border-sky-200/60 shadow-xs">
                <Droplets className="h-6 w-6" />
              </div>
              <CardTitle className="text-lg font-semibold">No water sources created yet</CardTitle>
              <CardDescription className="max-w-sm mx-auto text-sm">
                Add your drinking water source (e.g. tap, borewell, bottled) to start monitoring risk and treatment compatibility.
              </CardDescription>
              <div className="pt-4 flex justify-center">
                <SourceFormDialog />
              </div>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sourceList.slice(0, 3).map((source) => (
              <SourceCard key={source.id} source={source} />
            ))}
          </div>
        )}
      </div>

      {/* Feature banner */}
      <Card className="relative overflow-hidden border-sky-200/80 bg-gradient-to-r from-sky-50 via-white to-cyan-50/60 p-1 dark:border-sky-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/40">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="relative z-10">
          <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-semibold text-xs uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" /> Smart Treatment Reality Check
          </div>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
            Don&apos;t assume your filter makes water 100% safe
          </CardTitle>
          <CardDescription className="max-w-xl text-slate-600 text-sm leading-relaxed dark:text-slate-300">
            Common water treatments like boiling eliminate bacteria but can concentrate nitrates and heavy metals.
            AquaVeris verifies chemical and biological safety against authoritative standards.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
