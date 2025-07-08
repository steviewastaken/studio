
// src/lib/supabase/server.ts
import { createServerComponentClient as createSupabaseServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js';

// This function now returns a SupabaseClient OR null
export const createServerClient = (): SupabaseClient | null => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase server credentials not found. Supabase client not created.");
    return null;
  }

  return createSupabaseServerClient({
    cookies: () => cookieStore,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
