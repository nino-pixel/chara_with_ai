/**
 * Hybrid bootstrap: optional one-time localStorage → Laravel sync, then hydrate stores from API.
 * Does not remove localStorage; keeps SPA working when API is down.
 */
import type { Property } from '../data/properties'
import type { InquiryRecord } from '../data/mockAdmin'
import { setPropertyStore } from '../data/properties'
import { setInquiryStore } from '../data/mockAdmin'
import { SIMULATION_STORAGE_KEY, persistSimulationSnapshot } from '../data/simulationSnapshot'
import { apiGet, apiPost } from './api'
import { getAuthToken } from './authStore'
import { getApiBaseUrl } from './apiConfig'

export const MIGRATION_TO_API_KEY = 'chara_migrated_to_api_v1'

const HEALTH_TIMEOUT_MS = 3500

export async function runApiBootstrap(): Promise<void> {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const ctrl = new AbortController()
    const t = window.setTimeout(() => ctrl.abort(), HEALTH_TIMEOUT_MS)
    const healthUrl = getApiBaseUrl() ? `${getApiBaseUrl()}/api/health` : '/api/health'
    const res = await fetch(healthUrl, { signal: ctrl.signal })
    window.clearTimeout(t)
    if (!res.ok) return
  } catch {
    return
  }

  const raw = localStorage.getItem(SIMULATION_STORAGE_KEY)
  const already = localStorage.getItem(MIGRATION_TO_API_KEY) === '1'

  /** Sync pushes local snapshot to the API — requires an authenticated admin session. */
  if (raw && !already && getAuthToken()) {
    try {
      const snap = JSON.parse(raw) as {
        properties?: unknown[]
        inquiries?: unknown[]
        clients?: unknown[]
        transactionsByClient?: Record<string, unknown[]>
      }
      await apiPost('/sync/from-local', {
        properties: snap.properties ?? [],
        inquiries: snap.inquiries ?? [],
        clients: snap.clients ?? [],
        transactionsByClient: snap.transactionsByClient ?? {},
      })
      localStorage.setItem(MIGRATION_TO_API_KEY, '1')
    } catch {
      /* keep local data */
    }
  }

  let touched = false

  try {
    const propsRes = await apiGet<{ success?: boolean; data?: Property[] }>('/properties')
    const list = propsRes?.data
    /** Replace store whenever the API returns an array (including empty), so we mirror the database. */
    if (Array.isArray(list)) {
      setPropertyStore(() => list)
      touched = true
    }
  } catch {
    /* keep local */
  }

  try {
    const inqRes = await apiGet<{ data: InquiryRecord[] }>('/inquiries')
    if (Array.isArray(inqRes.data) && inqRes.data.length > 0) {
      setInquiryStore(() => inqRes.data)
      touched = true
    }
  } catch {
    /* keep local */
  }

  if (touched) {
    try {
      persistSimulationSnapshot()
    } catch {
      /* ignore */
    }
  }
}
