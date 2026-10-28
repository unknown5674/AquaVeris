"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { updateProfileAction } from "@/features/auth/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ProfileFormProps {
  initialDisplayName: string
  initialLanguage: string
  email: string
}

export default function ProfileForm({
  initialDisplayName,
  initialLanguage,
  email,
}: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [preferredLanguage, setPreferredLanguage] = useState(initialLanguage)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData()
    formData.append("displayName", displayName)
    formData.append("preferredLanguage", preferredLanguage)

    const result = await updateProfileAction(formData)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message ?? "Profile updated")
    }

    setIsLoading(false)
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Manage your display details and notification preferences</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled className="bg-muted cursor-not-allowed" />
            <p className="text-xs text-muted-foreground">Your account email address is managed through Supabase Auth</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Language</Label>
            <Input
              id="preferredLanguage"
              value="English (en)"
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">Multilingual guidance (Hindi &amp; Marathi) is scheduled for post-MVP rollout.</p>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <Button type="submit" disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

