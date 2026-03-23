import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  getActivityStore,
  getActivityActionLabel,
  getActivityEntityLabel,
  type ActivityLogEntry,
  type ActivityAction,
  type ActivityEntityType,
} from '../../data/activityLog'
import './admin-common.css'
import './ActivityLog.css'

const ENTITY_TYPES: ActivityEntityType[] = ['property', 'client', 'deal', 'inquiry', 'settings', 'other']
const ACTIONS: ActivityAction[] = ['created', 'updated', 'archived', 'restored', 'deleted', 'status_changed', 'assigned', 'login', 'other']

/** Human-readable relative time for activity "When" column. */
function formatActivityWhen(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const ms = now.getTime() - d.getTime()
  const min = Math.floor(ms / 60000)
  const hour = Math.floor(min / 60)

  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear()

  if (min < 1) return 'Just now'
  if (min < 60 && sameDay) return `${min} minute${min === 1 ? '' : 's'} ago`
  if (hour < 24 && sameDay) return `${hour} hour${hour === 1 ? '' : 's'} ago`
  if (isYesterday) return 'Yesterday'
  if (d.getFullYear() === now.getFullYear()) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ActivityLog() {
  const [entityFilter, setEntityFilter] = useState<ActivityEntityType | 'all'>('all')
  const [actionFilter, setActionFilter] = useState<ActivityAction | 'all'>('all')
  const [actorFilter, setActorFilter] = useState('')
  const [detailsFilter, setDetailsFilter] = useState('')

  const entries = getActivityStore()
  const filtered = useMemo(() => {
    return entries
      .filter((e) => {
        if (entityFilter !== 'all' && e.entityType !== entityFilter) return false
        if (actionFilter !== 'all' && e.action !== actionFilter) return false
        if (actorFilter.trim() && !e.actor.toLowerCase().includes(actorFilter.trim().toLowerCase())) return false
        if (detailsFilter.trim() && !e.details.toLowerCase().includes(detailsFilter.trim().toLowerCase())) return false
        return true
      })
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
  }, [entries, entityFilter, actionFilter, actorFilter, detailsFilter])

  const entityLink = (e: ActivityLogEntry) => {
    if (e.entityType === 'property' && e.entityId) return `/admin/properties/${e.entityId}`
    if (e.entityType === 'client' && e.entityId) return `/admin/clients/${e.entityId}`
    return null
  }

  return (
    <div className="admin-activity-log">
      <h1 className="admin-page-title">Activity / Audit Log</h1>
      <p className="admin-page-subtitle">
        Track who changed what and when. Sino nagbago, kailan, at bakit.
      </p>
      <div className="admin-toolbar activity-log-toolbar">
        <select
          className="admin-input"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value as ActivityEntityType | 'all')}
          style={{ minWidth: '120px' }}
        >
          <option value="all">All types</option>
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{getActivityEntityLabel(t)}</option>
          ))}
        </select>
        <select
          className="admin-input"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ActivityAction | 'all')}
          style={{ minWidth: '140px' }}
        >
          <option value="all">All actions</option>
          {ACTIONS.map((a) => (
            <option key={a} value={a}>{getActivityActionLabel(a)}</option>
          ))}
        </select>
        <input
          type="text"
          className="admin-input"
          placeholder="Filter by actor..."
          value={actorFilter}
          onChange={(e) => setActorFilter(e.target.value)}
          style={{ minWidth: '140px' }}
        />
        <input
          type="text"
          className="admin-input"
          placeholder="Search details..."
          value={detailsFilter}
          onChange={(e) => setDetailsFilter(e.target.value)}
          style={{ minWidth: '160px' }}
        />
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table activity-log-table">
          <thead>
            <tr>
              <th className="col-when">When</th>
              <th className="col-actor">Who</th>
              <th className="col-action">Action</th>
              <th className="col-entity-type">Type</th>
              <th className="col-entity">Entity</th>
              <th className="col-details">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty-cell">
                  No activity matches your filters.
                </td>
              </tr>
            ) : (
              filtered.map((e) => {
                const link = entityLink(e)
                return (
                  <tr key={e.id}>
                    <td className="col-when">{formatActivityWhen(e.at)}</td>
                    <td className="col-actor">{e.actor}</td>
                    <td className="col-action">
                      <span className={`activity-log-action activity-log-action--${e.action}`}>
                        {getActivityActionLabel(e.action)}
                      </span>
                    </td>
                    <td className="col-entity-type">{getActivityEntityLabel(e.entityType)}</td>
                    <td className="col-entity">
                      {link ? (
                        <Link to={link} className="activity-log-entity-link">
                          {e.entityLabel || '—'}
                        </Link>
                      ) : (
                        e.entityLabel || '—'
                      )}
                    </td>
                    <td className="col-details">{e.details || '—'}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
