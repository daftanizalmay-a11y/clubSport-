'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const frequencies = [
  { value: 'one_time', label: 'Engångsavgift' },
  { value: 'per_match', label: 'Per match' },
  { value: 'monthly', label: 'Månadsvis' },
  { value: 'quarterly', label: 'Kvartalsvis' },
  { value: 'biannual', label: 'Halvårsvis' },
  { value: 'annual', label: 'Årlig' },
  { value: 'per_season', label: 'Per säsong' },
]

const emptyForm = { name: '', description: '', amount_sek: '', frequency: 'annual', is_mandatory: false }

export default function FeeTypesSettings({ club, feeTypes }: { club: any, feeTypes: any[] }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<any>(emptyForm)

  function startEdit(fee: any) {
    setEditingId(fee.id)
    setForm({ name: fee.name, description: fee.description || '', amount_sek: fee.amount_sek.toString(), frequency: fee.frequency, is_mandatory: fee.is_mandatory })
    setShowForm(true)
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, amount_sek: parseInt(form.amount_sek), club_id: club.id, fee_type_id: editingId }
    await fetch('/api/settings/fee-types', {
      method: editingId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    resetForm()
    router.refresh()
  }

  async function deleteFeeType(id: string) {
    if (!confirm('Är du säker på att du vill ta bort denna avgiftstyp?')) return
    await fetch('/api/settings/fee-types', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee_type_id: id }),
    })
    router.refresh()
  }

  async function toggleActive(fee: any) {
    await fetch('/api/settings/fee-types', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fee_type_id: fee.id, is_active: !fee.is_active }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Avgiftstyper</h2>
          <p className="text-white/40 text-sm mt-1">Definiera era avgifter. Dessa används när ni skapar avgiftssäsonger.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          + Ny avgift
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/5 border border-[#22c55e]/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">{editingId ? 'Redigera avgift' : 'Ny avgiftstyp'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Namn</label>
                <input required value={form.name} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))}
                  placeholder="Träningsavgift"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Belopp (kr)</label>
                <input required type="number" value={form.amount_sek} onChange={e => setForm((p: any) => ({ ...p, amount_sek: e.target.value }))}
                  placeholder="200"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Frekvens</label>
                <select value={form.frequency} onChange={e => setForm((p: any) => ({ ...p, frequency: e.target.value }))}
                  className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#22c55e]/50">
                  {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Beskrivning (valfritt)</label>
                <input value={form.description} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  placeholder="Kort beskrivning..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <button type="button" onClick={() => setForm((p: any) => ({ ...p, is_mandatory: !p.is_mandatory }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${form.is_mandatory ? 'bg-[#22c55e]' : 'bg-white/20'}`}>
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.is_mandatory ? 'left-5' : 'left-1'}`} />
                </button>
                <label className="text-sm text-white/60">Obligatorisk avgift</label>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={resetForm}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">
                Avbryt
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {loading ? 'Sparar...' : editingId ? 'Uppdatera' : 'Skapa avgift'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Fee types list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {feeTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/30 text-sm">Inga avgiftstyper definierade ännu.</p>
            <p className="text-white/20 text-xs mt-1">Skapa er första avgift ovan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {feeTypes.map((fee) => (
              <div key={fee.id} className={`flex items-center justify-between py-3 px-4 rounded-xl border transition-colors ${fee.is_active ? 'bg-white/3 border-white/10' : 'bg-white/1 border-white/5 opacity-50'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{fee.name}</p>
                    {fee.is_mandatory && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316]">Obligatorisk</span>
                    )}
                    {!fee.is_active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/30">Inaktiv</span>
                    )}
                  </div>
                  {fee.description && <p className="text-white/40 text-xs mt-0.5">{fee.description}</p>}
                  <p className="text-white/30 text-xs mt-1">
                    {frequencies.find(f => f.value === fee.frequency)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <p className="text-white font-semibold text-sm">{fee.amount_sek.toLocaleString('sv-SE')} kr</p>
                  <button onClick={() => toggleActive(fee)}
                    className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/50 hover:text-white transition-colors">
                    {fee.is_active ? 'Inaktivera' : 'Aktivera'}
                  </button>
                  <button onClick={() => startEdit(fee)}
                    className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-white/50 hover:text-white transition-colors">
                    Redigera
                  </button>
                  <button onClick={() => deleteFeeType(fee.id)}
                    className="text-xs px-2 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                    Ta bort
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
