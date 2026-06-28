import SectionHeading from '../ui/SectionHeading'
import { IconPhoto } from '../icons'

interface GallerySectionProps {
  title: string
  gallery: Record<string, unknown>[]
}

export default function GallerySection({ title, gallery }: GallerySectionProps) {
  if (gallery.length === 0) return null

  return (
    <section>
      <SectionHeading title={title} icon={<IconPhoto />} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {gallery.map(photo => (
          <div
            key={photo.id as string}
            className="aspect-square overflow-hidden"
            style={{ backgroundColor: 'var(--site-muted)', borderRadius: 'var(--site-radius)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.image_url as string}
              alt={(photo.caption as string) || ''}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
