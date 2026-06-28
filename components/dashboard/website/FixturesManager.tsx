'use client'

import { useState } from 'react'
import FixturesEditor from './FixturesEditor'
import FixtureImageUploader from './FixtureImageUploader'
import FixtureSourceSelector from './FixtureSourceSelector'

interface Props {
  clubId: string
  club: { id: string; name: string; sport: string; primary_color?: string }
  config: { fixture_source_id?: string; table_source_id?: string } | null
  fixtures: Record<string, unknown>[]
  defaultSubTab?: 'sources' | 'upload' | 'matches'
}

const subTabs = [
  { id: 'sources' as const, label: 'Källinställningar' },
  { id: 'upload' as const, label: 'Manuell uppladdning' },
  { id: 'matches' as const, label: 'Alla matcher' },
]

export default function FixturesManager({ clubId, club, config, fixtures, defaultSubTab = 'upload' }: Props) {
  const resolvedClubId = clubId || club?.id
  const [activeSubTab, setActiveSubTab] = useState(defaultSubTab)
  const primaryColor = club.primary_color || '#22c55e'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Fixtures & resultat</h2>
        <p className="text-white/40 text-sm mt-0.5">Hantera datakällor, ladda upp matchbilder och visa alla matcher.</p>
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

      {activeSubTab === 'sources' && <FixtureSourceSelector clubId={resolvedClubId} club={club} config={config} />}
      {activeSubTab === 'upload' && (
        <FixtureImageUploader
          clubId={resolvedClubId}
          club={{ name: club.name, primary_color: club.primary_color, sport: club.sport }}
        />
      )}
      {activeSubTab === 'matches' && <FixturesEditor club={club} fixtures={fixtures} embedded />}
    </div>
  )
}
