import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    const { profile_id, full_name, phone, bio, nationality } = await req.json()
    if (user.id !== profile_id) return NextResponse.json({ error: 'Ej behörig' }, { status: 403 })
    const admin = createAdminClient()
    const { error } = await admin.from('profiles').update({ full_name, phone: phone || null, bio: bio || null, nationality: nationality || null }).eq('id', profile_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
