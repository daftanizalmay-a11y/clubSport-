'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

export default function MemberRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => {
      router.push('/member/dashboard')
      router.refresh()
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
          </Link>
          <p className="text-white/50 mt-2 text-sm">Skapa medlemskonto</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {success ? (
            <div className="text-center text-[#22c55e] py-4">
              <p className="font-semibold">Konto skapat! Omdirigerar...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Namn</label>
                <input required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1.5">E-post</label>
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-1.5">Lösenord</label>
                <input type="password" required minLength={6} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl cursor-pointer">
                {loading ? 'Skapar konto...' : 'Skapa konto'}
              </button>
            </form>
          )}
          <p className="text-center text-white/40 text-sm mt-6">
            Har du konto? <Link href="/member/login" className="text-[#22c55e] hover:underline">Logga in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
