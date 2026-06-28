'use client'
import { useState, useEffect } from 'react'
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

const colors = [
  '#22c55e', '#3b82f6', '#f97316', '#ef4444',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f59e0b',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const [form, setForm] = useState({
    club_name: '',
    subdomain: '',
    sport: '',
    contact_email: '',
    city: '',
    primary_color: '#22c55e',
    tagline: '',
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login'); return }
      setUser(data.user)
      setForm(prev => ({ ...prev, contact_email: data.user.email || '' }))
    })
  }, [router])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'club_name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20)
      setForm(prev => ({ ...prev, club_name: value, subdomain: slug }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setError(null)

    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, user_id: user.id }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || 'Något gick fel. Försök igen.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <span className="text-2xl font-bold">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
          </span>
          <p className="text-white/50 mt-2 text-sm">Sätt upp din förening</p>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-[#22c55e] text-black' : 'bg-white/10 text-white/40'}`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-[#22c55e]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <form onSubmit={step < 3 ? (e) => { e.preventDefault(); setStep(s => s + 1) } : handleSubmit} className="space-y-5">

            {/* Step 1: Club basics */}
            {step === 1 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Föreningens grunduppgifter</h2>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Föreningens namn</label>
                  <input
                    type="text" required value={form.club_name}
                    onChange={(e) => update('club_name', e.target.value)}
                    placeholder="Ariana Cricket Club"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Subdomain</label>
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:border-[#22c55e]/50 transition-colors">
                    <input
                      type="text" required value={form.subdomain}
                      onChange={(e) => update('subdomain', e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                      placeholder="arianacc"
                      className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-white/20 focus:outline-none"
                    />
                    <span className="px-4 text-white/30 text-sm">.clubsports.se</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Sport</label>
                  <select required value={form.sport} onChange={(e) => update('sport', e.target.value)}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]/50 transition-colors">
                    <option value="">Välj sport...</option>
                    {sports.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Stad</label>
                  <input
                    type="text" value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="Malmö"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <button type="submit" className="w-full bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 rounded-xl transition-colors">
                  Nästa
                </button>
              </>
            )}

            {/* Step 2: Branding */}
            {step === 2 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Varumärke & utseende</h2>
                <div>
                  <label className="block text-sm text-white/70 mb-1.5">Tagline (valfritt)</label>
                  <input
                    type="text" value={form.tagline}
                    onChange={(e) => update('tagline', e.target.value)}
                    placeholder="Vi spelar för gemenskap"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/70 mb-3">Välj er huvudfärg</label>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map((c) => (
                      <button key={c} type="button" onClick={() => update('primary_color', c)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${form.primary_color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <p className="text-white/30 text-xs mt-2">Vald färg: {form.primary_color}</p>
                </div>

                {/* Preview */}
                <div className="rounded-xl overflow-hidden border border-white/10 mt-4">
                  <div className="h-16 w-full" style={{ backgroundColor: form.primary_color + '33' }}>
                    <div className="h-full flex items-center px-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-black font-bold text-sm" style={{ backgroundColor: form.primary_color }}>
                        {form.club_name.charAt(0) || 'C'}
                      </div>
                      <div className="ml-3">
                        <p className="text-white text-sm font-semibold">{form.club_name || 'Din förening'}</p>
                        <p className="text-white/40 text-xs">{form.tagline || 'Tagline här'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 border border-white/20 hover:border-white/40 text-white py-3 rounded-xl transition-colors">
                    Tillbaka
                  </button>
                  <button type="submit" className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold py-3 rounded-xl transition-colors">
                    Nästa
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <>
                <h2 className="text-lg font-semibold mb-4">Bekräfta och skapa</h2>
                <div className="space-y-3 bg-white/5 rounded-xl p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">Förening</span>
                    <span className="text-white font-medium">{form.club_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Subdomain</span>
                    <span className="text-white font-medium">{form.subdomain}.clubsports.se</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Sport</span>
                    <span className="text-white font-medium">{form.sport}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Stad</span>
                    <span className="text-white font-medium">{form.city || '—'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50">Färg</span>
                    <div className="w-5 h-5 rounded-full" style={{ backgroundColor: form.primary_color }} />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 border border-white/20 hover:border-white/40 text-white py-3 rounded-xl transition-colors">
                    Tillbaka
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-colors">
                    {loading ? 'Skapar förening...' : 'Skapa förening'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </main>
  )
}
