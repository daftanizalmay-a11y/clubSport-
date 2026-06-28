import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import BoardClient from '@/components/dashboard/board/BoardClient'

export default async function BoardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')
  const admin = createAdminClient()
  const { data: memberships } = await admin.from('club_memberships').select('*, clubs(*), club_roles(*)').eq('profile_id', user.id).eq('status', 'active')
  const club = memberships?.[0]?.clubs as any
  if (!club) redirect('/onboarding')
  const { data: boardMembers } = await admin.from('club_memberships').select('*, profiles(*), club_roles(*)').eq('club_id', club.id).eq('status', 'active')
  const board = boardMembers?.filter((m: any) => m.club_roles?.is_board_role) || []
  return <BoardClient club={club} board={board} userId={user.id} />
}
