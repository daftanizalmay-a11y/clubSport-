import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  try {
    const { club_id, ...fields } = await req.json()
    if (!club_id) return NextResponse.json({ error: 'Saknat club_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('clubs').update(fields).eq('id', club_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
