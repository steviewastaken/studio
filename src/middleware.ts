import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient()

  // This will refresh session if expired - required for Server Components
  // See https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
  await supabase.auth.getSession()

  // The rest of your middleware logic goes here.
  // ...

  // IMPORTANT: You must return the original request's response!
  // return NextResponse.next({
  //   request: {
  //     headers: request.headers,
  //   },
  // })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
