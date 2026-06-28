'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { formatAuthError, isRateLimitError } from '@/lib/auth/errors'
import { isAuthEmailBypassPublic } from '@/lib/auth/email-config'

const COOLDOWN_MS = 60_000
const STORAGE_KEY = 'member_forgot_password_last'

function ForgotPasswordForm() {
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(urlError ? formatAuthError(urlError) : null)
  const [toast, setToast] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState('')
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [cooldownSec, setCooldownSec] = useState(0)
  const devBypass = isAuthEmailBypassPublic()

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    const last = sessionStorage.getItem(STORAGE_KEY)
    if (!last) return
    const remaining = COOLDOWN_MS - (Date.now() - Number(last))
    if (remaining > 0) {
      setCooldownSec(Math.ceil(remaining / 1000))
    }
  }, [])

  useEffect(() => {
    if (cooldownSec <= 0) return
    const t = window.setInterval(() => {
      setCooldownSec(s => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [cooldownSec])

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault()
    if (cooldownSec > 0) return

    setLoading(true)
    setError(null)
    setDevResetUrl(null)

    try {
      const res = await fetch('/api/member/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        const msg = data.error || 'Ett fel uppstod. Försök igen senare.'
        if (res.status === 429 || isRateLimitError(msg)) {
          showToast('För många försök. Vänta 1 minut och försök igen.')
          setError('För många försök. Vänta 1 minut och försök igen.')
          sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
          setCooldownSec(60)
        } else {
          setError(msg)
          showToast(msg)
        }
        return
      }

      sessionStorage.setItem(STORAGE_KEY, String(Date.now()))
      setCooldownSec(60)
      setSuccessEmail(data.email || email)
      setSent(true)

      if (data.dev_mode && data.dev_reset_url) {
        setDevResetUrl(data.dev_reset_url)
        showToast(`Utvecklingsläge: länk skapad för ${data.email || email}`)
      } else {
        showToast(data.message || `Länk skickad till ${data.email || email}`)
      }
    } catch {
      const msg = 'Ett fel uppstod. Försök igen senare.'
      setError(msg)
      showToast(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
      {toast && (
        <div className="fixed top-4 right-4 z-50 max-w-sm bg-[#111827] border border-white/10 text-white px-4 py-3 rounded-xl shadow-lg text-sm">
          {toast}
        </div>
      )}

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/member/login" className="text-2xl font-bold">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
          </Link>
          <p className="text-white/50 mt-2 text-sm">Återställ lösenord</p>
          {devBypass && (
            <p className="text-yellow-400/80 text-xs mt-2">Utvecklingsläge: e-post hoppas över (SKIP_AUTH_EMAILS)</p>
          )}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {sent ? (
            <div className="space-y-3">
              <p className="text-[#22c55e] font-semibold text-center">Klart!</p>
              {devResetUrl ? (
                <>
                  <p className="text-white/50 text-sm text-center">
                    Ingen e-post skickad. Klicka länken nedan för {successEmail}:
                  </p>
                  <a href={devResetUrl}
                    className="block text-xs break-all text-[#22c55e] hover:underline bg-white/5 border border-white/10 rounded-xl p-3">
                    {devResetUrl}
                  </a>
                </>
              ) : (
                <p className="text-white/50 text-sm text-center">
                  Länk skickad till <span className="text-white">{successEmail}</span>. Kolla din inkorg.
                </p>
              )}
              <Link href="/member/login" className="block text-center text-sm text-[#22c55e] hover:underline">
                Tillbaka till inloggning
              </Link>
            </div>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div>
                <label className="block text-sm text-white/70 mb-1.5">E-post</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="din@epost.se"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <button type="submit" disabled={loading || cooldownSec > 0}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl cursor-pointer">
                {loading
                  ? 'Skickar...'
                  : cooldownSec > 0
                    ? `Vänta ${cooldownSec}s`
                    : 'Skicka återställningslänk'}
              </button>
              {cooldownSec > 0 && (
                <p className="text-white/30 text-xs text-center">
                  Skydd mot e-postgräns — vänta innan du försöker igen
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function MemberForgotPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <p className="text-white/40 text-sm">Laddar...</p>
      </main>
    }>
      <ForgotPasswordForm />
    </Suspense>
  )
}
