import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import JoinClient from '@/components/join/JoinClient'

export default async function JoinPage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token
  if (!token) redirect('/')

  const admin = createAdminClient()

  const { data: invitation } = await admin
    .from('invitations')
    .select('*, clubs(*), club_roles(*)')
    .eq('token', token)
    .eq('status', 'pending')
    .single()

  if (!invitation) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">❌</p>
          <h1 className="text-white text-xl font-bold mb-2">Ogiltig inbjudan</h1>
          <p className="text-white/40 text-sm">Denna inbjudan är inte längre giltig eller har redan använts.</p>
        </div>
      </main>
    )
  }

  const isExpired = new Date(invitation.expires_at) < new Date()
  if (isExpired) {
    return (
      <main className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-4xl mb-4">⏰</p>
          <h1 className="text-white text-xl font-bold mb-2">Inbjudan har gått ut</h1>
          <p className="text-white/40 text-sm">Be klubbadmin skicka en ny inbjudan.</p>
        </div>
      </main>
    )
  }

  return <JoinClient invitation={invitation} token={token} />
}
