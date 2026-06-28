import SectionHeading from '../ui/SectionHeading'
import { IconNews } from '../icons'

interface NewsSectionProps {
  title: string
  posts: Record<string, unknown>[]
}

export default function NewsSection({ title, posts }: NewsSectionProps) {
  if (posts.length === 0) return null

  return (
    <section>
      <SectionHeading title={title} icon={<IconNews />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {posts.map(post => (
          <article
            key={post.id as string}
            className="border p-5 transition-shadow duration-200 hover:shadow-md"
            style={{ backgroundColor: 'var(--site-card)', borderColor: 'var(--site-border)', borderRadius: 'var(--site-radius)' }}
          >
            {!!post.is_pinned && (
              <span
                className="text-xs px-2 py-0.5 rounded-full mb-2 inline-block font-medium"
                style={{ backgroundColor: 'var(--site-muted)', color: 'var(--site-muted-fg)' }}
              >
                Fäst
              </span>
            )}
            <h3 className="font-semibold mb-2" style={{ color: 'var(--site-card-fg)' }}>{post.title as string}</h3>
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--site-muted-fg)' }}>{post.content as string}</p>
            <p className="text-xs mt-3" style={{ color: 'var(--site-muted-fg)', opacity: 0.7 }}>
              {(post.profiles as Record<string, unknown>)?.full_name as string} · {new Date(post.published_at as string).toLocaleDateString('sv-SE')}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
