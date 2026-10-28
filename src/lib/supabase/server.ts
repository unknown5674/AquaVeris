import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/types/database"

/**
 * Creates a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads and writes cookies to maintain the auth session.
 *
 * IMPORTANT: Always use supabase.auth.getUser() — never getSession() —
 * for server-side authorization decisions.
 */
export async function createClient() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co"
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

  return createServerClient<Database>(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore;
            // middleware handles session refresh.
          }
        },
      },
    }
  )
}

