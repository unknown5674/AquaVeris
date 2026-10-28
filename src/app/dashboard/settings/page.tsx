import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileForm from "@/features/auth/components/ProfileForm"

export const metadata = {
  title: "Account Settings",
  description: "Manage your AquaVeris account preferences",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, preferred_language")
    .eq("id", user.id)
    .maybeSingle()

  const displayName = (profile as { display_name?: string | null } | null)?.display_name ?? ""
  const preferredLanguage = (profile as { preferred_language?: string } | null)?.preferred_language ?? "en"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your profile and system preferences.
        </p>
      </div>

      <ProfileForm
        initialDisplayName={displayName}
        initialLanguage={preferredLanguage}
        email={user.email ?? ""}
      />
    </div>
  )
}

