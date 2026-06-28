'use client'
import { useState } from 'react'
import BrandingSettings from './BrandingSettings'
import FeeTypesSettings from './FeeTypesSettings'
import ClubInfoSettings from './ClubInfoSettings'
import DropdownManager from './DropdownManager'

interface Props {
  club: any
  feeTypes: any[]
  userId: string
}

const tabs = [
  { id: 'branding', label: 'Varumärke', icon: '🎨' },
  { id: 'fees', label: 'Avgiftstyper', icon: '💳' },
  { id: 'info', label: 'Klubbinfo', icon: '🏟️' },
  { id: 'dropdowns', label: 'Dropdowns', icon: '📋' },
]

export default function SettingsClient({ club, feeTypes, userId }: Props) {
  const [activeTab, setActiveTab] = useState('branding')

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Inställningar</p>
        <h1 className="text-3xl font-bold text-white">Inställningar</h1>
        <p className="text-white/50 mt-1">{club.name}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'branding' && <BrandingSettings club={club} />}
      {activeTab === 'fees' && <FeeTypesSettings club={club} feeTypes={feeTypes} />}
      {activeTab === 'info' && <ClubInfoSettings club={club} />}
      {activeTab === 'dropdowns' && <DropdownManager clubId={club.id} />}
    </div>
  )
}
