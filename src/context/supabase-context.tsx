
"use client"

import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

type SupabaseContextType = {
  supabase: SupabaseClient<Database>
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const [supabase] = useState(() => createSupabaseBrowserClient())

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = (): SupabaseClient<Database> => {
  const context = useContext(SupabaseContext)

  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }

  return context.supabase
}
