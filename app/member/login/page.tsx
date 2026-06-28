'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const successMessage = searchParams.get('message')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Fel e-post eller lösenord. Försök igen.')
      setLoading(false)
      return
    }

    router.push('/member/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
          </Link>
          <p className="text-white/50 mt-2 text-sm">Medlemsportal — logga in</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {successMessage && (
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl px-4 py-3 text-[#22c55e] text-sm mb-5">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-white/70 mb-1.5">E-post</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-1.5">Lösenord</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
            </div>
            <div className="text-right">
              <Link href="/member/forgot-password" className="text-sm text-[#22c55e] hover:underline">
                Glömt lösenord?
              </Link>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl cursor-pointer">
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>
          <p className="text-center text-white/40 text-sm mt-6">
            Inget konto?{' '}
            <Link href="/member/register" className="text-[#22c55e] hover:underline">Skapa konto</Link>
          </p>
          <p className="text-center text-white/30 text-xs mt-3">
            Klubbadmin?{' '}
            <Link href="/auth/login" className="text-white/50 hover:text-white underline">Admin-inloggning</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

export default function MemberLoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <p className="text-white/40 text-sm">Laddar...</p>
      </main>
    }>
      <LoginForm />
    </Suspense>
  )
}
