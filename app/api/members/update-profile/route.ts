import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  try {
    const { profile_id, full_name, phone, bio, jersey_number, nationality, date_of_birth, address, emergency_contact } = await req.json()
    if (!profile_id) return NextResponse.json({ error: 'Saknat profile_id' }, { status: 400 })
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({
      full_name,
      phone: phone || null,
      bio: bio || null,
      jersey_number: jersey_number ? parseInt(jersey_number) : null,
      nationality: nationality || null,
      date_of_birth: date_of_birth || null,
      address: address || null,
      emergency_contact: emergency_contact || null,
    }).eq('id', profile_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
