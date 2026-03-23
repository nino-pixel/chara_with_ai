/**
 * Bulacan-only client addresses (must match backend config/bulacan.php municipalities).
 */
import { BARANGAYS_BY_MUNICIPALITY } from './bulacanBarangays.generated'
import type { BulacanMunicipality } from './bulacanBarangays.generated'

export const BULACAN_PROVINCE = 'Bulacan' as const

export const BULACAN_MUNICIPALITIES: readonly string[] = [
  'Angat',
  'Balagtas',
  'Baliuag',
  'Bocaue',
  'Bulakan',
  'Bustos',
  'Calumpit',
  'Doña Remedios Trinidad',
  'Guiguinto',
  'Hagonoy',
  'Malolos',
  'Marilao',
  'Meycauayan',
  'Norzagaray',
  'Obando',
  'Pandi',
  'Paombong',
  'Plaridel',
  'Pulilan',
  'San Ildefonso',
  'San Jose del Monte',
  'San Miguel',
  'San Rafael',
  'Santa Maria',
] as const

export { BARANGAYS_BY_MUNICIPALITY }
export type { BulacanMunicipality }

/** Barangay options for the selected municipality/city (empty if none selected). */
export function getBarangaysForMunicipality(municipality: string): readonly string[] {
  if (!municipality) return []
  const list = BARANGAYS_BY_MUNICIPALITY[municipality as BulacanMunicipality]
  return list ?? []
}

/** PH mobile: 09 + 9 more digits = 11 total */
export const PH_MOBILE_REGEX = /^09\d{9}$/

export function isValidPhMobile09(v: string): boolean {
  const s = v.replace(/\s/g, '')
  return PH_MOBILE_REGEX.test(s)
}

export function formatBulacanAddressLine(input: {
  purokOrStreet?: string | null
  barangay: string
  municipality: string
  province?: string | null
}): string {
  const prov = input.province ?? BULACAN_PROVINCE
  const parts = [input.purokOrStreet?.trim(), input.barangay.trim(), input.municipality.trim(), prov].filter(
    (p): p is string => Boolean(p && String(p).length > 0)
  )
  return parts.join(', ')
}

/** Display string for admin UI (structured Bulacan address or legacy single-line address). */
export function getClientAddressDisplay(c: {
  municipality?: string | null
  barangay?: string | null
  province?: string | null
  purokOrStreet?: string | null
  address?: string | null
}): string {
  const mun = c.municipality?.trim()
  const brgy = c.barangay?.trim()
  if (mun && brgy) {
    return formatBulacanAddressLine({
      purokOrStreet: c.purokOrStreet,
      barangay: brgy,
      municipality: mun,
      province: c.province ?? BULACAN_PROVINCE,
    })
  }
  const legacy = (c.address ?? '').trim()
  return legacy || '—'
}
