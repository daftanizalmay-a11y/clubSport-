'use client'
import { useState } from 'react'
import MembersList from './MembersList'
import InviteForm from './InviteForm'
import PendingInvitations from './PendingInvitations'
import JoinRequests from './JoinRequests'

interface Props { club: any; members: any[]; roles: any[]; invitations: any[]; joinRequests: any[]; userId: string }

export default function MembersClient({ club, members, roles, invitations, joinRequests, userId }: Props) {
  const [activeTab, setActiveTab] = useState('members')
  const uniqueActiveMembers = [...new Set(members.filter(m => m.status === 'active').map(m => m.profile_id))]
  const boardMembers = [...new Set(members.filter(m => m.club_roles?.is_board_role && m.status === 'active').map(m => m.profile_id))]

  const tabs = [
    { id: 'members', label: 'Medlemmar', icon: '👥' },
    { id: 'requests', label: 'Förfrågningar', icon: '📬', count: joinRequests.length },
    { id: 'invite', label: 'Bjud in', icon: '✉️' },
    { id: 'pending', label: 'Väntande', icon: '⏳', count: invitations.length },
  ]

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Förening</p>
        <h1 className="text-3xl font-bold text-white">Medlemmar</h1>
        <p className="text-white/50 mt-1">{club.name}</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{uniqueActiveMembers.length}</p><p className="text-white/40 text-sm mt-1">Aktiva medlemmar</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-white">{boardMembers.length}</p><p className="text-white/40 text-sm mt-1">Styrelsemedlemmar</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-[#f97316]">{joinRequests.length}</p><p className="text-white/40 text-sm mt-1">Ansökningar</p></div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5"><p className="text-2xl font-bold text-yellow-400">{invitations.length}</p><p className="text-white/40 text-sm mt-1">Väntande inbjudningar</p></div>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${activeTab === tab.id ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'}`}>
            <span>{tab.icon}</span>{tab.label}
            {tab.count && tab.count > 0 ? <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#f97316]/20 text-[#f97316]">{tab.count}</span> : null}
          </button>
        ))}
      </div>

      {activeTab === 'members' && <MembersList club={club} members={members} roles={roles} userId={userId} />}
      {activeTab === 'requests' && <JoinRequests club={club} joinRequests={joinRequests} roles={roles} />}
      {activeTab === 'invite' && <InviteForm club={club} roles={roles} onInvited={() => setActiveTab('pending')} />}
      {activeTab === 'pending' && <PendingInvitations club={club} invitations={invitations} />}
    </div>
  )
}
