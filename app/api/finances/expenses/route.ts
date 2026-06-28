import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    const body = await req.json()
    const { club_id, title, description, amount_sek, category, receipt_url, receipt_name } = body
    if (!club_id || !title || !amount_sek) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { data, error } = await admin.from('expenses').insert({ club_id, title, description, amount_sek, category, receipt_url, receipt_name, submitted_by: user.id }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}

export async function PATCH(req: NextRequest) {
  try {
    const { expense_id, status } = await req.json()
    if (!expense_id || !status) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('expenses').update({ status, reviewed_at: new Date().toISOString() }).eq('id', expense_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
