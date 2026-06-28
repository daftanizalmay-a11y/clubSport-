'use client'

import { useEffect, useState } from 'react'
import { Card } from './ui'

export default function MemberTeamsPage() {
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/member/teams', { credentials: 'include' })
      .then(r => r.json())
      .then(d => setTeams(d.teams || []))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-white/40 text-sm">Laddar lag...</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Mina lag</h1>
        <p className="text-white/40 text-sm mt-1">Lag du är registrerad i</p>
      </div>

      {teams.length === 0 ? (
        <Card>
          <p className="text-white/30 text-sm">Du tillhör inga lag ännu. Kontakta din klubb om du ska läggas till.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map(team => (
            <Card key={team.id}>
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-white text-lg">{team.name}</p>
                  <p className="text-white/40 text-sm">{team.club_name}</p>
                  <p className="text-white/30 text-xs mt-1">
                    {[team.age_group, team.gender, team.sport, team.season].filter(Boolean).join(' · ')}
                  </p>
                  {team.jersey_number != null && (
                    <p className="text-white/50 text-xs mt-2">Tröjnr {team.jersey_number}</p>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                  team.is_active && team.team_is_active ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'
                }`}>
                  {team.is_active && team.team_is_active ? 'Aktiv' : 'Inaktiv'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
