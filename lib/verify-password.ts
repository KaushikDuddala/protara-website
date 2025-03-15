import { createClient } from "@/lib/supabase/server"

/**
 * Verifies an admin password against the `admin_credentials` table, falling back
 * to the `ADMIN_PASSWORD` environment variable. Single source of truth for the
 * admin auth used across the API routes.
 *
 * @param password - The password to verify, from a request body, query param, or header.
 * @returns The verified admin name (from the table, or "admin" for the env var), or null when invalid.
 */
export async function verifyAdminPassword(
  password: string | null | undefined
): Promise<string | null> {
  if (!password) return null

  if (password === process.env.ADMIN_PASSWORD) return "admin"

  const supabase = await createClient()
  const { data: admin } = await supabase
    .from("admin_credentials")
    .select("name")
    .eq("password", password)
    .maybeSingle()

  return admin?.name || null
}