import SectionHeading from '../ui/SectionHeading'
import { IconMail } from '../icons'

interface ContactSectionProps {
  title: string
  club: Record<string, unknown>
}

export default function ContactSection({ title, club }: ContactSectionProps) {
  return (
    <section>
      <SectionHeading title={title} icon={<IconMail />} />
      <div className="border p-6 max-w-md" style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}>
        <div className="space-y-3">
          {!!club.contact_email && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--site-muted-fg)' }}>E-post</p>
              <a href={`mailto:${club.contact_email}`} className="text-sm hover:underline" style={{ color: 'var(--site-primary)' }}>{String(club.contact_email)}</a>
            </div>
          )}
          {!!club.contact_phone && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--site-muted-fg)' }}>Telefon</p>
              <p className="text-sm" style={{ color: 'var(--site-card-fg)' }}>{String(club.contact_phone)}</p>
            </div>
          )}
          {!!club.address && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--site-muted-fg)' }}>Adress</p>
              <p className="text-sm" style={{ color: 'var(--site-card-fg)' }}>{String(club.address)}, {String(club.city)}</p>
            </div>
          )}
          {!!club.website_url && (
            <div>
              <p className="text-xs mb-0.5" style={{ color: 'var(--site-muted-fg)' }}>Webbplats</p>
              <a href={String(club.website_url)} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: 'var(--site-primary)' }}>{String(club.website_url)}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
