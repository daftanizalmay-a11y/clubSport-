import SectionHeading from '../ui/SectionHeading'
import { IconHandshake } from '../icons'

interface SponsorsSectionProps {
  title: string
  sponsors: Record<string, unknown>[]
}

export default function SponsorsSection({ title, sponsors }: SponsorsSectionProps) {
  if (sponsors.length === 0) return null

  return (
    <section>
      <SectionHeading title={title} icon={<IconHandshake />} />
      <div className="flex flex-wrap gap-4 justify-center">
        {sponsors.map(s => (
          <a
            key={s.id as string}
            href={(s.website_url as string) || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="border px-6 py-4 text-center min-w-32 transition-colors duration-200 hover:shadow-md cursor-pointer"
            style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}
          >
            {!!s.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.logo_url as string} alt={s.name as string} className="h-8 object-contain mx-auto mb-2" />
            )}
            <p className="text-sm font-medium" style={{ color: 'var(--site-card-fg)' }}>{s.name as string}</p>
          </a>
        ))}
      </div>
    </section>
  )
}
