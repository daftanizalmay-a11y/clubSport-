'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

const sports = [
  { value: 'cricket', label: '🏏 Cricket' },
  { value: 'football', label: '⚽ Fotboll' },
  { value: 'basketball', label: '🏀 Basket' },
  { value: 'volleyball', label: '🏐 Volleyboll' },
  { value: 'hockey', label: '🏒 Hockey' },
  { value: 'tennis', label: '🎾 Tennis' },
  { value: 'badminton', label: '🏸 Badminton' },
  { value: 'athletics', label: '🏃 Friidrott' },
  { value: 'swimming', label: '🏊 Simning' },
  { value: 'handball', label: '🤾 Handboll' },
  { value: 'floorball', label: '🏑 Innebandy' },
  { value: 'rugby', label: '🏉 Rugby' },
  { value: 'multi_sport', label: '🏅 Flera sporter' },
  { value: 'other', label: '⚡ Annan sport' },
]

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    club_name: '',
    subdomain: '',
    sport: '',
    contact_email: '',
  })

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === 'club_name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
      setForm((prev) => ({ ...prev, club_name: value, subdomain: slug }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
          </Link>
          <p className="text-white/50 mt-2 text-sm">Registrera din förening — gratis att starta</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-[#22c55e] text-black' : 'bg-white/10 text-white/40'}`}>
                {s}
              </div>
              {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#22c55e]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit} className="space-y-5">

            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Ditt konto</h2>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Ditt namn</label>
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => update('full_name', e.target.value)}
                    placeholder="Förnamn Efternamn"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">E-post</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    placeholder="din@epost.se"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Lösenord</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={form.password}
                    onChange={(e) => update('password', e.target.value)}
                    placeholder="Minst 8 tecken"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <button type="submit" className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 rounded-xl transition-colors">
                  Nästa
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Din förening</h2>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Föreningens namn</label>
                  <input
                    type="text"
                    required
                    value={form.club_name}
                    onChange={(e) => update('club_name', e.target.value)}
                    placeholder="Ariana Cricket Club"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Subdomain</label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#22c55e]/50 transition-colors">
                    <input
                      type="text"
                      required
                      value={form.subdomain}
                      onChange={(e) => update('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="arianacc"
                      className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-white/20 focus:outline-none"
                    />
                    <span className="px-4 text-white/30 text-sm">.clubsports.se</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Sport</label>
                  <select
                    required
                    value={form.sport}
                    onChange={(e) => update('sport', e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  >
                    <option value="">Välj sport...</option>
                    {sports.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-white/20 hover:border-white/40 text-white py-3 rounded-xl transition-colors">
                    Tillbaka
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors">
                    {loading ? 'Skapar konto...' : 'Skapa konto'}
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Har du redan ett konto?{' '}
            <Link href="/auth/login" className="text-[#22c55e] hover:underline">
              Logga in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
