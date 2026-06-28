import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  try {
    const { invitation_id } = await req.json()
    if (!invitation_id) return NextResponse.json({ error: 'Saknat invitation_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('invitations').update({ status: 'cancelled' }).eq('id', invitation_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
