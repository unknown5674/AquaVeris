"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

const signupSchema = z
  .object({
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters")
      .max(50, "Display name must be under 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

const updateProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be under 50 characters"),
  preferredLanguage: z.string().default("en"),
})

export type AuthActionResult = {
  success?: boolean
  error?: string
  message?: string
}

/**
 * Server Action: Log in user
 */
export async function signInAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid credentials" }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

/**
 * Server Action: Sign up user directly (no email confirmation needed)
 */
export async function signUpAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid form input" }
  }

  const { createAdminClient } = await import("@/lib/supabase/admin")
  const supabase = await createClient()

  // 1. If service role key exists, auto-confirm user instantly with admin client
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const adminClient = createAdminClient()
      const { data: adminUser, error: adminError } = await adminClient.auth.admin.createUser({
        email: parsed.data.email,
        password: parsed.data.password,
        email_confirm: true,
        user_metadata: {
          display_name: parsed.data.displayName,
        },
      })

      if (adminError) {
        // If user already exists, report it clearly
        if (adminError.message.toLowerCase().includes("already registered")) {
          return { error: "An account with this email already exists. Please sign in." }
        }
        return { error: adminError.message }
      }

      // Auto sign-in right away
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      })

      if (signInErr) {
        return { success: true, message: "Account created! You can now sign in." }
      }

      revalidatePath("/dashboard")
      return { success: true }
    } catch (e: any) {
      console.warn("Admin create fallback to standard signup:", e)
    }
  }

  // Fallback standard signup
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Attempt immediate sign in in case project has email confirmation disabled
  const { error: directLoginErr } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (!directLoginErr) {
    revalidatePath("/dashboard")
    return { success: true }
  }

  return {
    success: true,
    message: "Account created! Please sign in with your password.",
  }
}

/**
 * Server Action: Sign out user
 */
export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
  redirect("/login")
}

/**
 * Server Action: Update profile info
 */
export async function updateProfileAction(formData: FormData): Promise<AuthActionResult> {
  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    preferredLanguage: formData.get("preferredLanguage") || "en",
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "You must be signed in to update your profile" }
  }

  const { error } = await (supabase.from("profiles") as any)
    .upsert({
      id: user.id,
      display_name: parsed.data.displayName,
      preferred_language: parsed.data.preferredLanguage,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
  return { success: true, message: "Profile updated successfully!" }
}
