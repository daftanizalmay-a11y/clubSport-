'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const sections = [
  { key: 'show_news', label: 'Nyheter', desc: 'Visa publicerade nyheter på klubbsidan' },
  { key: 'show_events', label: 'Evenemang', desc: 'Visa kommande evenemang' },
  { key: 'show_board', label: 'Styrelse', desc: 'Visa styrelsemedlemmar' },
  { key: 'show_gallery', label: 'Galleri', desc: 'Visa fotogalleri' },
  { key: 'show_sponsors', label: 'Sponsorer', desc: 'Visa sponsorer' },
  { key: 'show_join', label: 'Ansökan', desc: 'Visa knapp och formulär för medlemsansökan' },
]

export default function SectionsToggle({ club, config }: { club: any; config: any }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    show_news: config?.show_news !== false,
    show_events: config?.show_events !== false,
    show_board: config?.show_board !== false,
    show_gallery: config?.show_gallery !== false,
    show_sponsors: config?.show_sponsors !== false,
    show_join: config?.show_join !== false,
  })
  const primaryColor = club?.primary_color || '#22c55e'

  async function save() {
    setSaving(true)
    await fetch('/api/website/config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: club.id, ...toggles }),
    })
    setSaving(false)
    router.refresh()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-w-xl">
      <h2 className="text-lg font-semibold text-white mb-2">Synliga sektioner</h2>
      <p className="text-white/40 text-sm mb-6">Välj vilka delar som ska visas på den publika klubbsidan.</p>
      <div className="space-y-3 mb-6">
        {sections.map(s => (
          <label key={s.key} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white/3 border border-white/10 cursor-pointer hover:bg-white/5 transition-colors">
            <div>
              <p className="text-white text-sm font-medium">{s.label}</p>
              <p className="text-white/30 text-xs">{s.desc}</p>
            </div>
            <input type="checkbox" checked={toggles[s.key]} onChange={e => setToggles(p => ({ ...p, [s.key]: e.target.checked }))}
              className="w-4 h-4 rounded accent-current" style={{ accentColor: primaryColor }} />
          </label>
        ))}
      </div>
      <button onClick={save} disabled={saving}
        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}>
        {saving ? 'Sparar...' : 'Spara ändringar'}
      </button>
    </div>
  )
}
