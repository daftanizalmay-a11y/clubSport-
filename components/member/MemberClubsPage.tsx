'use client'

import { useEffect, useState } from 'react'
import { Card, formatDate } from './ui'

export default function MemberClubsPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/member/clubs', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setClubs(d.clubs || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-white/40 text-sm">Laddar klubbar...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mina klubbar</h1>
        <p className="text-white/40 text-sm mt-1">Föreningar du är medlem i</p>
      </div>

      {clubs.length === 0 ? (
        <Card><p className="text-white/30 text-sm">Du är inte medlem i någon klubb ännu.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map(entry => (
            <Card key={entry.membership_id}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-black flex-shrink-0"
                  style={{ backgroundColor: entry.club?.primary_color || '#22c55e' }}>
                  {entry.club?.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{entry.club?.name}</p>
                  <p className="text-white/40 text-sm">{entry.role?.name || 'Medlem'}</p>
                  <p className="text-white/30 text-xs mt-1">Medlem sedan {formatDate(entry.joined_at)}</p>
                  <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full ${
                    entry.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'
                  }`}>
                    {entry.status === 'active' ? 'Aktiv' : entry.status}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
