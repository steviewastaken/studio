
// src/lib/supabase/server.ts
import { createServerComponentClient as createSupabaseServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase server credentials not found. Using a dummy client for build process.");
    // This part is tricky because it needs a cookie store. We'll just return the client with dummy keys.
    // It will fail at runtime, but it should pass the build.
    return createSupabaseServerClient({
        cookies: () => cookieStore,
        supabaseUrl: 'http://localhost:54321',
        supabaseKey: 'dummy-key-for-build-process-only-you-will-not-see-this-in-the-app',
    });
  }

  return createSupabaseServerClient({
    cookies: () => cookieStore,
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
