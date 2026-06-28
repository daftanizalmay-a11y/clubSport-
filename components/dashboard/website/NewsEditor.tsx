'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewsEditor({ club, posts, userId }: { club: any; posts: any[]; userId: string }) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', is_pinned: false, is_published: true })
  const primaryColor = club?.primary_color || '#22c55e'

  async function createPost(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/website/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, club_id: club.id, author_id: userId }),
    })
    setLoading(false)
    setShowForm(false)
    setForm({ title: '', content: '', is_pinned: false, is_published: true })
    router.refresh()
  }

  async function togglePublish(post: any) {
    await fetch('/api/website/posts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: post.id, is_published: !post.is_published }),
    })
    router.refresh()
  }

  async function deletePost(id: string) {
    if (!confirm('Ta bort detta inlägg?')) return
    await fetch('/api/website/posts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-white">Nyheter ({posts.length})</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-black"
          style={{ backgroundColor: primaryColor }}>
          + Nytt inlägg
        </button>
      </div>

      {showForm && (
        <form onSubmit={createPost} className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Rubrik</label>
            <input required value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Innehåll</label>
            <textarea required value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
              rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/30 resize-none" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={form.is_pinned} onChange={e => setForm(p => ({ ...p, is_pinned: e.target.checked }))} />
              Fäst inlägg
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={form.is_published} onChange={e => setForm(p => ({ ...p, is_published: e.target.checked }))} />
              Publicera direkt
            </label>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="flex-1 border border-white/20 text-white py-2.5 rounded-xl text-sm">Avbryt</button>
            <button type="submit" disabled={loading}
              className="flex-1 font-bold py-2.5 rounded-xl text-sm text-black disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}>
              {loading ? 'Sparar...' : 'Skapa inlägg'}
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-white/30 text-sm">
          Inga nyheter ännu. Skapa ditt första inlägg ovan.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.is_pinned && <span className="text-xs">📌</span>}
                  <p className="text-white font-medium truncate">{post.title}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.is_published ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'bg-white/10 text-white/40'}`}>
                    {post.is_published ? 'Publicerad' : 'Utkast'}
                  </span>
                </div>
                <p className="text-white/40 text-sm line-clamp-2">{post.content}</p>
                <p className="text-white/20 text-xs mt-1">{post.profiles?.full_name} · {new Date(post.created_at).toLocaleDateString('sv-SE')}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => togglePublish(post)}
                  className="text-xs px-3 py-1.5 border border-white/20 text-white/50 hover:text-white rounded-lg transition-colors">
                  {post.is_published ? 'Avpublicera' : 'Publicera'}
                </button>
                <button onClick={() => deletePost(post.id)}
                  className="text-xs px-3 py-1.5 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                  Ta bort
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
