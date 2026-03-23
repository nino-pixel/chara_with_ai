import type { InquiryRecord, InquiryStatus } from '../data/mockAdmin'

/** Local calendar YYYY-MM-DD (for follow-up dates; avoids UTC drift from toISOString().slice). */
export function formatLocalDateOnly(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function getTodayDateKey(): string {
  return formatLocalDateOnly(new Date())
}

/** Normalize stored value to YYYY-MM-DD or null. */
export function parseFollowUpDateKey(raw: string | null | undefined): string | null {
  if (raw == null || String(raw).trim() === '') return null
  const s = String(raw).trim()
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/)
  if (m) return m[1]
  const t = Date.parse(s)
  if (Number.isNaN(t)) return null
  return formatLocalDateOnly(new Date(t))
}

export function isTerminalInquiryStatus(status: InquiryStatus): boolean {
  return status === 'converted' || status === 'lost'
}

/** Days after creation for first follow-up from lead qualification timeline (form values). */
export function followUpDaysFromBuyingTimeline(buyingTimeline: string | null | undefined): number {
  const t = (buyingTimeline ?? '').trim().toLowerCase()
  if (t === 'asap') return 1
  if (t === '1_3_months') return 3
  if (t === '3_6_months') return 5
  if (t === 'exploring') return 7
  return 3
}

export function computeNextFollowUpDateFromTimeline(
  from: Date,
  buyingTimeline: string | null | undefined
): string {
  const days = followUpDaysFromBuyingTimeline(buyingTimeline)
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return formatLocalDateOnly(d)
}

export type FollowUpUiKind = 'overdue' | 'today' | 'upcoming'

/**
 * Visual follow-up signal for open leads. Terminal (converted/lost) → no tag.
 * Missing/invalid date → no tag.
 */
export function getFollowUpUiKind(i: InquiryRecord): FollowUpUiKind | null {
  if (isTerminalInquiryStatus(i.status)) return null
  const key = parseFollowUpDateKey(i.nextFollowUpAt)
  if (!key) return null
  const today = getTodayDateKey()
  if (key < today) return 'overdue'
  if (key === today) return 'today'
  return 'upcoming'
}

export function followUpTagLabel(kind: FollowUpUiKind): string {
  switch (kind) {
    case 'overdue':
      return 'OVERDUE'
    case 'today':
      return 'FOLLOW UP TODAY'
    case 'upcoming':
      return 'UPCOMING'
    default:
      return ''
  }
}

/** Sort rank: 0 = overdue … 3 = everything else. */
export function getNeedsAttentionSortRank(i: InquiryRecord): number {
  const kind = getFollowUpUiKind(i)
  if (kind === 'overdue') return 0
  if (kind === 'today') return 1
  if (kind === 'upcoming') return 2
  return 3
}

/** For tie-breaking within the same rank. */
export function getFollowUpSortKey(i: InquiryRecord): string {
  return parseFollowUpDateKey(i.nextFollowUpAt) ?? '9999-12-31'
}

/** Dashboard: overdue first, then due today; excludes terminal leads. */
export function getLeadsNeedingAttention(inquiries: InquiryRecord[], limit = 5): InquiryRecord[] {
  const open = inquiries.filter((i) => !isTerminalInquiryStatus(i.status))
  const withKind = open
    .map((i) => ({ i, kind: getFollowUpUiKind(i) }))
    .filter((x): x is { i: InquiryRecord; kind: 'overdue' | 'today' } => x.kind === 'overdue' || x.kind === 'today')

  withKind.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === 'overdue' ? -1 : 1
    return getFollowUpSortKey(a.i).localeCompare(getFollowUpSortKey(b.i))
  })

  return withKind.slice(0, limit).map((x) => x.i)
}
