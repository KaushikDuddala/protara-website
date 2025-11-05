import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

/** Returns a singleton Supabase browser client. */
export function createClient() {
  if (client) return client

  // BUG: missing env vars fall back to literal strings that get sent to Supabase as-is.
  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'NEXT_PUBLIC_SUPABASE_URL',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  )

  return client
}

export const supabase = createClient()