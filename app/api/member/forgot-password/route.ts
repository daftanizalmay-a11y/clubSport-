import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPasswordResetRedirectUrl } from '@/lib/auth/app-url'
import { formatAuthError, isRateLimitError } from '@/lib/auth/errors'
import { isAuthEmailBypassEnabled } from '@/lib/auth/email-config'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-postadress krävs' }, { status: 400 })
    }

    const redirectTo = getPasswordResetRedirectUrl(req.nextUrl.origin)
    const normalizedEmail = email.trim().toLowerCase()

    if (isAuthEmailBypassEnabled()) {
      const admin = createAdminClient()
      const { data, error } = await admin.auth.admin.generateLink({
        type: 'recovery',
        email: normalizedEmail,
        options: { redirectTo },
      })

      if (error) {
        return NextResponse.json(
          { error: formatAuthError(error.message) },
          { status: isRateLimitError(error.message) ? 429 : 400 }
        )
      }

      return NextResponse.json({
        success: true,
        dev_mode: true,
        email: normalizedEmail,
        message: 'Utvecklingsläge: ingen e-post skickad. Använd länken nedan.',
        dev_reset_url: data.properties?.action_link ?? null,
      })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo,
    })

    if (error) {
      return NextResponse.json(
        { error: formatAuthError(error.message) },
        { status: isRateLimitError(error.message) ? 429 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      message: `Länk skickad till ${normalizedEmail}`,
    })
  } catch {
    return NextResponse.json({ error: 'Ett fel uppstod. Försök igen senare.' }, { status: 500 })
  }
}
