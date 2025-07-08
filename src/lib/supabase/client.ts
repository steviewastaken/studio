
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // This error will be thrown if the secrets are not available at runtime or build time.
    // It's crucial for diagnosing deployment issues.
    throw new Error("Supabase URL and/or Anon Key are missing. Please check your environment configuration.");
  }
  
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
