"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"

const sourceSchema = z.object({
  sourceName: z
    .string()
    .min(2, "Source name must be at least 2 characters")
    .max(60, "Source name cannot exceed 60 characters"),
  sourceType: z.enum([
    "municipal",
    "borewell",
    "groundwater_well",
    "bottled",
    "surface_water",
    "rainwater",
    "other",
  ]),
  treatmentMethod: z.enum([
    "none",
    "boiling",
    "ro",
    "uv",
    "activated_carbon",
    "chlorination",
    "sand_filter",
    "distillation",
    "other",
  ]),
})

export type SourceActionResult = {
  success?: boolean
  error?: string
  message?: string
}

/**
 * Server Action: Create Water Source
 */
export async function createSourceAction(formData: FormData): Promise<SourceActionResult> {
  const parsed = sourceSchema.safeParse({
    sourceName: formData.get("sourceName"),
    sourceType: formData.get("sourceType"),
    treatmentMethod: formData.get("treatmentMethod"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid source input" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Authentication required to add water source" }
  }

  const { error } = await (supabase.from("water_sources") as any).insert({
    user_id: user.id,
    source_name: parsed.data.sourceName,
    source_type: parsed.data.sourceType,
    treatment_method: parsed.data.treatmentMethod,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/sources")
  return { success: true, message: "Water source added successfully" }
}

/**
 * Server Action: Update Water Source
 */
export async function updateSourceAction(
  id: string,
  formData: FormData
): Promise<SourceActionResult> {
  const parsed = sourceSchema.safeParse({
    sourceName: formData.get("sourceName"),
    sourceType: formData.get("sourceType"),
    treatmentMethod: formData.get("treatmentMethod"),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid source input" }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Authentication required" }
  }

  const { error } = await (supabase.from("water_sources") as any)
    .update({
      source_name: parsed.data.sourceName,
      source_type: parsed.data.sourceType,
      treatment_method: parsed.data.treatmentMethod,
    })
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/sources")
  return { success: true, message: "Water source updated" }
}

/**
 * Server Action: Delete Water Source
 */
export async function deleteSourceAction(id: string): Promise<SourceActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: "Authentication required" }
  }

  const { error } = await (supabase.from("water_sources") as any)
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/sources")
  return { success: true, message: "Water source removed" }
}

