'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function LoginPage() {
  const router = useRouter()
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

    router.push('/dashboard')
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
          <p className="text-white/50 mt-2 text-sm">Logga in på ditt konto</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm text-white/70 mb-1.5">E-post</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="din@epost.se"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-white/70 mb-1.5">Lösenord</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Loggar in...' : 'Logga in'}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Inget konto?{' '}
            <Link href="/auth/register" className="text-[#22c55e] hover:underline">
              Registrera din förening
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
