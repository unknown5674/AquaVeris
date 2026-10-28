import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

/**
 * Creates an admin Supabase client using the service role key.
 * Used exclusively for server-side operations like instant auto-confirming users.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

