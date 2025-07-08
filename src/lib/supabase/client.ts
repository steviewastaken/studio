
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Temporarily remove hard crash on missing keys to allow initial deployment
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase credentials not found. This is expected if you haven't configured secrets yet. The app will not fully function.");
  }
  
  return createClientComponentClient({
    supabaseUrl: supabaseUrl || 'http://localhost:54321', // Provide a fallback for the build process
    supabaseKey: supabaseAnonKey || 'dummy-key-for-build',
  })
}
