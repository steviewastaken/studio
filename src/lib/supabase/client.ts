// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and/or Anon Key are missing. Please check your .env.local file.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  )
}
