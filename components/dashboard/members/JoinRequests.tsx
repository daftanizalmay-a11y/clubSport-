'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function JoinRequests({ club, joinRequests, roles }: { club: any; joinRequests: any[]; roles: any[] }) {
  const router = useRouter()
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({})
  const primaryColor = club?.primary_color || '#22c55e'

  async function approve(requestId: string) {
    const roleId = selectedRoles[requestId] || joinRequests.find(r => r.id === requestId)?.requested_role_id
    if (!roleId) { alert('Välj en roll innan du godkänner.'); return }
    setProcessingId(requestId)
    await fetch('/api/join/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, role_id: roleId }),
    })
    setProcessingId(null)
    router.refresh()
  }

  async function reject(requestId: string) {
    if (!confirm('Avvisa denna ansökan?')) return
    setProcessingId(requestId)
    await fetch('/api/join/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId }),
    })
    setProcessingId(null)
    router.refresh()
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Medlemsansökningar ({joinRequests.length})</h2>
      {joinRequests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-4xl mb-3">📬</p>
          <p className="text-white/30 text-sm">Inga väntande ansökningar.</p>
          <p className="text-white/20 text-xs mt-1">
            Dela klubbsidan: <span className="text-white/40">clubsports.se/clubs/{club.subdomain}</span>
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {joinRequests.map(req => (
            <div key={req.id} className="bg-white/3 border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white font-semibold">{req.full_name}</p>
                  <p className="text-white/40 text-sm">{req.email}</p>
                  {req.club_roles && (
                    <p className="text-xs mt-1" style={{ color: primaryColor }}>
                      Vill bli: {req.club_roles.name_sv}
                    </p>
                  )}
                  {req.message && (
                    <p className="text-white/50 text-sm mt-2 italic">"{req.message}"</p>
                  )}
                  <p className="text-white/20 text-xs mt-2">
                    {new Date(req.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>

                <div className="flex flex-col gap-2 min-w-48">
                  <select
                    value={selectedRoles[req.id] || req.requested_role_id || ''}
                    onChange={e => setSelectedRoles(p => ({ ...p, [req.id]: e.target.value }))}
                    className="w-full bg-[#0a0f1e] border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none">
                    <option value="">Välj roll...</option>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name_sv}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => approve(req.id)} disabled={processingId === req.id}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold text-black disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}>
                      {processingId === req.id ? '...' : 'Godkänn'}
                    </button>
                    <button onClick={() => reject(req.id)} disabled={processingId === req.id}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold bg-red-500/20 text-red-400 hover:bg-red-500/30 disabled:opacity-50 transition-colors">
                      Avvisa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-white/30 text-xs">
          Dela denna länk med nya medlemmar: 
          <a href={`/clubs/${club.subdomain}`} target="_blank" className="ml-1 hover:underline" style={{ color: primaryColor }}>
            clubsports.se/clubs/{club.subdomain}
          </a>
        </p>
      </div>
    </div>
  )
}
