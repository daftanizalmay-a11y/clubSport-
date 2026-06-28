import { createAdminClient } from '@/lib/supabase/admin'

export default async function AdminPage() {
  const admin = createAdminClient()

  const { data: clubs } = await admin
    .from('clubs')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: profiles } = await admin
    .from('profiles')
    .select('*')

  const { data: memberships } = await admin
    .from('club_memberships')
    .select('*')

  const totalClubs = clubs?.length || 0
  const totalUsers = profiles?.length || 0
  const starterClubs = clubs?.filter(c => c.plan_slug === 'starter').length || 0
  const proClubs = clubs?.filter(c => c.plan_slug === 'pro').length || 0
  const clubPlanClubs = clubs?.filter(c => c.plan_slug === 'club').length || 0
  const mrr = (proClubs * 299) + (clubPlanClubs * 699)

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Platform Admin</p>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/50 mt-1">ClubSports Platform Console</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Klubbar', value: totalClubs, icon: '🏟️', sub: 'totalt' },
          { label: 'Användare', value: totalUsers, icon: '👥', sub: 'registrerade' },
          { label: 'Medlemskap', value: memberships?.length || 0, icon: '🎫', sub: 'aktiva' },
          { label: 'MRR', value: `${mrr} kr`, icon: '💰', sub: 'månadsintäkt', green: true },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-2xl mb-2">{stat.icon}</p>
            <p className={`text-2xl font-bold ${stat.green ? 'text-[#22c55e]' : 'text-white'}`}>{stat.value}</p>
            <p className="text-white/40 text-sm mt-1">{stat.label}</p>
            <p className="text-white/20 text-xs">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Plan-fördelning</h2>
          <div className="space-y-3">
            {[
              { label: 'Starter', count: starterClubs, price: '0 kr', color: '#94a3b8' },
              { label: 'Pro', count: proClubs, price: '299 kr/mån', color: '#3b82f6' },
              { label: 'Club', count: clubPlanClubs, price: '699 kr/mån', color: '#22c55e' },
            ].map((p) => (
              <div key={p.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-white text-sm">{p.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white/40 text-xs">{p.price}</span>
                  <span className="text-white font-medium text-sm">{p.count} klubbar</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent clubs */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Senaste klubbar</h2>
          {clubs && clubs.length > 0 ? (
            <div className="space-y-3">
              {clubs.slice(0, 5).map((club) => (
                <div key={club.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black"
                      style={{ backgroundColor: club.primary_color || '#22c55e' }}>
                      {club.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{club.name}</p>
                      <p className="text-white/30 text-xs">{club.subdomain}.clubsports.se</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      club.plan_slug === 'club' ? 'bg-[#22c55e]/20 text-[#22c55e]' :
                      club.plan_slug === 'pro' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-white/10 text-white/40'
                    }`}>
                      {club.plan_slug}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      club.status === 'active' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {club.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/30 text-sm">Inga klubbar ännu.</p>
          )}
        </div>
      </div>

      {/* All users */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Användare</h2>
        {profiles && profiles.length > 0 ? (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                    {p.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{p.full_name}</p>
                    <p className="text-white/30 text-xs">{p.email}</p>
                  </div>
                </div>
                {p.is_superadmin && (
                  <span className="text-xs px-2 py-1 rounded-full bg-[#22c55e]/20 text-[#22c55e]">
                    Superadmin
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Inga användare.</p>
        )}
      </div>
    </div>
  )
}
