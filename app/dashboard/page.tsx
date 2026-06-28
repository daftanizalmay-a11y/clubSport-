import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { groupMembersByProfile, roleLabel } from '@/lib/members/group-by-profile'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: memberships } = await admin
    .from('club_memberships')
    .select('*, clubs(*), club_roles(*)')
    .eq('profile_id', user.id)
    .eq('status', 'active')

  const club = memberships?.[0]?.clubs as any
  const role = memberships?.[0]?.club_roles as any

  if (!club) {
    if (profile?.is_superadmin) redirect('/admin')
    redirect('/onboarding')
  }

  const { data: memberRows } = await admin
    .from('club_memberships')
    .select('*, profiles(*), club_roles(*)')
    .eq('club_id', club.id)
    .eq('status', 'active')

  const uniqueMembers = groupMembersByProfile(memberRows || [])

  const { data: teams } = await admin
    .from('teams')
    .select('*')
    .eq('club_id', club.id)
    .eq('is_active', true)

  return (
    <div>
      <div className="mb-8">
        <p className="text-white/40 text-sm uppercase tracking-widest mb-1">Översikt</p>
        <h1 className="text-3xl font-bold text-white">{club.name}</h1>
        <p className="text-white/50 mt-1">{club.city ? `${club.city} · ` : ''}{club.sport} · {club.subdomain}.clubsports.se</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Medlemmar', value: uniqueMembers.length, icon: '👥' },
          { label: 'Lag', value: teams?.length || 0, icon: '🏆' },
          { label: 'Plan', value: club.plan_slug, icon: '⭐' },
          { label: 'Status', value: club.status, icon: '✅' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-2xl mb-2">{stat.icon}</p>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-white/40 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Medlemmar</h2>
        {uniqueMembers.length > 0 ? (
          <div className="space-y-3">
            {uniqueMembers.map(m => (
              <div key={m.profile_id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black"
                    style={{ backgroundColor: club.primary_color || '#22c55e' }}>
                    {m.profiles?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{m.profiles?.full_name || m.profiles?.email}</p>
                    <p className="text-white/40 text-xs">{m.profiles?.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 justify-end max-w-[50%]">
                  {m.roles.length > 0 ? m.roles.map(role => (
                    <span key={role.id || role.slug} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">
                      {roleLabel(role)}
                    </span>
                  )) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/60">Medlem</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Inga medlemmar ännu.</p>
        )}
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Lag</h2>
          <button className="text-sm px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:border-white/40 transition-colors">
            + Nytt lag
          </button>
        </div>
        {teams && teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <p className="text-white text-sm">{t.name}</p>
                <span className="text-xs text-white/40">{t.age_group || ''} {t.gender || ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm">Inga lag ännu.</p>
        )}
      </div>
    </div>
  )
}
