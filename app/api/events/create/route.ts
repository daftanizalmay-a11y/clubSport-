import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    const { club_id, title, type, date, time, location, description } = await req.json()
    if (!club_id || !title || !date) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('events').insert({ club_id, title, type, date, time: time || null, location: location || null, description: description || null, created_by: user.id }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
