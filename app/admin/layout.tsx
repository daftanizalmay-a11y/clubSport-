import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-[#060d1a] flex">
      <AdminSidebar profile={profile} />
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
