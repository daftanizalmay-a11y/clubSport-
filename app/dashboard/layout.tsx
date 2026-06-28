import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Sidebar from '@/components/dashboard/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
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

  const primaryClub = memberships?.[0]?.clubs as any
  const primaryRole = memberships?.[0]?.club_roles as any

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      <Sidebar
        profile={profile}
        club={primaryClub}
        role={primaryRole}
        memberships={memberships || []}
      />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
