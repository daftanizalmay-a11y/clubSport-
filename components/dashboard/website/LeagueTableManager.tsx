'use client'

import { useState } from 'react'
import LeagueTableEditor from './LeagueTableEditor'
import TableImageUploader from './TableImageUploader'
import LeagueTableSourceSettings from './LeagueTableSourceSettings'

interface Props {
  clubId: string
  club: { id: string; name: string; primary_color?: string; sport?: string }
  leagueTables: Record<string, unknown>[]
  defaultSubTab?: 'sources' | 'upload' | 'teams'
}

const subTabs = [
  { id: 'sources' as const, label: 'Källinställningar' },
  { id: 'upload' as const, label: 'Manuell uppladdning' },
  { id: 'teams' as const, label: 'Alla lag' },
]

export default function LeagueTableManager({ clubId, club, leagueTables, defaultSubTab = 'upload' }: Props) {
  const resolvedClubId = clubId || club?.id
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab)
  const primaryColor = club.primary_color || '#22c55e'
  const tables = leagueTables as { id: string; name: string; season?: string; is_active?: boolean }[]
  const defaultTableId = tables.find(t => t.is_active)?.id || tables[0]?.id

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Lagstabell</h2>
        <p className="text-white/40 text-sm mt-0.5">Ladda upp tabellbilder, hantera källor och redigera lag.</p>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-xl p-1 w-fit flex-wrap">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSubTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
              activeSubTab === tab.id ? 'text-white font-medium' : 'text-white/40 hover:text-white'
            }`}
            style={activeSubTab === tab.id ? { backgroundColor: `${primaryColor}33` } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'sources' && (
        <LeagueTableSourceSettings club={club} leagueTables={tables} />
      )}
      {activeSubTab === 'upload' && (
        <TableImageUploader
          clubId={resolvedClubId}
          club={{ name: club.name, primary_color: club.primary_color }}
          leagueTables={tables}
          defaultTableId={defaultTableId}
        />
      )}
      {activeSubTab === 'teams' && (
        <LeagueTableEditor club={club} leagueTables={leagueTables} embedded />
      )}
    </div>
  )
}
