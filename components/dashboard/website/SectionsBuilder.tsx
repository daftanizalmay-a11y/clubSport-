'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const builtinSections = [
  { type: 'news', label: 'Nyheter', icon: '📰', desc: 'Publicerade nyhetsartiklar' },
  { type: 'fixtures', label: 'Fixtures & resultat', icon: '🏆', desc: 'Kommande och spelade matcher' },
  { type: 'league_table', label: 'Lagstabell', icon: '📊', desc: 'Serietabell med poäng' },
  { type: 'players', label: 'Spelare', icon: '👥', desc: 'Aktiva spelarprofiler' },
  { type: 'board', label: 'Styrelse', icon: '🏛️', desc: 'Styrelsemedlemmar' },
  { type: 'gallery', label: 'Bildgalleri', icon: '🖼️', desc: 'Fotogalleri' },
  { type: 'sponsors', label: 'Sponsorer', icon: '🤝', desc: 'Sponsorlogotyper' },
  { type: 'contact', label: 'Kontakt', icon: '📬', desc: 'Kontaktformulär och info' },
]

export default function SectionsBuilder({ club, config, sections }: { club: any; config: any; sections: any[] }) {
  const router = useRouter()
  const primaryColor = club?.primary_color || '#22c55e'
  const [showAddBuiltin, setShowAddBuiltin] = useState(false)
  const [showAddCustom, setShowAddCustom] = useState(false)
  const [saving, setSaving] = useState(false)
  const [customForm, setCustomForm] = useState({ title: '', content: '', type: 'text' })

  async function addBuiltinSection(type: string, title: string) {
    setSaving(true)
    await fetch('/api/website/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: club.id, type, title, is_builtin: true, sort_order: sections.length }),
    })
    setSaving(false)
    setShowAddBuiltin(false)
    router.refresh()
  }

  async function addCustomSection(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/website/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ club_id: club.id, ...customForm, is_builtin: false, sort_order: sections.length }),
    })
    setSaving(false)
    setShowAddCustom(false)
    setCustomForm({ title: '', content: '', type: 'text' })
    router.refresh()
  }

  async function toggleSection(id: string, visible: boolean) {
    await fetch('/api/website/sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: id, is_visible: !visible }),
    })
    router.refresh()
  }

  async function deleteSection(id: string) {
    if (!confirm('Ta bort denna sektion?')) return
    await fetch('/api/website/sections', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: id }),
    })
    router.refresh()
  }

  async function moveSection(id: string, direction: 'up' | 'down') {
    const idx = sections.findIndex(s => s.id === id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === sections.length - 1) return
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1
    await fetch('/api/website/sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: id, sort_order: sections[swapIdx].sort_order }),
    })
    await fetch('/api/website/sections', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: sections[swapIdx].id, sort_order: sections[idx].sort_order }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Sektioner på klubbsidan</h2>
          <p className="text-white/40 text-sm mt-0.5">Lägg till, ta bort och sortera sektioner. Aktiva sektioner visas på er publika sida.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowAddBuiltin(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors">
            + Inbyggd sektion
          </button>
          <button onClick={() => setShowAddCustom(true)}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
            style={{ backgroundColor: primaryColor }}>
            + Anpassad sektion
          </button>
        </div>
      </div>

      {/* Add builtin */}
      {showAddBuiltin && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Välj inbyggd sektion</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {builtinSections.filter(b => !sections.some(s => s.type === b.type)).map(b => (
              <button key={b.type} onClick={() => addBuiltinSection(b.type, b.label)} disabled={saving}
                className="bg-white/5 border border-white/10 hover:border-white/30 rounded-xl p-4 text-left transition-colors disabled:opacity-50">
                <p className="text-2xl mb-2">{b.icon}</p>
                <p className="text-white text-sm font-medium">{b.label}</p>
                <p className="text-white/30 text-xs mt-0.5">{b.desc}</p>
              </button>
            ))}
          </div>
          <button onClick={() => setShowAddBuiltin(false)} className="mt-4 text-white/30 hover:text-white text-sm transition-colors">Avbryt</button>
        </div>
      )}

      {/* Add custom */}
      {showAddCustom && (
        <div className="bg-white/5 border border-[#22c55e]/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Ny anpassad sektion</h3>
          <form onSubmit={addCustomSection} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Sektionsrubrik</label>
              <input required value={customForm.title} onChange={e => setCustomForm(p => ({ ...p, title: e.target.value }))}
                placeholder="T.ex. Om oss, Träningsschema, Regler..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Typ</label>
              <select value={customForm.type} onChange={e => setCustomForm(p => ({ ...p, type: e.target.value }))}
                className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none">
                <option value="text">Fritext</option>
                <option value="image_text">Bild + text</option>
                <option value="custom">Anpassad</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Innehåll</label>
              <textarea required value={customForm.content} onChange={e => setCustomForm(p => ({ ...p, content: e.target.value }))}
                rows={4} placeholder="Skriv innehållet för denna sektion..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none" />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowAddCustom(false)}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">Avbryt</button>
              <button type="submit" disabled={saving}
                className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}>
                {saving ? 'Sparar...' : 'Skapa sektion'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sections list */}
      {sections.length === 0 ? (
        <div className="bg-white/5 border border-dashed border-white/20 rounded-2xl p-12 text-center">
          <p className="text-3xl mb-3">📄</p>
          <p className="text-white/30 text-sm">Inga sektioner ännu. Lägg till din första sektion ovan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sections.map((s, idx) => (
            <div key={s.id} className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-colors ${s.is_visible ? 'bg-white/5 border-white/10' : 'bg-white/2 border-white/5 opacity-60'}`}>
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(s.id, 'up')} disabled={idx === 0} className="text-white/20 hover:text-white disabled:opacity-20 text-xs leading-none">▲</button>
                <button onClick={() => moveSection(s.id, 'down')} disabled={idx === sections.length - 1} className="text-white/20 hover:text-white disabled:opacity-20 text-xs leading-none">▼</button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{s.title}</p>
                <p className="text-white/30 text-xs">{s.type} {s.is_builtin ? '· Inbyggd' : '· Anpassad'}</p>
              </div>
              {s.content && <p className="text-white/20 text-xs truncate max-w-xs hidden md:block">{s.content}</p>}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleSection(s.id, s.is_visible)}
                  className={`w-10 h-6 rounded-full transition-colors relative`}
                  style={s.is_visible ? { backgroundColor: primaryColor } : { backgroundColor: 'rgba(255,255,255,0.2)' }}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${s.is_visible ? 'left-5' : 'left-1'}`} />
                </button>
                <button onClick={() => deleteSection(s.id)}
                  className="text-xs px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
