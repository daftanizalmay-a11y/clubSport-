import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Ej autentiserad' }, { status: 401 })
    const formData = await req.formData()
    const file = formData.get('file') as File
    const profile_id = formData.get('profile_id') as string
    if (!file || !profile_id) return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    const admin = createAdminClient()
    const ext = file.name.split('.').pop()
    const fileName = `avatars/${profile_id}.${ext}`
    const buffer = await file.arrayBuffer()
    const { error } = await admin.storage.from('club-assets').upload(fileName, buffer, { contentType: file.type, upsert: true })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const { data: { publicUrl } } = admin.storage.from('club-assets').getPublicUrl(fileName)
    await admin.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile_id)
    return NextResponse.json({ url: publicUrl })
  } catch { return NextResponse.json({ error: 'Serverfel' }, { status: 500 }) }
}
