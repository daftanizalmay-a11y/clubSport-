'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FINANCE_OPTION_CLASS, FINANCE_SELECT_CLASS } from './select-styles'

interface Props {
  club: any
  expenses: any[]
  userId: string
}

const categories = [
  'Utrustning', 'Transport', 'Mat & dryck', 'Lokalhyra',
  'Träningsavgifter', 'Tävlingsavgifter', 'Marknadsföring', 'Övrigt'
]

export default function ExpensesTracker({ club, expenses, userId }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', amount_sek: '', category: 'Övrigt' })
  const [file, setFile] = useState<File | null>(null)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? expenses : expenses.filter(e => e.status === filter)

  async function submitExpense(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let receipt_url = null
    let receipt_name = null

    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('club_id', club.id)
      const uploadRes = await fetch('/api/finances/upload-receipt', { method: 'POST', body: formData })
      if (uploadRes.ok) {
        const { url, name } = await uploadRes.json()
        receipt_url = url
        receipt_name = name
      }
    }

    await fetch('/api/finances/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        amount_sek: parseInt(form.amount_sek),
        club_id: club.id,
        receipt_url,
        receipt_name,
      }),
    })

    setShowForm(false)
    setForm({ title: '', description: '', amount_sek: '', category: 'Övrigt' })
    setFile(null)
    setLoading(false)
    router.refresh()
  }

  async function updateExpenseStatus(expenseId: string, status: string) {
    await fetch('/api/finances/expenses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense_id: expenseId, status }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {[
            { value: 'all', label: 'Alla' },
            { value: 'submitted', label: 'Väntar' },
            { value: 'approved', label: 'Godkända' },
            { value: 'rejected', label: 'Avvisade' },
            { value: 'reimbursed', label: 'Återbetalda' },
          ].map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${filter === f.value ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button onClick={() => setShowForm(true)}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
          + Ny utgift
        </button>
      </div>

      {/* New expense form */}
      {showForm && (
        <div className="bg-white/5 border border-[#22c55e]/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Ny utgift</h3>
          <form onSubmit={submitExpense} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Titel</label>
                <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Inköp av cricketbollar" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Belopp (kr)</label>
                <input required type="number" value={form.amount_sek} onChange={e => setForm(p => ({ ...p, amount_sek: e.target.value }))}
                  placeholder="850" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50" />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-1.5">Kategori</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className={`w-full ${FINANCE_SELECT_CLASS} focus:border-[#22c55e]/50`}>
                  {categories.map(c => <option key={c} value={c} className={FINANCE_OPTION_CLASS}>{c}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Beskrivning (valfritt)</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Kort beskrivning av utgiften..." rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-[#22c55e]/50 resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm text-white/60 mb-1.5">Kvitto (valfritt)</label>
                <div className="border border-dashed border-white/20 rounded-xl p-4 text-center hover:border-[#22c55e]/40 transition-colors">
                  <input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)}
                    className="hidden" id="receipt-upload" />
                  <label htmlFor="receipt-upload" className="cursor-pointer">
                    {file ? (
                      <p className="text-[#22c55e] text-sm">{file.name}</p>
                    ) : (
                      <div>
                        <p className="text-white/40 text-sm">Klicka för att ladda upp kvitto</p>
                        <p className="text-white/20 text-xs mt-1">JPG, PNG eller PDF</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)}
                className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm hover:border-white/40 transition-colors">
                Avbryt
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50">
                {loading ? 'Skickar...' : 'Skicka in utgift'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses list */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Utgifter ({filtered.length})</h3>
        {filtered.length === 0 ? (
          <p className="text-white/30 text-sm">Inga utgifter att visa.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <div key={e.id} className="flex items-start justify-between py-3 px-4 bg-white/3 rounded-xl border border-white/5">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-white text-sm font-medium">{e.title}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">{e.category}</span>
                  </div>
                  {e.description && <p className="text-white/40 text-xs mb-1">{e.description}</p>}
                  <p className="text-white/30 text-xs">{e.profiles?.full_name} · {new Date(e.submitted_at).toLocaleDateString('sv-SE')}</p>
                  {e.receipt_url && (
                    <a href={e.receipt_url} target="_blank" rel="noopener noreferrer"
                      className="text-[#22c55e] text-xs mt-1 inline-flex items-center gap-1 hover:underline">
                      📎 {e.receipt_name || 'Visa kvitto'}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <p className="text-white font-semibold text-sm">{e.amount_sek.toLocaleString('sv-SE')} kr</p>
                  <select value={e.status} onChange={(ev) => updateExpenseStatus(e.id, ev.target.value)}
                    className={FINANCE_SELECT_CLASS}>
                    <option value="submitted" className={FINANCE_OPTION_CLASS}>Väntar</option>
                    <option value="approved" className={FINANCE_OPTION_CLASS}>Godkänd</option>
                    <option value="rejected" className={FINANCE_OPTION_CLASS}>Avvisad</option>
                    <option value="reimbursed" className={FINANCE_OPTION_CLASS}>Återbetald</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
