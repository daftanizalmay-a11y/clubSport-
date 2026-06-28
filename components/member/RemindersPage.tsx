'use client'

import { useEffect, useState } from 'react'
import { Card, formatDate } from './ui'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/member/reminders', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setReminders(d.reminders || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-white/40 text-sm">Laddar påminnelser...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mina påminnelser</h1>
        <p className="text-white/40 text-sm mt-1">Avgiftspåminnelser du har fått</p>
      </div>

      <Card>
        <p className="text-white/40 text-sm mb-4">Totalt: <span className="text-white font-semibold">{reminders.length}</span> st</p>
        {reminders.length === 0 ? (
          <p className="text-white/30 text-sm">Inga påminnelser mottagna.</p>
        ) : (
          <ul className="space-y-3">
            {reminders.map(r => (
              <li key={r.id} className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white text-sm">{r.title || r.message}</p>
                    {r.club_name && <p className="text-white/40 text-xs">{r.club_name}</p>}
                    <p className="text-white/30 text-xs mt-1">{formatDate(r.sent_at)}</p>
                  </div>
                  <span className="text-red-300 font-semibold text-sm flex-shrink-0">
                    {r.amount_remaining?.toLocaleString('sv-SE')} kr
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
