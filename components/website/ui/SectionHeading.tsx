interface SectionHeadingProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
}

export default function SectionHeading({ title, subtitle, icon }: SectionHeadingProps) {
  return (
    <div className="mb-6 md:mb-8">
      <div className="flex items-center gap-3">
        {icon && (
          <span style={{ color: 'var(--site-primary)' }}>{icon}</span>
        )}
        <h2
          className="text-2xl md:text-3xl font-bold"
          style={{ fontFamily: 'var(--site-font-heading)', color: 'var(--site-fg)' }}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p className="mt-1 text-sm md:text-base" style={{ color: 'var(--site-muted-fg)' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
