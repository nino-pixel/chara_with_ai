/**
 * Client-side saved / favorite properties (no backend).
 * @see SAVED_PROPERTIES_STORAGE_KEY — array of property id strings, no duplicates.
 */

export const SAVED_PROPERTIES_STORAGE_KEY = 'saved_properties'

const CHANGE_EVENT = 'saved-properties-updated'

function parseIds(raw: string | null): string[] {
  if (!raw) return []
  try {
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    const out: string[] = []
    const seen = new Set<string>()
    for (const x of data) {
      if (typeof x !== 'string' || !x.trim() || seen.has(x)) continue
      seen.add(x)
      out.push(x)
    }
    return out
  } catch {
    return []
  }
}

export function getSavedPropertyIds(): string[] {
  if (typeof localStorage === 'undefined') return []
  return parseIds(localStorage.getItem(SAVED_PROPERTIES_STORAGE_KEY))
}

/** Stable empty snapshot — same reference for useSyncExternalStore */
const EMPTY_SNAPSHOT: string[] = []

let snapshotSerialized: string | null = null
let snapshotIds: string[] = EMPTY_SNAPSHOT

function syncSnapshotFromParsed(parsed: string[]) {
  const serialized = JSON.stringify(parsed)
  if (serialized === snapshotSerialized) return snapshotIds
  snapshotSerialized = serialized
  snapshotIds = parsed.length === 0 ? EMPTY_SNAPSHOT : parsed
  return snapshotIds
}

/**
 * For `useSyncExternalStore` only: returns the same array reference when IDs
 * unchanged (React compares snapshots with Object.is).
 */
export function getSavedPropertyIdsSnapshot(): string[] {
  if (typeof localStorage === 'undefined') return EMPTY_SNAPSHOT
  const parsed = parseIds(localStorage.getItem(SAVED_PROPERTIES_STORAGE_KEY))
  return syncSnapshotFromParsed(parsed)
}

export function getSavedPropertyIdsServerSnapshot(): string[] {
  return EMPTY_SNAPSHOT
}

function writeIds(ids: string[]) {
  localStorage.setItem(SAVED_PROPERTIES_STORAGE_KEY, JSON.stringify(ids))
  syncSnapshotFromParsed(ids)
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT))
}

export function setSavedPropertyIds(ids: string[]) {
  const unique: string[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    if (!id || seen.has(id)) continue
    seen.add(id)
    unique.push(id)
  }
  writeIds(unique)
}

export function isPropertySaved(id: string): boolean {
  return getSavedPropertyIds().includes(id)
}

/** @returns true if property is now saved, false if removed */
export function toggleSavedProperty(id: string): boolean {
  const ids = getSavedPropertyIds()
  if (ids.includes(id)) {
    writeIds(ids.filter((x) => x !== id))
    return false
  }
  // Newest saved first
  writeIds([id, ...ids.filter((x) => x !== id)])
  return true
}

export function subscribeSavedProperties(callback: () => void): () => void {
  const onCustom = () => callback()
  const onStorage = (e: StorageEvent) => {
    if (e.key === SAVED_PROPERTIES_STORAGE_KEY) callback()
  }
  window.addEventListener(CHANGE_EVENT, onCustom)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom)
    window.removeEventListener('storage', onStorage)
  }
}
