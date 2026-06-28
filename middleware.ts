import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl

  // ── Resolve subdomain ──────────────────────────────────────────
  // In production: arianacc.clubsports.se → subdomain = "arianacc"
  // In dev:        localhost:3000          → subdomain = null
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'clubsports.se'
  let subdomain: string | null = null

  if (hostname !== 'localhost' && hostname !== appDomain) {
    const parts = hostname.split('.')
    if (parts.length >= 3) {
      subdomain = parts[0]
    }
  }

  // Inject subdomain into request headers so layouts/pages can read it
  const requestHeaders = new Headers(request.headers)
  if (subdomain) {
    requestHeaders.set('x-club-subdomain', subdomain)
  }

  // ── Supabase session refresh ───────────────────────────────────
  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request: { headers: requestHeaders },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — do not remove this
  const { data: { user } } = await supabase.auth.getUser()

  // ── Route protection ───────────────────────────────────────────
  const isAuthRoute = pathname.startsWith('/auth')
  const isMemberAuthPage =
    pathname === '/member/login' ||
    pathname === '/member/register' ||
    pathname === '/member/forgot-password'
  const isMemberResetPassword = pathname === '/member/reset-password'
  const isMemberAuthCallback = pathname === '/member/auth/callback'
  const isMemberPublic = isMemberAuthPage || isMemberResetPassword || isMemberAuthCallback
  const isMemberPortal = pathname.startsWith('/member')

  if (isMemberPortal) {
    if (!user && !isMemberPublic) {
      const url = request.nextUrl.clone()
      url.pathname = '/member/login'
      return NextResponse.redirect(url)
    }
    // Recovery creates a temporary session — allow reset-password even when logged in
    if (user && isMemberAuthPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/member/dashboard'
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const isPublicRoute =
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/public') ||
    pathname.startsWith('/api/join') ||
    pathname.startsWith('/api/cron') ||
    pathname.includes('/fixtures/webhook') ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/clubs') ||
    pathname.startsWith('/auth')

  if (!user && !isAuthRoute && !isPublicRoute) {
    // API routes handle their own auth and return JSON errors
    if (pathname.startsWith('/api/')) {
      return supabaseResponse
    }
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
