'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PendingInvitations({ club, invitations }: { club: any; invitations: any[] }) {
  const router = useRouter()
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  async function cancelInvitation(id: string) {
    setCancellingId(id)
    await fetch('/api/members/cancel-invite', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invitation_id: id }) })
    setCancellingId(null)
    router.refresh()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Väntande inbjudningar ({invitations.length})</h2>
      {invitations.length === 0 ? <p className="text-white/30 text-sm">Inga väntande inbjudningar.</p> : (
        <div className="space-y-3">
          {invitations.map(inv => (
            <div key={inv.id} className="flex items-center justify-between py-3 px-4 bg-white/3 rounded-xl border border-white/5">
              <div>
                <p className="text-white text-sm font-medium">{inv.email}</p>
                <p className="text-white/30 text-xs mt-0.5">Roll: {inv.club_roles?.name_sv} · Går ut: {new Date(inv.expires_at).toLocaleDateString('sv-SE')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-400/20 text-yellow-400">Väntande</span>
                <button onClick={() => cancelInvitation(inv.id)} disabled={cancellingId === inv.id} className="text-xs text-red-400/60 hover:text-red-400 transition-colors disabled:opacity-50">{cancellingId === inv.id ? '...' : 'Avbryt'}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
