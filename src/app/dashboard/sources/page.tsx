import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import SourceCard from "@/features/sources/components/SourceCard"
import SourceFormDialog from "@/features/sources/components/SourceFormDialog"
import { Droplets } from "lucide-react"

export const metadata = {
  title: "Water Sources",
  description: "Manage household and facility water monitoring sources",
}

export default async function SourcesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: sources, error } = await supabase
    .from("water_sources")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const sourceList = (sources ?? []) as Array<{
    id: string
    source_name: string
    source_type: string
    treatment_method: string | null
    created_at: string
  }>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Water Sources</h1>
          <p className="text-muted-foreground mt-1">
            Registered points-of-use and water supply locations monitored by AquaVeris.
          </p>
        </div>
        <SourceFormDialog />
      </div>

      {sourceList.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">No water sources configured</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first supply (such as your kitchen tap or private well) to start running quality assessments.
            </p>
          </div>
          <SourceFormDialog />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sourceList.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  )
}

