/**
 * Client-side analytics (localStorage). No backend — intentional interim approach.
 *
 * Instrumentation: trackEvent() from public pages (views, saves, inquiries, etc.).
 * Storage key: analytics_events — capped list of { id, type, timestamp, payload }.
 *
 * Known limitations (fine for now; fix when backend exists — do not overbuild here):
 * - Per-browser/device only → admin can look “global” but data is this browser’s localStorage.
 * - Conversion = inquiries/views is naive (repeat views inflate denominator; not unique users).
 * - No session/user id → cannot answer uniques, return visits, or cohort behavior.
 */

export const ANALYTICS_EVENTS_KEY = 'analytics_events'
export const MAX_ANALYTICS_EVENTS = 600

export type AnalyticsEventRecord = {
  id: string
  type: string
  timestamp: string
  payload: Record<string, unknown>
}

const debounceUntil = new Map<string, number>()

const DEBOUNCE_MS: Record<string, number> = {
  property_view: 45_000,
  calculator_use: 2_500,
  page_view: 8_000,
  default: 400,
}

function debounceKey(type: string, payload: Record<string, unknown>): string | null {
  if (type === 'property_view' && typeof payload.propertyId === 'string') {
    return `property_view:${payload.propertyId}`
  }
  if (type === 'calculator_use' && typeof payload.propertyId === 'string') {
    return `calculator_use:${payload.propertyId}`
  }
  if (type === 'page_view' && typeof payload.page === 'string') {
    const pid = typeof payload.propertyId === 'string' ? payload.propertyId : ''
    return `page_view:${payload.page}:${pid}`
  }
  if (
    type === 'inquiry_submit' ||
    type === 'property_save' ||
    type === 'property_unsave' ||
    type === 'inquire_click'
  ) {
    return null
  }
  return `${type}:${JSON.stringify(payload)}`
}

function shouldSkipDebounced(type: string, payload: Record<string, unknown>): boolean {
  const key = debounceKey(type, payload)
  if (!key) return false
  const windowMs = DEBOUNCE_MS[type] ?? DEBOUNCE_MS.default
  const now = Date.now()
  const last = debounceUntil.get(key) ?? 0
  if (now - last < windowMs) return true
  debounceUntil.set(key, now)
  return false
}

function readEventsRaw(): AnalyticsEventRecord[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(ANALYTICS_EVENTS_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    return data.filter(
      (x): x is AnalyticsEventRecord =>
        x != null &&
        typeof x === 'object' &&
        typeof (x as AnalyticsEventRecord).id === 'string' &&
        typeof (x as AnalyticsEventRecord).type === 'string' &&
        typeof (x as AnalyticsEventRecord).timestamp === 'string' &&
        typeof (x as AnalyticsEventRecord).payload === 'object' &&
        (x as AnalyticsEventRecord).payload != null
    )
  } catch {
    return []
  }
}

function writeEvents(events: AnalyticsEventRecord[]) {
  const trimmed =
    events.length > MAX_ANALYTICS_EVENTS ? events.slice(-MAX_ANALYTICS_EVENTS) : events
  try {
    localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(trimmed))
  } catch {
    /* quota — drop half and retry once */
    try {
      localStorage.setItem(
        ANALYTICS_EVENTS_KEY,
        JSON.stringify(trimmed.slice(-Math.floor(MAX_ANALYTICS_EVENTS / 2)))
      )
    } catch {
      /* ignore */
    }
  }
}

/**
 * Append an analytics event. Applies debouncing for noisy types (views, calculator, page_view).
 */
export function trackEvent(type: string, payload: Record<string, unknown> = {}) {
  if (typeof localStorage === 'undefined') return
  if (shouldSkipDebounced(type, payload)) return

  const record: AnalyticsEventRecord = {
    id: `e-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    timestamp: new Date().toISOString(),
    payload: { ...payload },
  }

  const next = [...readEventsRaw(), record]
  writeEvents(next)
}

export function getAnalyticsEvents(): AnalyticsEventRecord[] {
  return readEventsRaw()
}

export function resetClientAnalytics() {
  debounceUntil.clear()
  try {
    localStorage.removeItem(ANALYTICS_EVENTS_KEY)
  } catch {
    /* ignore */
  }
}

export type PropertyClientStats = {
  views: number
  saves: number
  inquiries: number
}

/** Aggregate client-tracked metrics per propertyId from stored events. */
export function aggregateClientAnalyticsByProperty(): Map<string, PropertyClientStats> {
  const events = readEventsRaw()
  const m = new Map<string, PropertyClientStats>()

  const ensure = (pid: string): PropertyClientStats => {
    let s = m.get(pid)
    if (!s) {
      s = { views: 0, saves: 0, inquiries: 0 }
      m.set(pid, s)
    }
    return s
  }

  for (const e of events) {
    const p = e.payload
    const pid = typeof p.propertyId === 'string' ? p.propertyId : null

    switch (e.type) {
      case 'property_view':
        if (pid) ensure(pid).views += 1
        break
      case 'property_save':
        if (pid) ensure(pid).saves += 1
        break
      case 'property_unsave':
        if (pid) {
          const s = ensure(pid)
          s.saves = Math.max(0, s.saves - 1)
        }
        break
      case 'inquiry_submit':
        if (pid) ensure(pid).inquiries += 1
        break
      default:
        break
    }
  }

  return m
}

