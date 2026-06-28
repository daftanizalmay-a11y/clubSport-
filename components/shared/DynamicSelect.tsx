'use client'

import { FINANCE_OPTION_CLASS, FINANCE_SELECT_CLASS } from '@/components/dashboard/finances/select-styles'
import { useDropdownOptions } from '@/hooks/useDropdownOptions'
import type { DropdownType } from '@/lib/dropdown-options/types'

interface Props {
  clubId: string
  type: DropdownType | string
  value: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  allowEmpty?: boolean
  emptyLabel?: string
  disabled?: boolean
}

export default function DynamicSelect({
  clubId,
  type,
  value,
  onChange,
  className = '',
  placeholder = 'Välj...',
  allowEmpty = false,
  emptyLabel = 'Välj...',
  disabled = false,
}: Props) {
  const { options, loading } = useDropdownOptions(clubId, type)

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled || loading}
      className={className || FINANCE_SELECT_CLASS}
    >
      {allowEmpty && (
        <option value="" className={FINANCE_OPTION_CLASS}>{emptyLabel}</option>
      )}
      {loading && !allowEmpty && (
        <option value="" className={FINANCE_OPTION_CLASS}>Laddar...</option>
      )}
      {options.map(opt => (
        <option key={opt.id} value={opt.value} className={FINANCE_OPTION_CLASS}>
          {opt.label}
        </option>
      ))}
      {!loading && options.length === 0 && !allowEmpty && (
        <option value="" className={FINANCE_OPTION_CLASS}>{placeholder}</option>
      )}
    </select>
  )
}
