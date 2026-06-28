'use client'

import { useEffect, useState } from 'react'
import type { DropdownOptionPublic, DropdownType } from '@/lib/dropdown-options/types'

export function useDropdownOptions(clubId: string, type: DropdownType | string) {
  const [options, setOptions] = useState<DropdownOptionPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!clubId || !type) {
      setOptions([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`/api/clubs/${clubId}/dropdown-options?type=${encodeURIComponent(type)}`, {
      credentials: 'include',
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Kunde inte ladda alternativ')
        if (!cancelled) setOptions(Array.isArray(data) ? data : [])
      })
      .catch(e => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Fel')
          setOptions([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [clubId, type])

  return { options, loading, error }
}
