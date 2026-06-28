import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import MemberProfilePage from '@/components/dashboard/members/MemberProfilePage'

export default async function DashboardMemberProfilePage({
  params,
}: {
  params: Promise<{ memberId: string }>
}) {
  const { memberId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: memberships } = await admin
    .from('club_memberships')
    .select('*, clubs(*), club_roles(*)')
    .eq('profile_id', user.id)
    .eq('status', 'active')

  const club = memberships?.[0]?.clubs as { id: string } | undefined
  if (!club) redirect('/onboarding')

  const isAdmin = memberships?.some((m: { club_roles?: { slug?: string } }) =>
    ['club_admin', 'superadmin'].includes(m.club_roles?.slug || '')
  ) ?? false

  const { data: roles } = await admin
    .from('club_roles')
    .select('*')
    .not('slug', 'eq', 'superadmin')
    .order('sort_order', { ascending: true })

  return (
    <MemberProfilePage
      clubId={club.id}
      memberId={memberId}
      userId={user.id}
      isAdmin={isAdmin}
      roles={roles || []}
    />
  )
}
