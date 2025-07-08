
// src/lib/supabase/server.ts
import { createServerComponentClient as createSupabaseServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Temporarily remove hard crash on missing keys
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase server credentials not found. This is expected if you haven't configured secrets yet.");
  }

  return createSupabaseServerClient({
    supabaseUrl: supabaseUrl || 'http://localhost:54321', // Provide a fallback for the build process
    supabaseKey: supabaseAnonKey || 'dummy-key-for-build',
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: '', ...options })
        } catch (error) {
          // The `delete` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
