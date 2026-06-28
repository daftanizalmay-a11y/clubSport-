'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { formatAuthError } from '@/lib/auth/errors'
import type { Session } from '@supabase/supabase-js'

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 disabled:opacity-50'

function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const tokenHash = params.get('token_hash')
    const type = params.get('type')
    if (code || (tokenHash && type === 'recovery')) {
      const callback = new URL('/member/auth/callback', window.location.origin)
      params.forEach((value, key) => callback.searchParams.set(key, value))
      window.location.replace(callback.toString())
      return
    }

    const supabase = createClient()
    let cancelled = false
    let unsubscribe: (() => void) | undefined

    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!cancelled && session) {
        setSessionReady(true)
        setInitializing(false)
        return
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: Session | null) => {
        if (!cancelled && (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
          setSessionReady(true)
          setInitializing(false)
        }
      })
      unsubscribe = () => subscription.unsubscribe()

      window.setTimeout(async () => {
        if (cancelled) return
        const { data: { session: delayed } } = await supabase.auth.getSession()
        if (delayed) {
          setSessionReady(true)
        } else {
          setError('Länken är ogiltig eller har gått ut. Begär en ny återställningslänk.')
        }
        setInitializing(false)
      }, 800)
    }

    checkSession()

    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [])

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!password || !confirmPassword) {
      setError('Fyll i båda fälten')
      return
    }
    if (password !== confirmPassword) {
      setError('Lösenorden matchar inte')
      return
    }
    if (password.length < 6) {
      setError('Lösenord måste vara minst 6 tecken')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(formatAuthError(updateError.message))
        setLoading(false)
        return
      }

      await supabase.auth.signOut()
      setSuccess(true)
      window.setTimeout(() => {
        router.push('/member/login?message=' + encodeURIComponent('Lösenord uppdaterat — logga in med ditt nya lösenord'))
      }, 1500)
    } catch (err) {
      setError(formatAuthError(err instanceof Error ? err.message : 'Ett fel uppstod'))
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">✓</p>
          <h1 className="text-2xl font-bold text-[#22c55e] mb-2">Lyckat!</h1>
          <p className="text-white/50 text-sm">Lösenord uppdaterat. Omdirigerar till inloggning...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/member/login" className="text-2xl font-bold">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
          </Link>
          <p className="text-white/50 mt-2 text-sm">Ange nytt lösenord</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {initializing ? (
            <p className="text-white/40 text-sm text-center">Verifierar återställningslänk...</p>
          ) : !sessionReady ? (
            <div className="text-center space-y-4">
              <p className="text-red-400 text-sm">{error}</p>
              <Link href="/member/forgot-password" className="inline-block text-sm text-[#22c55e] hover:underline">
                Begär ny länk
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Nytt lösenord</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Minst 6 tecken"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Bekräfta lösenord</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Bekräfta lösenord"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !password || !confirmPassword}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl cursor-pointer"
              >
                {loading ? 'Uppdaterar...' : 'Uppdatera lösenord'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/member/login" className="text-sm text-[#22c55e] hover:underline">
              Tillbaka till inloggning
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <p className="text-white/40 text-sm">Laddar...</p>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
