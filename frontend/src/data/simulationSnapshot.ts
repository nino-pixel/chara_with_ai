/**
 * Single localStorage snapshot for the full CRM simulation (no backend).
 * Getters registered from main.tsx after all modules load — avoids circular imports.
 */

export const SIMULATION_STORAGE_KEY = 'chara_realty_simulation_v1'

export type SimulationSnapshotV1 = {
  v: 1
  properties: unknown[]
  inquiries: unknown[]
  clients: unknown[]
  transactionsByClient: Record<string, unknown[]>
  activity: unknown[]
}

type SnapshotGetters = {
  properties: () => unknown[]
  inquiries: () => unknown[]
  clients: () => unknown[]
  transactionsByClient: () => Record<string, unknown[]>
  activity: () => unknown[]
}

let snapshotGetters: SnapshotGetters | null = null

export function registerSimulationSnapshotGetters(g: SnapshotGetters) {
  snapshotGetters = g
}

let persistScheduled = false
export function persistSimulationSnapshot() {
  if (typeof window === 'undefined' || !snapshotGetters) return
  if (persistScheduled) return
  persistScheduled = true
  queueMicrotask(() => {
    persistScheduled = false
    try {
      const payload: SimulationSnapshotV1 = {
        v: 1,
        properties: snapshotGetters!.properties(),
        inquiries: snapshotGetters!.inquiries(),
        clients: snapshotGetters!.clients(),
        transactionsByClient: snapshotGetters!.transactionsByClient(),
        activity: snapshotGetters!.activity(),
      }
      localStorage.setItem(SIMULATION_STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* quota */
    }
  })
}

export type HydrateSetters = {
  setProperties: (list: unknown[]) => void
  setInquiries: (list: unknown[]) => void
  setClients: (list: unknown[]) => void
  setTransactionsByClient: (map: Record<string, unknown[]>) => void
  setActivity: (list: unknown[]) => void
}

export function hydrateSimulationFromStorage(setters: HydrateSetters) {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(SIMULATION_STORAGE_KEY)
    if (!raw) return
    const data = JSON.parse(raw) as Partial<SimulationSnapshotV1>
    if (data.v !== 1) return
    if (Array.isArray(data.properties) && data.properties.length) setters.setProperties(data.properties)
    if (Array.isArray(data.inquiries) && data.inquiries.length) setters.setInquiries(data.inquiries)
    if (Array.isArray(data.clients) && data.clients.length) setters.setClients(data.clients)
    if (data.transactionsByClient && typeof data.transactionsByClient === 'object') {
      setters.setTransactionsByClient(data.transactionsByClient as Record<string, unknown[]>)
    }
    if (Array.isArray(data.activity) && data.activity.length) setters.setActivity(data.activity)
  } catch {
    /* ignore */
  }
}
