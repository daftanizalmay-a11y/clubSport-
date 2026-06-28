import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { seedDropdownOptionsForClub } from '@/lib/dropdown-options/seed'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { club_name, subdomain, sport, contact_email, city, primary_color, tagline, user_id } = body

    if (!club_name || !subdomain || !sport || !user_id) {
      return NextResponse.json({ error: 'Saknade fält' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Check subdomain is not taken
    const { data: existing } = await supabase
      .from('clubs')
      .select('id')
      .eq('subdomain', subdomain)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Subdomänen är redan tagen. Välj en annan.' }, { status: 409 })
    }

    // Create the club
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .insert({
        name: club_name,
        subdomain,
        sport,
        contact_email: contact_email || '',
        city: city || null,
        primary_color: primary_color || '#22c55e',
        tagline: tagline || null,
        status: 'active',
        plan_slug: 'starter',
      })
      .select()
      .single()

    if (clubError) {
      return NextResponse.json({ error: clubError.message }, { status: 500 })
    }

    // Get club_admin role id
    const { data: role } = await supabase
      .from('club_roles')
      .select('id')
      .eq('slug', 'club_admin')
      .single()

    if (!role) {
      return NextResponse.json({ error: 'Rollen club_admin hittades inte' }, { status: 500 })
    }

    // Add user as club_admin
    const { error: memberError } = await supabase
      .from('club_memberships')
      .insert({
        club_id: club.id,
        profile_id: user_id,
        role_id: role.id,
        status: 'active',
      })

    if (memberError) {
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    try {
      await seedDropdownOptionsForClub(supabase, club.id)
    } catch {
      // Non-fatal — defaults can be seeded on first dropdown access
    }

    return NextResponse.json({ club_id: club.id, subdomain: club.subdomain })
  } catch (err) {
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
