/**
 * Activity / Audit Log — tracks who did what, when, and why.
 * BACKEND: persist in activity_log table; same fields.
 */

export type ActivityEntityType = 'property' | 'client' | 'deal' | 'inquiry' | 'settings' | 'other'
export type ActivityAction =
  | 'created'
  | 'updated'
  | 'archived'
  | 'restored'
  | 'deleted'
  | 'status_changed'
  | 'assigned'
  | 'login'
  | 'other'

export interface ActivityLogEntry {
  id: string
  at: string
  actor: string
  action: ActivityAction
  entityType: ActivityEntityType
  entityId: string | null
  entityLabel: string
  details: string
}

const ACTION_LABELS: Record<ActivityAction, string> = {
  created: 'Created',
  updated: 'Updated',
  archived: 'Archived',
  restored: 'Restored',
  deleted: 'Deleted',
  status_changed: 'Status changed',
  assigned: 'Assigned',
  login: 'Login',
  other: 'Other',
}

const ENTITY_LABELS: Record<ActivityEntityType, string> = {
  property: 'Property',
  client: 'Client',
  deal: 'Deal',
  inquiry: 'Inquiry',
  settings: 'Settings',
  other: 'Other',
}

export function getActivityActionLabel(a: ActivityAction): string {
  return ACTION_LABELS[a] ?? a
}

export function getActivityEntityLabel(e: ActivityEntityType): string {
  return ENTITY_LABELS[e] ?? e
}

let activityStore: ActivityLogEntry[] = []

export function getActivityStore(): ActivityLogEntry[] {
  return [...activityStore]
}

export function setActivityStore(updater: (prev: ActivityLogEntry[]) => ActivityLogEntry[]) {
  activityStore = updater(activityStore)
  import('./simulationSnapshot').then(({ persistSimulationSnapshot }) => persistSimulationSnapshot())
}

export function logActivity(params: {
  actor: string
  action: ActivityAction
  entityType: ActivityEntityType
  entityId?: string | null
  entityLabel: string
  details?: string
}) {
  const entry: ActivityLogEntry = {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    at: new Date().toISOString(),
    actor: params.actor || 'Unknown',
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId ?? null,
    entityLabel: params.entityLabel || '—',
    details: params.details ?? '',
  }
  setActivityStore((prev) => [entry, ...prev].slice(0, 2000))
  return entry
}
