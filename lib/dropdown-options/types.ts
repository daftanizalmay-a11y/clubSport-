export type DropdownType =
  | 'gender'
  | 'age_group'
  | 'season'
  | 'sport'
  | 'age_category'
  | 'competition'

export interface DropdownOption {
  id: string
  club_id: string
  dropdown_type: DropdownType | string
  label: string
  value: string
  description?: string | null
  is_active: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface DropdownOptionPublic {
  id: string
  label: string
  value: string
  sort_order: number
  description?: string | null
}
