
// src/lib/supabase/server.ts
import { createServerComponentClient as createSupabaseServerClient, type CookieOptions } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const createServerClient = () => {
  const cookieStore = cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During the initial build on Firebase App Hosting, secrets may not be available yet.
    // We prevent the build from crashing by not throwing an error here.
    // A warning is logged to the build logs instead.
    // The application will fail at RUNTIME if secrets are not configured in the Firebase Console.
    console.warn("Supabase credentials not found. This is expected only for the initial deployment. Please ensure secrets are configured in the Firebase Console.");
    
    // We must return a valid-looking but non-functional client to avoid downstream errors during build.
    return createSupabaseServerClient({
      supabaseUrl: "https://placeholder.supabase.co",
      supabaseKey: "placeholder-anon-key",
      cookies: {
        get() { return undefined; },
        set() {},
        remove() {},
      },
    });
  }

  return createSupabaseServerClient({
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseAnonKey,
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
