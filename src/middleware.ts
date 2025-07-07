
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Check if the environment variables are not just missing, but also not empty.
  if (!supabaseUrl || supabaseUrl.trim() === '' || !supabaseAnonKey || supabaseAnonKey.trim() === '') {
    // If the variables are not set correctly, the app can't connect to Supabase.
    // The client and server components will throw a more specific error later on.
    // We return here to avoid a crash loop in the middleware, allowing the rest of the app to render.
    return res;
  }

  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res }, {
    supabaseUrl: supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })

  // Refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  await supabase.auth.getSession()

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
