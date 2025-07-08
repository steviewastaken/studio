
"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { SupabaseClient } from '@supabase/supabase-js';

// This function now returns a SupabaseClient OR null
export const createClient = (): SupabaseClient | null => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // In a local/build environment without secrets, we don't want to crash the app.
    // Returning null allows the AuthProvider to handle this gracefully.
    console.warn("Supabase credentials not found. Supabase client not created.");
    return null;
  }
  
  return createClientComponentClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })
}
