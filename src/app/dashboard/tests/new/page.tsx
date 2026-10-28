import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import WaterTestForm from "@/features/tests/components/WaterTestForm"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Droplets } from "lucide-react"

export const metadata = {
  title: "New Water Quality Assessment",
  description: "Input water test readings and check treatment compatibility",
}

export default async function NewTestPage({
  searchParams,
}: {
  searchParams: Promise<{ sourceId?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { sourceId } = await searchParams

  const { data: sources } = await (supabase.from("water_sources") as any)
    .select("id, source_name, source_type, treatment_method")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const sourceList = (sources ?? []) as Array<{
    id: string
    source_name: string
    source_type: string
    treatment_method: string | null
  }>

  if (sourceList.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4 py-12 border border-dashed rounded-xl p-8">
        <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <Droplets className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">Add a Water Source First</h2>
        <p className="text-sm text-muted-foreground">
          Before entering test parameters, register the location or tap being tested (e.g. Kitchen Filter, Borewell).
        </p>
        <Button asChild>
          <Link href="/dashboard/sources">Register Water Source</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Water Quality Assessment</h1>
        <p className="text-muted-foreground mt-1">
          Enter laboratory or sensor readings to benchmark against standards and assess treatment adequacy.
        </p>
      </div>

      <WaterTestForm sources={sourceList} preselectedSourceId={sourceId} />
    </div>
  )
}

