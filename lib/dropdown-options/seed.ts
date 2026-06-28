import type { SupabaseClient } from '@supabase/supabase-js'
import { DEFAULT_DROPDOWN_OPTIONS } from './constants'

export async function seedDropdownOptionsForClub(admin: SupabaseClient, clubId: string) {
  const rows = DEFAULT_DROPDOWN_OPTIONS.map(opt => ({
    club_id: clubId,
    dropdown_type: opt.dropdown_type,
    label: opt.label,
    value: opt.value,
    sort_order: opt.sort_order,
    is_active: true,
  }))

  const { error } = await admin
    .from('dropdown_options')
    .upsert(rows, { onConflict: 'club_id,dropdown_type,value', ignoreDuplicates: true })

  if (error) throw new Error(error.message)
}

export async function ensureDropdownOptions(admin: SupabaseClient, clubId: string) {
  const { count, error } = await admin
    .from('dropdown_options')
    .select('id', { count: 'exact', head: true })
    .eq('club_id', clubId)

  if (error) throw new Error(error.message)
  if (!count || count === 0) {
    await seedDropdownOptionsForClub(admin, clubId)
  }
}
