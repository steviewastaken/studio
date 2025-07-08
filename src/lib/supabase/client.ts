
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During the initial build on Firebase App Hosting, secrets may not be available yet.
    // We prevent the build from crashing by not throwing an error here.
    // A warning is logged to the build logs instead.
    // The application will fail at RUNTIME if secrets are not configured in the Firebase Console.
    console.warn("Supabase credentials not found. This is expected only for the initial deployment. Please ensure secrets are configured in the Firebase Console.");
    
    // We must return a valid-looking but non-functional client to avoid downstream errors during build.
    return createClientComponentClient({
        supabaseUrl: "https://placeholder.supabase.co",
        supabaseKey: "placeholder-anon-key"
    })
  }
  
  // This is the correct path for runtime and subsequent builds with secrets.
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
