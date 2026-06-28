'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/supabase/hooks'

const nav = [
  { href: '/member/dashboard', label: 'Översikt', icon: '🏠' },
  { href: '/member/profile', label: 'Min profil', icon: '👤' },
  { href: '/member/clubs', label: 'Mina klubbar', icon: '🏟️' },
  { href: '/member/teams', label: 'Mina lag', icon: '🏆' },
  { href: '/member/payments', label: 'Avgifter', icon: '💳' },
  { href: '/member/reminders', label: 'Påminnelser', icon: '📧' },
]

export default function MemberShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <header className="border-b border-white/10 bg-[#0a0f1e]/95 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link href="/member/dashboard" className="text-xl font-bold flex-shrink-0">
            <span className="text-white">Club</span>
            <span className="text-[#22c55e]">Sports</span>
            <span className="text-white/40 text-sm font-normal ml-2">Mina sidor</span>
          </Link>
          <button type="button" onClick={logout}
            className="text-sm px-3 py-1.5 border border-white/20 rounded-lg text-white/60 hover:text-white hover:border-white/40 cursor-pointer">
            Logga ut
          </button>
        </div>
        <nav className="max-w-6xl mx-auto px-4 pb-3 flex gap-1 overflow-x-auto">
          {nav.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                pathname === item.href ? 'bg-white/10 text-white font-medium' : 'text-white/40 hover:text-white'
              }`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
