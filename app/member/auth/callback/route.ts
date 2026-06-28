import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { formatAuthError } from '@/lib/auth/errors'

/** Exchanges Supabase auth codes server-side (PKCE verifier lives in cookies). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/member/reset-password'

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll can run from Server Component context in some edge cases
          }
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    const errUrl = new URL('/member/forgot-password', origin)
    errUrl.searchParams.set('error', formatAuthError(error.message))
    return NextResponse.redirect(errUrl)
  }

  if (tokenHash && type === 'recovery') {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'recovery',
    })
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    const errUrl = new URL('/member/forgot-password', origin)
    errUrl.searchParams.set('error', formatAuthError(error.message))
    return NextResponse.redirect(errUrl)
  }

  return NextResponse.redirect(`${origin}/member/forgot-password?error=invalid_link`)
}
