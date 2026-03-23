import { useSyncExternalStore } from 'react'
import {
  getSavedPropertyIdsSnapshot,
  getSavedPropertyIdsServerSnapshot,
  subscribeSavedProperties,
} from '../data/savedPropertiesStorage'

/** Re-renders when saved list changes (same tab or other tab). */
export function useSavedPropertyIds(): string[] {
  return useSyncExternalStore(
    subscribeSavedProperties,
    getSavedPropertyIdsSnapshot,
    getSavedPropertyIdsServerSnapshot
  )
}

export function useSavedPropertiesCount(): number {
  return useSavedPropertyIds().length
}
