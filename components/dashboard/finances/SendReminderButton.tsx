'use client'

import { useState } from 'react'

interface Props {
  clubId: string
  paymentId: string
  memberName: string
  amountRemaining: number
  lastReminder?: string | null
  reminderCount?: number
  onSent: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function SendReminderButton({
  clubId,
  paymentId,
  memberName,
  amountRemaining,
  lastReminder,
  reminderCount = 0,
  onSent,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    if (!confirm(`Skicka påminnelse till ${memberName} om ${amountRemaining.toLocaleString('sv-SE')} kr?`)) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/finances/payments/${paymentId}/send-reminder`, {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Kunde inte skicka')
        return
      }
      onSent()
    } catch {
      setError('Nätverksfel')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={handleSend} disabled={loading}
        className="text-xs px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg cursor-pointer disabled:opacity-50">
        {loading ? 'Skickar...' : '📧 Skicka påminnelse'}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {lastReminder && (
        <p className="text-xs text-white/30 mt-1">
          Påminnelser: {reminderCount}× · senast {formatDate(lastReminder)}
        </p>
      )}
    </div>
  )
}
