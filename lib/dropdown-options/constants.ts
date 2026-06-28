import type { DropdownType } from './types'

export const DROPDOWN_TYPE_LABELS: Record<DropdownType, string> = {
  gender: 'Kön',
  age_group: 'Åldersgrupp',
  season: 'Säsong',
  sport: 'Sport',
  age_category: 'Ålderskategori',
  competition: 'Tävling/Liga',
}

export const DROPDOWN_TYPES = Object.keys(DROPDOWN_TYPE_LABELS) as DropdownType[]

export const DEFAULT_DROPDOWN_OPTIONS: { dropdown_type: DropdownType; label: string; value: string; sort_order: number }[] = [
  { dropdown_type: 'gender', label: 'Män', value: 'male', sort_order: 0 },
  { dropdown_type: 'gender', label: 'Kvinnor', value: 'female', sort_order: 1 },
  { dropdown_type: 'gender', label: 'Andra', value: 'other', sort_order: 2 },
  { dropdown_type: 'gender', label: 'Blandat', value: 'mixed', sort_order: 3 },
  { dropdown_type: 'gender', label: 'Herr', value: 'men', sort_order: 4 },
  { dropdown_type: 'gender', label: 'Dam', value: 'women', sort_order: 5 },
  { dropdown_type: 'age_group', label: 'Senior', value: 'senior', sort_order: 0 },
  { dropdown_type: 'age_group', label: 'Junior', value: 'junior', sort_order: 1 },
  { dropdown_type: 'age_group', label: 'Youth', value: 'youth', sort_order: 2 },
  { dropdown_type: 'age_group', label: 'U17', value: 'u17', sort_order: 3 },
  { dropdown_type: 'age_group', label: 'U15', value: 'u15', sort_order: 4 },
  { dropdown_type: 'season', label: '2025', value: '2025', sort_order: 0 },
  { dropdown_type: 'season', label: '2026', value: '2026', sort_order: 1 },
  { dropdown_type: 'season', label: '2027', value: '2027', sort_order: 2 },
  { dropdown_type: 'sport', label: 'Cricket', value: 'cricket', sort_order: 0 },
  { dropdown_type: 'sport', label: 'Fotboll', value: 'football', sort_order: 1 },
  { dropdown_type: 'sport', label: 'Basket', value: 'basketball', sort_order: 2 },
  { dropdown_type: 'sport', label: 'Hockey', value: 'hockey', sort_order: 3 },
  { dropdown_type: 'sport', label: 'Badminton', value: 'badminton', sort_order: 4 },
  { dropdown_type: 'sport', label: 'Tennis', value: 'tennis', sort_order: 5 },
  { dropdown_type: 'sport', label: 'Volleyboll', value: 'volleyball', sort_order: 6 },
  { dropdown_type: 'sport', label: 'Annan', value: 'other', sort_order: 7 },
  { dropdown_type: 'competition', label: 'Allsvenskan', value: 'allsvenskan', sort_order: 0 },
  { dropdown_type: 'competition', label: 'Superettan', value: 'superettan', sort_order: 1 },
]

export function slugifyValue(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}
