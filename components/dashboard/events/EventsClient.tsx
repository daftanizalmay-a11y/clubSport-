'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const eventTypes = [
  { value: 'match', label: '🏆 Match' },
  { value: 'training', label: '🏃 Träning' },
  { value: 'agm', label: '🏛️ Årsmöte (AGM)' },
  { value: 'board_meeting', label: '📋 Styrelsemöte' },
  { value: 'social', label: '🎉 Social aktivitet' },
  { value: 'other', label: '📅 Övrigt' },
]

export default function EventsClient({ club, userId }: { club: any; userId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [form, setForm] = useState({ title: '', type: 'match', date: '', time: '', location: '', description: '' })
  const primaryColor = club?.primary_color || '#22c55e'

  async function createEvent(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/events/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, club_id: club.id }) })
    if (res.ok) {
      const data = await res.json()
      setEvents(prev => [data, ...prev])
      setShowForm(false)
      setForm({ title: '', type: 'match', date: '', time: '', location: '', description: '' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Kalender</p>
        <h1 className="text-3xl font-bold text-white">Evenemang</h1>
        <p className="text-white/50 mt-1">{club.name}</p>
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={() => setShowForm(true)} className="font-semibold px-4 py-2 rounded-xl text-sm transition-colors text-black" style={{ backgroundColor: primaryColor }}>
          + Nytt evenemang
        </button>
      </div>

      {showForm && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
          <h3 className="text-white font-semibold mb-4">Skapa evenemang</h3>
          <form onSubmit={createEvent} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Titel</label>
              <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Hemmamatch vs Malmö CC" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Typ</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none">
                {eventTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Plats</label>
              <input value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Malmö IP" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Datum</label>
              <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">Tid</label>
              <input type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm text-white/60 mb-1.5">Beskrivning</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Mer information om evenemanget..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none" />
            </div>
            <div className="col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">Avbryt</button>
              <button type="submit" disabled={loading} className="flex-1 font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50 text-black" style={{ backgroundColor: primaryColor }}>{loading ? 'Skapar...' : 'Skapa evenemang'}</button>
            </div>
          </form>
        </div>
      )}

      {events.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📅</p>
          <p className="text-white/30 text-sm">Inga evenemang ännu. Skapa ert första evenemang ovan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(ev => (
            <div key={ev.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: primaryColor + '20' }}>
                {eventTypes.find(t => t.value === ev.type)?.label.split(' ')[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{ev.title}</p>
                <p className="text-white/40 text-xs mt-0.5">{ev.date} {ev.time} {ev.location ? `· ${ev.location}` : ''}</p>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">{eventTypes.find(t => t.value === ev.type)?.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
