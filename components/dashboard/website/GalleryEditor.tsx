'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GalleryEditor({ club, gallery }: { club: any; gallery: any[] }) {
  const router = useRouter()
  const primaryColor = club?.primary_color || '#22c55e'
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')

  async function uploadPhoto(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('club_id', club.id)
    formData.append('caption', caption)
    const res = await fetch('/api/website/gallery', { method: 'POST', body: formData })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'Uppladdning misslyckades')
    }
    setCaption('')
    setUploading(false)
    router.refresh()
  }

  async function deletePhoto(id: string) {
    if (!confirm('Ta bort denna bild?')) return
    await fetch('/api/website/gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ photo_id: id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Bildgalleri</h2>
          <p className="text-white/40 text-sm mt-0.5">Ladda upp bilder som visas på er klubbhemsida.</p>
        </div>
      </div>

      {/* Upload area */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-white font-medium mb-4">Ladda upp ny bild</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Bildtext (valfritt)</label>
            <input value={caption} onChange={e => setCaption(e.target.value)}
              placeholder="Beskriv bilden..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30" />
          </div>
          <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/30 transition-colors">
            <input
              type="file"
              accept="image/*"
              id="gallery-upload"
              className="hidden"
              disabled={uploading}
              onChange={e => e.target.files?.[0] && uploadPhoto(e.target.files[0])}
            />
            <label htmlFor="gallery-upload" className="cursor-pointer">
              {uploading ? (
                <div>
                  <p className="text-white/60 text-sm">Laddar upp...</p>
                  <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mt-3" />
                </div>
              ) : (
                <div>
                  <p className="text-4xl mb-3">🖼️</p>
                  <p className="text-white/60 text-sm font-medium">Klicka för att välja bild</p>
                  <p className="text-white/20 text-xs mt-1">JPG, PNG, WebP — max 10MB</p>
                  <div className="mt-4 inline-block px-5 py-2 rounded-xl text-sm font-semibold text-black"
                    style={{ backgroundColor: primaryColor }}>
                    Välj bild
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      {gallery.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <p className="text-white/30 text-sm">Inga bilder uppladdade ännu.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {gallery.map(photo => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-white/5">
              <img src={photo.image_url} alt={photo.caption || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={() => deletePhoto(photo.id)}
                  className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors">
                  Ta bort
                </button>
              </div>
              {photo.caption && (
                <p className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 truncate">{photo.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
