import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { club_id, type, title, content, is_builtin, sort_order } = body
    if (!club_id || !title) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('club_website_sections').insert({ club_id, type, title, content: content || null, is_builtin, sort_order }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { section_id, ...fields } = await req.json()
    if (!section_id) return NextResponse.json({ error: 'Saknat section_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('club_website_sections').update(fields).eq('id', section_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { section_id } = await req.json()
    const admin = createAdminClient()
    const { error } = await admin.from('club_website_sections').delete().eq('id', section_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
