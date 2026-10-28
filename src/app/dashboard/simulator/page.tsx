import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import TreatmentSimulator from "@/features/simulator/components/TreatmentSimulator"

export const metadata = {
  title: "What-If Treatment Simulator",
  description: "Simulate and project purification outcomes across filtration and thermal methods",
}

export default async function SimulatorPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { sessionId } = await searchParams
  let initialReadings: Record<string, number> | undefined
  let initialSourceName: string | undefined

  if (sessionId) {
    const { data: session } = await (supabase.from("test_sessions") as any)
      .select(`
        id,
        water_sources (source_name),
        parameter_readings (parameter_code, measured_value)
      `)
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (session && session.parameter_readings) {
      initialSourceName = session.water_sources?.source_name ?? "Your Water Test"
      initialReadings = {}
      for (const r of session.parameter_readings) {
        if (r.measured_value !== null && r.measured_value !== undefined) {
          initialReadings[r.parameter_code] = Number(r.measured_value)
        }
      }
    }
  }

  return (
    <TreatmentSimulator
      initialReadings={initialReadings}
      initialSourceName={initialSourceName}
    />
  )
}
