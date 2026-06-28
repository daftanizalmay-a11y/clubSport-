'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IconClose } from '../icons'

interface JoinFormModalProps {
  club: Record<string, unknown>
  roles: Record<string, unknown>[]
  ctaText: string
  open: boolean
  onClose: () => void
}

export default function JoinFormModal({ club, roles, open, onClose }: JoinFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ full_name: '', email: '', message: '', requested_role_id: '' })

  if (!open) return null

  async function submitRequest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const res = await fetch('/api/join/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, club_id: club.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Något gick fel.')
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
  }

  const inputClass = 'w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors duration-200'
  const inputStyle = {
    backgroundColor: 'var(--site-muted)',
    borderColor: 'var(--site-border)',
    color: 'var(--site-fg)',
    borderRadius: 'var(--site-radius)',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 md:px-6 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div
        className="w-full max-w-lg p-6 md:p-8 relative border"
        style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}
        role="dialog"
        aria-labelledby="join-form-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 opacity-40 hover:opacity-100 transition-opacity cursor-pointer"
          style={{ color: 'var(--site-fg)' }}
          aria-label="Stäng"
        >
          <IconClose />
        </button>

        <h2 id="join-form-title" className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--site-font-heading)', color: 'var(--site-card-fg)' }}>
          Ansök om medlemskap
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--site-muted-fg)' }}>
          Fyll i formuläret så kontaktar {club.name as string} dig.
        </p>

        {success ? (
          <div className="text-center py-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
              style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}
            >
              ✓
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--site-card-fg)' }}>Ansökan skickad!</h3>
            <p className="text-sm" style={{ color: 'var(--site-muted-fg)' }}>Vi återkommer till dig inom kort.</p>
            <button
              type="button"
              onClick={() => { onClose(); setSuccess(false) }}
              className="mt-6 px-6 py-2.5 text-sm font-semibold cursor-pointer"
              style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
            >
              Stäng
            </button>
          </div>
        ) : (
          <form onSubmit={submitRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--site-muted-fg)' }}>Namn</label>
                <input required value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Förnamn Efternamn" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-sm mb-1.5" style={{ color: 'var(--site-muted-fg)' }}>E-post</label>
                <input type="email" required value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="din@epost.se" className={inputClass} style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--site-muted-fg)' }}>Jag vill bli (valfritt)</label>
              <select value={form.requested_role_id} onChange={e => setForm(p => ({ ...p, requested_role_id: e.target.value }))}
                className={inputClass} style={{ ...inputStyle, backgroundColor: 'var(--site-bg)' }}>
                <option value="">Välj roll...</option>
                {roles.map(r => <option key={r.id as string} value={r.id as string}>{r.name_sv as string}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1.5" style={{ color: 'var(--site-muted-fg)' }}>Meddelande (valfritt)</label>
              <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                rows={3} placeholder="Berätta lite om dig själv..."
                className={`${inputClass} resize-none`} style={inputStyle} />
            </div>
            {error && (
              <div className="border rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: 'rgba(220,38,38,0.1)', borderColor: 'var(--site-destructive)', color: 'var(--site-destructive)' }}>
                {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              className="w-full font-bold py-3 text-sm disabled:opacity-50 transition-opacity cursor-pointer"
              style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}>
              {loading ? 'Skickar...' : 'Skicka ansökan'}
            </button>
            <p className="text-center text-xs" style={{ color: 'var(--site-muted-fg)' }}>
              Redan medlem?{' '}
              <Link href="/auth/login" className="underline" style={{ color: 'var(--site-primary)' }}>Logga in</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
