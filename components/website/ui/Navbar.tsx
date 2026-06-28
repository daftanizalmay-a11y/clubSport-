'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTemplate } from '../TemplateRoot'
import { IconMenu, IconMoon, IconSun } from '../icons'

interface NavbarProps {
  club: Record<string, unknown>
  sections: Record<string, unknown>[]
  ctaText: string
  onJoinClick: () => void
}

export default function Navbar({ club, sections, ctaText, onJoinClick }: NavbarProps) {
  const { template, themeMode, toggleTheme, isDemo } = useTemplate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const visibleSections = sections.filter(s => s.is_visible)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md px-4 md:px-6 py-3 flex items-center justify-between"
      style={{ backgroundColor: 'var(--site-navbar)', borderColor: 'var(--site-border)' }}
    >
      <div className="flex items-center gap-3 min-w-0">
        {club.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.logo_url as string} alt={club.name as string} className="w-8 h-8 rounded-lg object-contain flex-shrink-0" />
        ) : (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}
          >
            {(club.name as string)?.charAt(0)}
          </div>
        )}
        <span className="font-semibold text-sm truncate" style={{ fontFamily: 'var(--site-font-heading)' }}>
          {club.name as string}
        </span>
        {isDemo && (
          <span
            className="hidden sm:inline text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-medium"
            style={{ backgroundColor: 'var(--site-muted)', color: 'var(--site-muted-fg)' }}
          >
            Mall: {template.nameSv}
          </span>
        )}
      </div>

      <div className="hidden md:flex items-center gap-4">
        {visibleSections.map(s => (
          <a
            key={s.id as string}
            href={`#section-${s.id}`}
            className="text-xs transition-colors duration-200 hover:opacity-100 opacity-60 cursor-pointer"
            style={{ color: 'var(--site-fg)' }}
          >
            {s.title as string}
          </a>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-lg transition-colors duration-200 cursor-pointer opacity-70 hover:opacity-100"
          style={{ color: 'var(--site-fg)' }}
          aria-label={themeMode === 'dark' ? 'Byt till ljust läge' : 'Byt till mörkt läge'}
        >
          {themeMode === 'dark' ? <IconSun className="w-4 h-4" /> : <IconMoon className="w-4 h-4" />}
        </button>
        <Link
          href="/auth/login"
          className="hidden sm:block text-sm transition-colors duration-200 opacity-60 hover:opacity-100"
          style={{ color: 'var(--site-fg)' }}
        >
          Logga in
        </Link>
        <button
          type="button"
          onClick={onJoinClick}
          className="hidden sm:block px-4 py-1.5 rounded-lg text-sm font-semibold transition-opacity duration-200 hover:opacity-90 cursor-pointer"
          style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
        >
          {ctaText}
        </button>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg cursor-pointer"
          style={{ color: 'var(--site-fg)' }}
          aria-label="Meny"
        >
          <IconMenu />
        </button>
      </div>

      {mobileOpen && (
        <div
          className="absolute top-full left-0 right-0 border-b p-4 md:hidden flex flex-col gap-3"
          style={{ backgroundColor: 'var(--site-navbar)', borderColor: 'var(--site-border)' }}
        >
          {visibleSections.map(s => (
            <a
              key={s.id as string}
              href={`#section-${s.id}`}
              onClick={() => setMobileOpen(false)}
              className="text-sm py-1 cursor-pointer"
              style={{ color: 'var(--site-fg)' }}
            >
              {s.title as string}
            </a>
          ))}
          <button
            type="button"
            onClick={() => { onJoinClick(); setMobileOpen(false) }}
            className="w-full py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
            style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)' }}
          >
            {ctaText}
          </button>
        </div>
      )}
    </nav>
  )
}
