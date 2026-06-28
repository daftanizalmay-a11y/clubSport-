'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HeroEditor({ club, config }: { club: any; config: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    hero_title: config?.hero_title || '',
    hero_subtitle: config?.hero_subtitle || '',
    primary_cta_text: config?.primary_cta_text || 'Ansök om medlemskap',
    welcome_message: config?.welcome_message || '',
  })
  const primaryColor = club?.primary_color || '#22c55e'

  async function save() {
    setSaving(true)
    await fetch('/api/website/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: club.id, ...form }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-xl">
      <h2 className="text-lg font-semibold text-white mb-2">Hero & välkomst</h2>
      <p className="text-white/40 text-sm mb-6">Anpassa rubriker och välkomstmeddelande på klubbsidan.</p>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Rubrik</label>
          <input value={form.hero_title} onChange={e => setForm(p => ({ ...p, hero_title: e.target.value }))}
            placeholder={club.name}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
          <p className="text-white/20 text-xs mt-1">Lämna tom för att använda klubbnamnet</p>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Underrubrik</label>
          <input value={form.hero_subtitle} onChange={e => setForm(p => ({ ...p, hero_subtitle: e.target.value }))}
            placeholder={club.tagline || 'Din slogan här'}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Knapptext (CTA)</label>
          <input value={form.primary_cta_text} onChange={e => setForm(p => ({ ...p, primary_cta_text: e.target.value }))}
            placeholder="Ansök om medlemskap"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Välkomstmeddelande</label>
          <textarea value={form.welcome_message} onChange={e => setForm(p => ({ ...p, welcome_message: e.target.value }))}
            rows={4} placeholder="Välkommen till vår klubb..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none" />
        </div>
      </div>
      <button onClick={save} disabled={saving}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}>
        {saving ? 'Sparar...' : 'Spara ändringar'}
      </button>
    </div>
  )
}
