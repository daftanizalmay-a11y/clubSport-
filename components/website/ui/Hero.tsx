'use client'

import { useTemplate } from '../TemplateRoot'
import { IconCalendar, IconMapPin } from '../icons'

interface HeroProps {
  club: Record<string, unknown>
  heroTitle: string
  heroSubtitle: string
  ctaText: string
  onJoinClick: () => void
}

export default function Hero({ club, heroTitle, heroSubtitle, ctaText, onJoinClick }: HeroProps) {
  const { template } = useTemplate()
  const variant = template.heroVariant

  if (variant === 'minimal') {
    return (
      <section className="relative pt-20 pb-16 px-4 md:px-6">
        <div className="mx-auto text-center" style={{ maxWidth: 'var(--site-container)' }}>
          {!!club.cover_url && (
            <div className="mb-10 aspect-[21/9] max-h-64 overflow-hidden rounded-lg mx-auto" style={{ borderRadius: 'var(--site-radius)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={club.cover_url as string} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <h1
            className="text-4xl md:text-6xl font-bold tracking-tight mb-4"
            style={{ fontFamily: 'var(--site-font-heading)', color: 'var(--site-fg)' }}
          >
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto" style={{ color: 'var(--site-muted-fg)' }}>
              {heroSubtitle}
            </p>
          )}
          <HeroMeta club={club} centered />
          <button
            type="button"
            onClick={onJoinClick}
            className="mt-10 px-10 py-4 text-base font-semibold transition-opacity duration-200 hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
          >
            {ctaText}
          </button>
        </div>
      </section>
    )
  }

  if (variant === 'split') {
    return (
      <section className="relative pt-16 min-h-[28rem] md:min-h-[32rem] grid md:grid-cols-2">
        <div className="flex items-center px-6 md:px-12 py-12 order-2 md:order-1">
          <div className="max-w-lg">
            <ClubBadge club={club} size="lg" />
            <h1 className="text-3xl md:text-5xl font-bold mt-6 mb-3" style={{ fontFamily: 'var(--site-font-heading)' }}>
              {heroTitle}
            </h1>
            {heroSubtitle && <p className="text-lg mb-4" style={{ color: 'var(--site-muted-fg)' }}>{heroSubtitle}</p>}
            <HeroMeta club={club} />
            <button
              type="button"
              onClick={onJoinClick}
              className="mt-8 px-8 py-3.5 text-sm font-bold transition-opacity duration-200 hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
            >
              {ctaText}
            </button>
          </div>
        </div>
        <div className="relative h-64 md:h-auto order-1 md:order-2 overflow-hidden">
          {club.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={club.cover_url as string} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ backgroundColor: 'var(--site-muted)' }} />
          )}
          <div className="absolute inset-0" style={{ background: 'var(--site-hero-overlay)' }} />
        </div>
      </section>
    )
  }

  const heightClass = variant === 'fullscreen' ? 'h-[85vh] min-h-[32rem]' : variant === 'diagonal' ? 'h-80 md:h-[28rem]' : 'h-72 md:h-96'

  return (
    <section className="relative pt-16">
      <div className={`relative w-full overflow-hidden ${heightClass}`}>
        {club.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.cover_url as string} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ backgroundColor: 'var(--site-muted)' }} />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: variant === 'diagonal'
              ? 'var(--site-hero-overlay)'
              : 'var(--site-hero-overlay)',
          }}
        />
        <div className={`absolute inset-0 flex items-end pb-10 md:pb-14 px-4 md:px-6 ${variant === 'fullscreen' ? 'items-center pb-0' : ''}`}>
          <div className="mx-auto w-full" style={{ maxWidth: 'var(--site-container)' }}>
            <div className={`flex gap-5 ${variant === 'fullscreen' ? 'flex-col items-start md:max-w-2xl' : 'items-end'}`}>
              <ClubBadge club={club} size={variant === 'fullscreen' ? 'xl' : 'md'} />
              <div>
                <h1
                  className={`font-extrabold ${variant === 'fullscreen' ? 'text-4xl md:text-7xl' : 'text-3xl md:text-5xl'}`}
                  style={{ fontFamily: 'var(--site-font-heading)', color: themeSafeText() }}
                >
                  {heroTitle}
                </h1>
                {heroSubtitle && (
                  <p className={`mt-2 ${variant === 'fullscreen' ? 'text-xl md:text-2xl' : 'text-lg'}`} style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {heroSubtitle}
                  </p>
                )}
                <HeroMeta club={club} light />
                {variant === 'fullscreen' && (
                  <button
                    type="button"
                    onClick={onJoinClick}
                    className="mt-8 px-8 py-4 text-base font-bold transition-opacity duration-200 hover:opacity-90 cursor-pointer"
                    style={{ backgroundColor: 'var(--site-accent)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
                  >
                    {ctaText}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function themeSafeText() {
  return '#FFFFFF'
}

function ClubBadge({ club, size }: { club: Record<string, unknown>; size: 'md' | 'lg' | 'xl' }) {
  const sizes = { md: 'w-20 h-20 text-2xl', lg: 'w-24 h-24 text-3xl', xl: 'w-28 h-28 text-4xl' }
  return (
    <div
      className={`${sizes[size]} rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center font-bold`}
      style={{ backgroundColor: 'var(--site-primary)', color: 'var(--site-on-primary)', borderRadius: 'var(--site-radius)' }}
    >
      {club.logo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={club.logo_url as string} alt={club.name as string} className="w-full h-full object-contain p-1" />
      ) : (
        (club.name as string)?.charAt(0)
      )}
    </div>
  )
}

function HeroMeta({ club, centered, light }: { club: Record<string, unknown>; centered?: boolean; light?: boolean }) {
  const color = light ? 'rgba(255,255,255,0.65)' : 'var(--site-muted-fg)'
  return (
    <div className={`flex items-center gap-4 mt-3 flex-wrap text-sm ${centered ? 'justify-center' : ''}`} style={{ color }}>
      {!!club.city && (
        <span className="flex items-center gap-1">
          <IconMapPin className="w-3.5 h-3.5" />
          {String(club.city)}
        </span>
      )}
      {!!club.founded_year && (
        <span className="flex items-center gap-1">
          <IconCalendar className="w-3.5 h-3.5" />
          Est. {Number(club.founded_year)}
        </span>
      )}
      {!!club.sport && (
        <span className="capitalize">{String(club.sport).replace('_', ' ')}</span>
      )}
    </div>
  )
}
