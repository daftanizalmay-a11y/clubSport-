interface FooterProps {
  clubName: string
}

export default function Footer({ clubName }: FooterProps) {
  return (
    <footer className="border-t pt-8 pb-12 text-center" style={{ borderColor: 'var(--site-border)' }}>
      <p className="text-xs" style={{ color: 'var(--site-muted-fg)' }}>
        {clubName} · Driven av{' '}
        <a href="/" className="underline transition-opacity hover:opacity-80" style={{ color: 'var(--site-primary)' }}>
          ClubSports
        </a>
      </p>
    </footer>
  )
}
