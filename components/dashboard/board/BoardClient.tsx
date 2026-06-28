'use client'
import { useState } from 'react'

const boardRoleOrder = ['chairman', 'vice_chairman', 'secretary', 'vice_secretary', 'treasurer', 'revisor', 'board_member', 'deputy_member', 'youth_leader', 'pr_officer', 'events_coordinator', 'welfare_officer']

export default function BoardClient({ club, board, userId }: { club: any; board: any[]; userId: string }) {
  const [activeTab, setActiveTab] = useState('board')
  const primaryColor = club?.primary_color || '#22c55e'

  const sortedBoard = [...board].sort((a, b) => {
    const ai = boardRoleOrder.indexOf(a.club_roles?.slug)
    const bi = boardRoleOrder.indexOf(b.club_roles?.slug)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  const tabs = [
    { id: 'board', label: 'Styrelse', icon: '🏛️' },
    { id: 'meetings', label: 'Möten', icon: '📋' },
    { id: 'documents', label: 'Dokument', icon: '📄' },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Governance</p>
        <h1 className="text-3xl font-bold text-white">Styrelse</h1>
        <p className="text-white/50 mt-1">{club.name}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{board.length}</p><p className="text-white/40 text-sm mt-1">Styrelsemedlemmar</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{board.filter(m => ['chairman','vice_chairman','secretary','treasurer'].includes(m.club_roles?.slug)).length}</p><p className="text-white/40 text-sm mt-1">Ordinarie poster</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-yellow-400">{board.filter(m => m.club_roles?.slug === 'deputy_member').length}</p><p className="text-white/40 text-sm mt-1">Suppleanter</p></div>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'board' && (
        <div>
          {sortedBoard.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">🏛️</p>
              <p className="text-white/30 text-sm">Inga styrelsemedlemmar ännu.</p>
              <p className="text-white/20 text-xs mt-1">Gå till Medlemmar och tilldela styrelseroller.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedBoard.map(m => (
                <div key={m.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-black" style={{ backgroundColor: primaryColor }}>
                      {m.profiles?.full_name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{m.profiles?.full_name}</p>
                      <p className="text-xs font-medium" style={{ color: primaryColor }}>{m.club_roles?.name_sv}</p>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs">{m.profiles?.email}</p>
                  {m.profiles?.phone && <p className="text-white/30 text-xs mt-0.5">{m.profiles?.phone}</p>}
                  {m.club_roles?.is_board_role && (
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">Styrelsepost</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-white font-semibold mb-1">Möteshantering</p>
          <p className="text-white/30 text-sm">Protokoll, röstningar och styrelsemöten kommer snart.</p>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">📄</p>
          <p className="text-white font-semibold mb-1">Dokument</p>
          <p className="text-white/30 text-sm">Stadgar, protokoll och styrelsedokument kommer snart.</p>
        </div>
      )}
    </div>
  )
}
