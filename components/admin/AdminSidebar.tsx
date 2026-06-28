'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/clubs', label: 'Klubbar', icon: '🏟️' },
  { href: '/admin/users', label: 'Användare', icon: '👥' },
  { href: '/admin/plans', label: 'Planer', icon: '💰' },
  { href: '/admin/settings', label: 'Inställningar', icon: '⚙️' },
]

export default function AdminSidebar({ profile }: { profile: any }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#030812] border-r border-white/10 flex flex-col">
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="text-lg font-bold">
          <span className="text-white">Club</span>
          <span className="text-[#22c55e]">Sports</span>
        </Link>
        <p className="text-white/30 text-xs mt-1 uppercase tracking-widest">Platform Admin</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${active ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
        <Link href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#22c55e]/60 hover:text-[#22c55e] hover:bg-[#22c55e]/5 transition-colors mt-4">
          <span>↩</span>
          Tillbaka till klubb
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center text-sm font-bold text-[#22c55e]">
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-[#22c55e] text-xs">Superadmin</p>
          </div>
        </div>
        <button onClick={handleSignOut}
          className="w-full text-left text-xs text-white/30 hover:text-white/60 transition-colors px-1">
          Logga ut
        </button>
      </div>
    </aside>
  )
}
