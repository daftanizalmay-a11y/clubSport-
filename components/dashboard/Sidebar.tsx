'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/browser'
import { useRouter } from 'next/navigation'

interface SidebarProps {
  profile: any
  club: any
  role: any
  memberships: any[]
}

const navItems = [
  { href: '/dashboard', label: 'Översikt', icon: '📊' },
  { href: '/dashboard/members', label: 'Medlemmar', icon: '👥' },
  { href: '/dashboard/teams', label: 'Lag', icon: '🏆' },
  { href: '/dashboard/finances', label: 'Finanser', icon: '💰' },
  { href: '/dashboard/board', label: 'Styrelse', icon: '🏛️' },
  { href: '/dashboard/events', label: 'Evenemang', icon: '📅' },
  { href: '/dashboard/ai', label: 'AI-assistent', icon: '🤖' },
  { href: '/dashboard/website', label: 'Klubbsida', icon: '🌐' },
  { href: '/dashboard/settings', label: 'Inställningar', icon: '⚙️' },
]

export default function Sidebar({ profile, club, role, memberships }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const primaryColor = club?.primary_color || '#22c55e'

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#060d1a] border-r border-white/10 flex flex-col">
      {/* Club branding header */}
      <div className="p-4 border-b border-white/10">
        {club ? (
          <div>
            {/* Cover strip */}
            {club.cover_url && (
              <div className="h-12 rounded-xl overflow-hidden mb-3 -mx-0">
                <img src={club.cover_url} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            {/* Logo + name */}
            <div className="flex items-center gap-3">
              {club.logo_url ? (
                <img src={club.logo_url} alt={club.name} className="w-10 h-10 rounded-xl object-contain bg-white/5 p-0.5" />
              ) : (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
                  style={{ backgroundColor: primaryColor }}>
                  {club.name?.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-white text-sm font-bold truncate">{club.name}</p>
                <p className="text-xs truncate" style={{ color: primaryColor }}>{club.subdomain}.clubsports.se</p>
              </div>
            </div>
            {club.tagline && (
              <p className="text-white/30 text-xs mt-2 truncate">{club.tagline}</p>
            )}
            <div className="mt-2">
              <span className="text-xs text-white/30">{role?.name_sv || 'Medlem'}</span>
            </div>
          </div>
        ) : (
          <Link href="/" className="text-lg font-bold">
            <span className="text-white">Club</span>
            <span style={{ color: primaryColor }}>Sports</span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                active
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
              style={active ? { borderLeft: `3px solid ${primaryColor}`, paddingLeft: '9px' } : {}}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}

        {profile?.is_superadmin && (
          <Link href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mt-4"
            style={{ color: primaryColor + 'aa' }}>
            <span>🛡️</span>
            Admin Console
          </Link>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-black flex-shrink-0"
            style={{ backgroundColor: primaryColor }}>
            {profile?.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{profile?.full_name}</p>
            <p className="text-white/30 text-xs truncate">{profile?.email}</p>
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
