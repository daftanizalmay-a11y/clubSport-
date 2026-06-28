import type { FixtureAdapter, SourceType } from '../types'
import {
  badmintonManualAdapter,
  cricketManualAdapter,
  footballSwedenAdapter,
  hockeySwedenAdapter,
  imageAdapter,
  webhookAdapter,
} from './sweden'

const ADAPTERS: FixtureAdapter[] = [
  imageAdapter,
  webhookAdapter,
  footballSwedenAdapter,
  hockeySwedenAdapter,
  cricketManualAdapter,
  badmintonManualAdapter,
]

const adapterMap = new Map<SourceType, FixtureAdapter>(
  ADAPTERS.map(a => [a.type, a])
)

export function getAdapter(type: SourceType): FixtureAdapter | undefined {
  return adapterMap.get(type)
}

export function getAllAdapters(): FixtureAdapter[] {
  return ADAPTERS
}

export function registerAdapter(adapter: FixtureAdapter) {
  adapterMap.set(adapter.type, adapter)
  const idx = ADAPTERS.findIndex(a => a.type === adapter.type)
  if (idx >= 0) ADAPTERS[idx] = adapter
  else ADAPTERS.push(adapter)
}

export function adaptersForSport(sport: string, country = 'SE'): FixtureAdapter[] {
  return ADAPTERS.filter(a =>
    (a.supportedSports.includes('*') || a.supportedSports.includes(sport)) &&
    (a.supportedCountries.includes('*') || a.supportedCountries.includes(country))
  )
}

export { ADAPTERS }
