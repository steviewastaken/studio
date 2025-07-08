
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '../database.types'

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:54321",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummykey"
  )
}
