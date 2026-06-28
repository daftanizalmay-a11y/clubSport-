'use client'

import { useCallback, useEffect, useState } from 'react'
import { FINANCE_OPTION_CLASS, FINANCE_SELECT_CLASS } from '@/components/dashboard/finances/select-styles'
import { DROPDOWN_TYPE_LABELS, DROPDOWN_TYPES, slugifyValue } from '@/lib/dropdown-options/constants'
import type { DropdownOptionPublic, DropdownType } from '@/lib/dropdown-options/types'

interface Props {
  clubId: string
}

export default function DropdownManager({ clubId }: Props) {
  const [dropdownType, setDropdownType] = useState<DropdownType>('gender')
  const [options, setOptions] = useState<DropdownOptionPublic[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newLabel, setNewLabel] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState('')
  const [editDescription, setEditDescription] = useState('')

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/dropdown-options?type=${encodeURIComponent(dropdownType)}`, {
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Kunde inte ladda')
      setOptions(Array.isArray(data) ? data : [])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fel')
      setOptions([])
    } finally {
      setLoading(false)
    }
  }, [clubId, dropdownType])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  async function addOption() {
    if (!newLabel.trim()) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/dropdown-options`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          dropdown_type: dropdownType,
          label: newLabel.trim(),
          value: newValue.trim() || slugifyValue(newLabel),
          description: newDescription.trim() || null,
        }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Kunde inte lägga till')
      setOptions(prev => [...prev, result])
      setNewLabel('')
      setNewValue('')
      setNewDescription('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fel')
    } finally {
      setSaving(false)
    }
  }

  async function deleteOption(optionId: string) {
    if (!confirm('Ta bort detta alternativ?')) return
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/dropdown-options/${optionId}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Kunde inte ta bort')
      setOptions(prev => prev.filter(o => o.id !== optionId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fel')
    } finally {
      setSaving(false)
    }
  }

  function startEdit(option: DropdownOptionPublic) {
    setEditingId(option.id)
    setEditLabel(option.label)
    setEditDescription(option.description || '')
  }

  async function saveEdit(optionId: string) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/clubs/${clubId}/dropdown-options/${optionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ label: editLabel.trim(), description: editDescription.trim() || null }),
      })
      const result = await res.json()
      if (!result.success) throw new Error(result.error || 'Kunde inte spara')
      setOptions(prev => prev.map(o => o.id === optionId ? { ...o, label: result.label, description: result.description } : o))
      setEditingId(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fel')
    } finally {
      setSaving(false)
    }
  }

  async function reorderOptions(newOptions: DropdownOptionPublic[]) {
    setOptions(newOptions)
    await fetch(`/api/clubs/${clubId}/dropdown-options/reorder`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        updates: newOptions.map((o, i) => ({ optionId: o.id, sort_order: i })),
      }),
    })
  }

  function moveOption(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= options.length) return
    const next = [...options]
    const [item] = next.splice(index, 1)
    next.splice(target, 0, item)
    reorderOptions(next)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-1">Dropdown-värden</h2>
        <p className="text-white/40 text-sm mb-4">
          Hantera listor som används i formulär — kön, åldersgrupp, säsong, sport m.m.
        </p>

        <label className="block text-sm text-white/60 mb-1.5">Dropdown-typ</label>
        <select
          value={dropdownType}
          onChange={e => { setDropdownType(e.target.value as DropdownType); setEditingId(null) }}
          className={`${FINANCE_SELECT_CLASS} mb-4`}
        >
          {DROPDOWN_TYPES.map(t => (
            <option key={t} value={t} className={FINANCE_OPTION_CLASS}>{DROPDOWN_TYPE_LABELS[t]}</option>
          ))}
        </select>

        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

        {loading ? (
          <p className="text-white/40 text-sm">Laddar alternativ...</p>
        ) : (
          <div className="space-y-2 mb-6">
            {options.length === 0 ? (
              <p className="text-white/30 text-sm">Inga alternativ ännu. Lägg till ett nedan.</p>
            ) : options.map((option, i) => (
              <div key={option.id} className="flex items-center gap-2 p-3 bg-gray-800/80 border border-gray-700 rounded-xl">
                <div className="flex flex-col gap-0.5">
                  <button type="button" onClick={() => moveOption(i, -1)} disabled={i === 0 || saving}
                    className="text-white/30 hover:text-white text-xs disabled:opacity-30 cursor-pointer">▲</button>
                  <button type="button" onClick={() => moveOption(i, 1)} disabled={i === options.length - 1 || saving}
                    className="text-white/30 hover:text-white text-xs disabled:opacity-30 cursor-pointer">▼</button>
                </div>
                <span className="text-gray-400 text-sm w-5">{i + 1}.</span>

                {editingId === option.id ? (
                  <div className="flex-1 space-y-2">
                    <input
                      value={editLabel}
                      onChange={e => setEditLabel(e.target.value)}
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-sm"
                    />
                    <input
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Beskrivning (valfritt)"
                      className="w-full bg-gray-900 text-white border border-gray-700 rounded px-3 py-1.5 text-xs"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveEdit(option.id)} disabled={saving}
                        className="text-xs px-2 py-1 bg-[#22c55e] text-black rounded cursor-pointer">Spara</button>
                      <button type="button" onClick={() => setEditingId(null)}
                        className="text-xs px-2 py-1 border border-gray-600 text-white/60 rounded cursor-pointer">Avbryt</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{option.label}</p>
                      <p className="text-gray-500 text-xs truncate">
                        {option.value}{option.description ? ` · ${option.description}` : ''}
                      </p>
                    </div>
                    <button type="button" onClick={() => startEdit(option)}
                      className="text-white/40 hover:text-white text-xs px-2 py-1 cursor-pointer">Redigera</button>
                    <button type="button" onClick={() => deleteOption(option.id)} disabled={saving}
                      className="text-red-500 hover:text-red-400 text-sm px-2 cursor-pointer">✕</button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-3 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
          <h4 className="font-semibold text-sm text-white">Lägg till nytt värde</h4>
          <input
            placeholder="Visningsnamn (t.ex. 'Män')"
            value={newLabel}
            onChange={e => {
              setNewLabel(e.target.value)
              if (!newValue || newValue === slugifyValue(newLabel)) {
                setNewValue(slugifyValue(e.target.value))
              }
            }}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <input
            placeholder="Värde (t.ex. 'male')"
            value={newValue}
            onChange={e => setNewValue(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <input
            placeholder="Beskrivning (valfritt)"
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <button
            type="button"
            onClick={addOption}
            disabled={saving || !newLabel.trim()}
            className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-semibold rounded-lg py-2 text-sm cursor-pointer"
          >
            {saving ? 'Sparar...' : 'Lägg till'}
          </button>
        </div>
      </div>
    </div>
  )
}
