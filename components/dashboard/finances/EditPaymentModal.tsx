'use client'

import { useState } from 'react'
import { STATUS_LABELS, type PaymentStatus } from '@/lib/finances/payment-status'

interface Props {
  clubId: string
  paymentId: string
  currentAmount: number
  dueAmount: number
  currentNotes?: string | null
  primaryColor?: string
  onSave: () => void
}

export default function EditPaymentModal({
  clubId,
  paymentId,
  currentAmount,
  dueAmount,
  currentNotes,
  primaryColor = '#22c55e',
  onSave,
}: Props) {
  const [open, setOpen] = useState(false)
  const [amountPaid, setAmountPaid] = useState(currentAmount)
  const [notes, setNotes] = useState(currentNotes || '')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)

  const remaining = Math.max(0, dueAmount - amountPaid)

  async function handleSave() {
    setLoading(true)
    setMessage(null)
    setIsError(false)
    try {
      const res = await fetch(`/api/clubs/${clubId}/finances/payments/${paymentId}/update-amount`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount_paid: amountPaid, notes }),
      })
      const data = await res.json()
      if (!data.success) {
        setIsError(true)
        setMessage(data.error || 'Kunde inte spara')
        return
      }
      const label = data.status_label || STATUS_LABELS[data.status as PaymentStatus] || data.status
      setMessage(`Betalt: ${data.amount_paid.toLocaleString('sv-SE')} kr · Återstår: ${data.amount_remaining.toLocaleString('sv-SE')} kr · Status: ${label}`)
      onSave()
      setTimeout(() => setOpen(false), 1200)
    } catch {
      setIsError(true)
      setMessage('Nätverksfel')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button type="button" onClick={() => { setAmountPaid(currentAmount); setNotes(currentNotes || ''); setOpen(true); setMessage(null); setIsError(false) }}
        className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg cursor-pointer">
        Redigera belopp
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setOpen(false)}>
      <div className="bg-[#111827] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-white font-semibold mb-4">Uppdatera betalning</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Betalt belopp (kr)</label>
            <input
              type="number"
              min={0}
              max={dueAmount}
              value={amountPaid}
              onChange={e => setAmountPaid(Math.min(dueAmount, Math.max(0, parseInt(e.target.value) || 0)))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none"
            />
            <p className="text-xs text-white/40 mt-1.5">
              Förfallet: {dueAmount.toLocaleString('sv-SE')} kr · Betalt:{' '}
              <span className="text-[#22c55e]">{amountPaid.toLocaleString('sv-SE')} kr</span> · Återstår:{' '}
              <span className={remaining > 0 ? 'text-red-400' : 'text-green-400'}>{remaining.toLocaleString('sv-SE')} kr</span>
            </p>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-1.5">Anteckningar</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              placeholder="T.ex. Första delbetalningen"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none resize-none text-sm"
            />
          </div>

          {message && (
            <p className={`text-sm ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={() => setOpen(false)} className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm cursor-pointer">
              Avbryt
            </button>
            <button type="button" onClick={handleSave} disabled={loading}
              className="flex-1 font-semibold py-2.5 rounded-xl text-sm text-black disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: primaryColor }}>
              {loading ? 'Sparar...' : 'Spara'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
