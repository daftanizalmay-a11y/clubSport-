'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import HeroEditor from './HeroEditor'
import NewsEditor from './NewsEditor'
import GalleryEditor from './GalleryEditor'
import SponsorsEditor from './SponsorsEditor'
import SectionsBuilder from './SectionsBuilder'
import LeagueTableManager from './LeagueTableManager'
import FixturesManager from './FixturesManager'
import TemplateSelector from './TemplateSelector'

interface Props {
  club: any
  config: any
  posts: any[]
  sponsors: any[]
  gallery: any[]
  sections: any[]
  leagueTables: any[]
  fixtures: any[]
  members: any[]
  userId: string
}

const tabs = [
  { id: 'template', label: 'Mall', icon: '🎭' },
  { id: 'sections', label: 'Sektioner', icon: '⚙️' },
  { id: 'hero', label: 'Hero', icon: '🎨' },
  { id: 'news', label: 'Nyheter', icon: '📰' },
  { id: 'fixtures', label: 'Fixtures', icon: '🏆' },
  { id: 'league', label: 'Tabell', icon: '📊' },
  { id: 'gallery', label: 'Galleri', icon: '🖼️' },
  { id: 'sponsors', label: 'Sponsorer', icon: '🤝' },
]

export default function WebsiteClient({ club, config, posts, sponsors, gallery, sections, leagueTables, fixtures, members, userId }: Props) {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState('sections')
  const primaryColor = club?.primary_color || '#22c55e'
  const clubId = club?.id as string

  useEffect(() => {
    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [tabParam])

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Hemsida</p>
          <h1 className="text-3xl font-bold text-white">Klubbsida</h1>
          <p className="text-white/50 mt-1">{club.name}</p>
        </div>
        <a href={`/clubs/${club.subdomain}`} target="_blank"
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm">
          🌐 Förhandsgranska →
        </a>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'template' && <TemplateSelector club={club} config={config} />}
      {activeTab === 'sections' && <SectionsBuilder club={club} config={config} sections={sections} />}
      {activeTab === 'hero' && <HeroEditor club={club} config={config} />}
      {activeTab === 'news' && <NewsEditor club={club} posts={posts} userId={userId} />}
      {activeTab === 'fixtures' && (
        <FixturesManager
          clubId={clubId}
          club={club}
          config={config}
          fixtures={fixtures}
          defaultSubTab="upload"
        />
      )}
      {activeTab === 'league' && (
        <LeagueTableManager
          clubId={clubId}
          club={club}
          leagueTables={leagueTables}
          defaultSubTab="upload"
        />
      )}
      {activeTab === 'gallery' && <GalleryEditor club={club} gallery={gallery} />}
      {activeTab === 'sponsors' && <SponsorsEditor club={club} sponsors={sponsors} />}
    </div>
  )
}
