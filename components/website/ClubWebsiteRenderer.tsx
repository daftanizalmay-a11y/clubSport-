'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ClubWebsiteData, ThemeMode } from '@/lib/website/templates/types'
import TemplateRoot from './TemplateRoot'
import Navbar from './ui/Navbar'
import Hero from './ui/Hero'
import Footer from './ui/Footer'
import JoinFormModal from './ui/JoinFormModal'
import NewsSection from './sections/NewsSection'
import FixturesSection from './sections/FixturesSection'
import LeagueTableSection from './sections/LeagueTableSection'
import PlayersSection from './sections/PlayersSection'
import BoardSection from './sections/BoardSection'
import GallerySection from './sections/GallerySection'
import SponsorsSection from './sections/SponsorsSection'
import ContactSection from './sections/ContactSection'

interface ClubWebsiteRendererProps extends ClubWebsiteData {
  isDemo?: boolean
}

export default function ClubWebsiteRenderer({
  club,
  roles,
  boardMembers,
  config,
  posts,
  gallery,
  sponsors,
  sections,
  leagueTables,
  fixtures,
  members,
  isDemo = false,
}: ClubWebsiteRendererProps) {
  const [showJoinForm, setShowJoinForm] = useState(false)

  const templateId = (config?.website_template as string) || 'multi-sport'
  const themeMode = ((config?.theme_mode as ThemeMode) || 'dark')

  const heroTitle = (config?.hero_title as string) || (club.name as string)
  const heroSubtitle = (config?.hero_subtitle as string) || (club.tagline as string) || ''
  const ctaText = (config?.primary_cta_text as string) || 'Ansök om medlemskap'
  const welcomeMessage = (config?.welcome_message as string) || ''

  const visibleSections = sections.filter(s => s.is_visible)

  function renderSection(section: Record<string, unknown>) {
    const title = section.title as string
    switch (section.type) {
      case 'news':
        return <NewsSection key={section.id as string} title={title} posts={posts} />
      case 'fixtures':
        return <FixturesSection key={section.id as string} title={title} fixtures={fixtures} />
      case 'league_table':
        return <LeagueTableSection key={section.id as string} title={title} leagueTables={leagueTables} />
      case 'players':
        return <PlayersSection key={section.id as string} title={title} members={members} />
      case 'board':
        return <BoardSection key={section.id as string} title={title} boardMembers={boardMembers} />
      case 'gallery':
        return <GallerySection key={section.id as string} title={title} gallery={gallery} />
      case 'sponsors':
        return <SponsorsSection key={section.id as string} title={title} sponsors={sponsors} />
      case 'contact':
        return <ContactSection key={section.id as string} title={title} club={club} />
      case 'text':
      case 'image_text':
      case 'custom':
        return (
          <section key={section.id as string}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: 'var(--site-font-heading)', color: 'var(--site-fg)' }}>
              {title}
            </h2>
            {(section.image_url as string | undefined) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={section.image_url as string} alt="" className="w-full rounded-2xl mb-6 max-h-64 object-cover" style={{ borderRadius: 'var(--site-radius)' }} />
            )}
            <div className="border p-6" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
              <p className="leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--site-muted-fg)' }}>{section.content as string}</p>
            </div>
          </section>
        )
      default:
        return null
    }
  }

  return (
    <TemplateRoot templateId={templateId} initialTheme={themeMode} isDemo={isDemo}>
      <Navbar
        club={club}
        sections={sections}
        ctaText={ctaText}
        onJoinClick={() => setShowJoinForm(true)}
      />

      <Hero
        club={club}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        ctaText={ctaText}
        onJoinClick={() => setShowJoinForm(true)}
      />

      <main className="mx-auto px-4 md:px-6 py-12 md:py-16" style={{ maxWidth: 'var(--site-container)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--site-section-gap)' }}>
          {welcomeMessage && (
            <section
              className="border p-6 md:p-8 text-center"
              style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}
            >
              <p className="text-base md:text-lg leading-relaxed" style={{ color: 'var(--site-card-fg)' }}>{welcomeMessage}</p>
            </section>
          )}

          <section className="text-center">
            <button
              type="button"
              onClick={() => setShowJoinForm(true)}
              className="px-8 py-4 text-base md:text-lg font-bold transition-opacity duration-200 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
            >
              {ctaText}
            </button>
            <p className="text-sm mt-3" style={{ color: 'var(--site-muted-fg)' }}>
              Redan medlem?{' '}
              <Link href="/auth/login" className="underline" style={{ color: 'var(--site-primary)' }}>Logga in</Link>
            </p>
          </section>

          {visibleSections.map(section => (
            <div key={section.id as string} id={`section-${section.id}`}>
              {renderSection(section)}
            </div>
          ))}

          <Footer clubName={club.name as string} />
        </div>
      </main>

      <JoinFormModal
        club={club}
        roles={roles}
        ctaText={ctaText}
        open={showJoinForm}
        onClose={() => setShowJoinForm(false)}
      />
    </TemplateRoot>
  )
}
