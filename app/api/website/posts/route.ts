import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { club_id, author_id, title, content, is_pinned, is_published } = await req.json()
    if (!club_id || !title || !content) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })

    const admin = createAdminClient()
    const { data, error } = await admin.from('club_posts').insert({
      club_id,
      author_id: author_id || user.id,
      title,
      content,
      is_pinned: is_pinned || false,
      is_published: is_published !== false,
      published_at: is_published !== false ? new Date().toISOString() : null,
    }).select().single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { id, ...fields } = await req.json()
    if (!id) return NextResponse.json({ error: 'Saknat id' }, { status: 400 })

    if (fields.is_published !== undefined) {
      fields.published_at = fields.is_published ? new Date().toISOString() : null
    }

    const admin = createAdminClient()
    const { error } = await admin.from('club_posts').update(fields).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })

    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'Saknat id' }, { status: 400 })

    const admin = createAdminClient()
    const { error } = await admin.from('club_posts').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
