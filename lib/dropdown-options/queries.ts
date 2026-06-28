import type { SupabaseClient } from '@supabase/supabase-js'
import type { DropdownOptionPublic } from './types'

export function toPublicOption(row: {
  id: string
  label: string
  value: string
  sort_order: number
  description?: string | null
}): DropdownOptionPublic {
  return {
    id: row.id,
    label: row.label,
    value: row.value,
    sort_order: row.sort_order,
    description: row.description ?? null,
  }
}

export async function fetchOptionsByType(
  admin: SupabaseClient,
  clubId: string,
  dropdownType: string,
  includeInactive = false
): Promise<DropdownOptionPublic[]> {
  let query = admin
    .from('dropdown_options')
    .select('id, label, value, sort_order, description')
    .eq('club_id', clubId)
    .eq('dropdown_type', dropdownType)
    .order('sort_order', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data || []).map(toPublicOption)
}

export async function fetchAllOptionsGrouped(
  admin: SupabaseClient,
  clubId: string,
  includeInactive = false
): Promise<Record<string, DropdownOptionPublic[]>> {
  let query = admin
    .from('dropdown_options')
    .select('id, dropdown_type, label, value, sort_order, description')
    .eq('club_id', clubId)
    .order('sort_order', { ascending: true })

  if (!includeInactive) {
    query = query.eq('is_active', true)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const grouped: Record<string, DropdownOptionPublic[]> = {}
  for (const row of data || []) {
    const type = row.dropdown_type as string
    if (!grouped[type]) grouped[type] = []
    grouped[type].push(toPublicOption(row))
  }
  return grouped
}
