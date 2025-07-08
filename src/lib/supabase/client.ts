
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If keys are missing, return a dummy client to allow the build to pass.
  // The app will not be functional, but it will deploy.
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found. Using a dummy client for build process. App will not be functional until secrets are configured.");
    return createClientComponentClient({
        supabaseUrl: 'http://localhost:54321',
        supabaseKey: 'dummy-key-for-build-process-only-you-will-not-see-this-in-the-app',
    });
  }
  
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
