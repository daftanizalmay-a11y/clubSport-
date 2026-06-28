'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function JoinClient({ invitation, token }: { invitation: any; token: string }) {
  const router = useRouter()
  const club = invitation.clubs
  const role = invitation.club_roles
  const primaryColor = club?.primary_color || '#22c55e'

  const [step, setStep] = useState<'info' | 'register' | 'login'>('info')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: '', password: '' })

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/join/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, ...form, email: invitation.email }),
    })

    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Något gick fel.'); setLoading(false); return }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        {/* Club header */}
        <div className="text-center mb-8">
          {club?.logo_url ? (
            <img src={club.logo_url} alt={club.name} className="w-16 h-16 rounded-2xl object-contain mx-auto mb-3" />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-black mx-auto mb-3" style={{ backgroundColor: primaryColor }}>
              {club?.name?.charAt(0)}
            </div>
          )}
          <h1 className="text-white text-xl font-bold">{club?.name}</h1>
          <p className="text-sm mt-1" style={{ color: primaryColor }}>{club?.subdomain}.clubsports.se</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          {step === 'info' && (
            <div className="text-center">
              <p className="text-3xl mb-4">🎉</p>
              <h2 className="text-white text-lg font-semibold mb-2">Du är inbjuden!</h2>
              <p className="text-white/50 text-sm mb-2">
                Du har blivit inbjuden som
              </p>
              <span className="inline-block text-sm px-3 py-1 rounded-full font-medium text-black mb-6" style={{ backgroundColor: primaryColor }}>
                {role?.name_sv}
              </span>
              <p className="text-white/30 text-xs mb-8">
                Inbjudan skickad till: {invitation.email}
              </p>
              <div className="space-y-3">
                <button onClick={() => setStep('register')}
                  className="w-full font-bold py-3 rounded-xl text-black transition-colors"
                  style={{ backgroundColor: primaryColor }}>
                  Skapa konto och gå med
                </button>
                <button onClick={() => setStep('login')}
                  className="w-full border border-white/20 text-white py-3 rounded-xl text-sm hover:border-white/40 transition-colors">
                  Jag har redan ett konto — logga in
                </button>
              </div>
            </div>
          )}

          {step === 'register' && (
            <form onSubmit={handleAccept} className="space-y-4">
              <h2 className="text-white font-semibold text-lg mb-4">Skapa ditt konto</h2>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Ditt namn</label>
                <input required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Förnamn Efternamn"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">E-post</label>
                <input type="email" value={invitation.email} disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Lösenord</label>
                <input type="password" required minLength={8} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Minst 8 tecken"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-black disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}>
                {loading ? 'Skapar konto...' : 'Gå med i klubben'}
              </button>
              <button type="button" onClick={() => setStep('info')}
                className="w-full text-white/30 hover:text-white text-sm transition-colors py-2">
                Tillbaka
              </button>
            </form>
          )}

          {step === 'login' && (
            <form onSubmit={handleAccept} className="space-y-4">
              <h2 className="text-white font-semibold text-lg mb-4">Logga in och gå med</h2>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">E-post</label>
                <input type="email" value={invitation.email} disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/40 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Lösenord</label>
                <input type="password" required value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Ditt lösenord"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">{error}</div>}
              <button type="submit" disabled={loading}
                className="w-full font-bold py-3 rounded-xl text-black disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}>
                {loading ? 'Loggar in...' : 'Logga in och gå med'}
              </button>
              <button type="button" onClick={() => setStep('info')}
                className="w-full text-white/30 hover:text-white text-sm transition-colors py-2">
                Tillbaka
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
