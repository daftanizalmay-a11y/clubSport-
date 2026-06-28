import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const { club_id, name, description, amount_sek, frequency, is_mandatory } = await req.json()
    if (!club_id || !name || !amount_sek) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('fee_types').insert({ club_id, name, description, amount_sek, frequency, is_mandatory }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { fee_type_id, ...fields } = await req.json()
    if (!fee_type_id) return NextResponse.json({ error: 'Saknat fee_type_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('fee_types').update(fields).eq('id', fee_type_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function DELETE(req: NextRequest) {
  try {
    const { fee_type_id } = await req.json()
    if (!fee_type_id) return NextResponse.json({ error: 'Saknat fee_type_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('fee_types').delete().eq('id', fee_type_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
