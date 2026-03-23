/**
 * Deals / Transactions — central sales pipeline.
 * Pipeline: Inquiry → Negotiation → Reserved → Processing Documents → Closed | Cancelled.
 * BACKEND: deals/transactions table with client_id, property_id, deal_id, status, property_price, final_sale_price, payment_method, created_at, closing_date, admin_notes, documents. Use payments[] (reservation, downpayment, full_payment) — no separate reservation_fee column.
 *
 * OPTIONAL LATER (single-user CRM — skip for now): Deal Source. Client has source (Website, Facebook, etc.); deal could have its own source (Website inquiry, Direct call, Agent referral, Returning client) to measure marketing effectiveness. Not critical for now.
 *
 * Cancelled deals: optional cancelled_reason (e.g. Client backed out, Loan rejected, Price disagreement, Property sold to another). After many cancelled deals, analyze WHY — not critical for solo CRM but useful.
 */

import { getClientStore } from './clientsData'
import { getTransactionsByClientId, type ClientTransactionRow } from './clientsData'

/** Deal pipeline — not just Closed/Pending. */
export type DealStatus =
  | 'Inquiry'
  | 'Negotiation'
  | 'Reserved'
  | 'Processing Documents'
  | 'Closed'
  | 'Cancelled'

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  'Inquiry': 'Inquiry',
  'Negotiation': 'Negotiation',
  'Reserved': 'Reserved',
  'Processing Documents': 'Processing Documents',
  'Closed': 'Closed',
  'Cancelled': 'Cancelled',
}

/** Example cancelled/loss reasons — for dropdown or free text. Use when status is Cancelled. */
export const DEAL_CANCELLED_REASON_EXAMPLES = [
  'Client backed out',
  'Loan rejected',
  'Price disagreement',
  'Property sold to another buyer',
] as const

export const DEAL_STATUSES: DealStatus[] = [
  'Inquiry',
  'Negotiation',
  'Reserved',
  'Processing Documents',
  'Closed',
  'Cancelled',
]

/** Map legacy transaction status to pipeline status for display. */
function normalizeStatus(s: string): DealStatus {
  if (s === 'Completed' || s === 'Approved') return 'Closed'
  if (s === 'Processing') return 'Processing Documents'
  if (s === 'Reserved' || s === 'Cancelled') return s
  if (s === 'Inquiry' || s === 'Negotiation' || s === 'Processing Documents' || s === 'Closed') return s as DealStatus
  return 'Inquiry'
}

/** Parse peso string (e.g. "₱4,200,000" or "4200000") to number. Returns null if invalid. */
export function parsePesoAmount(s: string | null | undefined): number | null {
  if (s == null || String(s).trim() === '') return null
  const cleaned = String(s).replace(/[₱,\s]/g, '')
  const n = parseInt(cleaned, 10)
  return Number.isNaN(n) ? null : n
}

/** Format number as peso (e.g. 4200000 → "₱4,200,000"). */
export function formatPesoAmount(n: number): string {
  return '₱' + n.toLocaleString('en-PH')
}

/** Short format for large amounts (e.g. 1250000 → "₱1.25M", 4100000 → "₱4.1M"). */
export function formatPesoShort(n: number): string {
  if (n >= 1e6) {
    const m = n / 1e6
    const s = m % 1 === 0 ? m.toFixed(0) : m.toFixed(2).replace(/\.?0+$/, '')
    return `₱${s}M`
  }
  if (n >= 1e3) {
    const k = n / 1e3
    const s = k % 1 === 0 ? k.toFixed(0) : k.toFixed(2).replace(/\.?0+$/, '')
    return `₱${s}K`
  }
  return formatPesoAmount(n)
}

/**
 * Compute paid total from payments array and return paid/total summary for display.
 * Paid is capped at sale price so we never show "₱5.35M / ₱4.1M" (payments are progress
 * toward the sale price: reservation + downpayment(s) + remaining balance = sale price).
 * Returns e.g. "₱4.1M / ₱4.1M" or "₱100k / ₱3.5M".
 */
export function getDealPaymentsSummary(deal: { payments?: { amount: string }[] | null; price?: string; finalSalePrice?: string | null }): string {
  const total = parsePesoAmount(deal.finalSalePrice ?? deal.price)
  const payments = deal.payments ?? []
  let sum = 0
  for (const p of payments) {
    const n = parsePesoAmount(p.amount)
    if (n != null) sum += n
  }
  const paid = total != null && sum > total ? total : sum
  if (total == null) return paid > 0 ? formatPesoShort(paid) : '—'
  return `${formatPesoShort(paid)} / ${formatPesoShort(total)}`
}

/**
 * Compute discount = propertyPrice - finalSalePrice.
 * Use for negotiation analysis. Not stored — calculated from propertyPrice and finalSalePrice.
 */
export function computeDealDiscount(propertyPrice: string | null, finalSalePrice: string | null): number | null {
  const pp = parsePesoAmount(propertyPrice)
  const fp = parsePesoAmount(finalSalePrice)
  if (pp == null || fp == null) return null
  const discount = pp - fp
  return discount <= 0 ? 0 : discount
}

/** Formatted discount for display, or null if not applicable. */
export function getDealDiscountFormatted(propertyPrice: string | null, finalSalePrice: string | null): string | null {
  const d = computeDealDiscount(propertyPrice, finalSalePrice)
  if (d == null) return null
  return d === 0 ? '₱0' : formatPesoAmount(d)
}

export interface Deal {
  id: string
  dealId: string
  clientId: string
  clientName: string
  propertyId: string | null
  propertyTitle: string
  status: DealStatus
  /** Display price: final sale price if set, else amount */
  price: string
  /** Deal/transaction date; display uses closingDate if set */
  date: string
  closingDate: string | null
  /** Expected closing date — track delays vs actual. */
  expectedClosingDate: string | null
  /** When status is Cancelled: reason (optional). For analyzing why deals fail. */
  cancelledReason: string | null
  propertyPrice: string | null
  finalSalePrice: string | null
  paymentMethod: string | null
  createdAt: string | null
  adminNotes: string | null
  updatedAt: string | null
  documents: ClientTransactionRow['documents']
  activity: ClientTransactionRow['activity']
  /** Payments: Reservation, Downpayment(s), Full payment */
  payments: ClientTransactionRow['payments']
  /** Status timeline (pipeline history) */
  statusHistory: ClientTransactionRow['statusHistory']
  /** Computed: discount = propertyPrice - finalSalePrice (for negotiation analysis). Not stored. */
  discount: string | null
  _clientId: string
  _row: ClientTransactionRow
}

export function getNextDealId(): string {
  const all = getAllDeals()
  const numbers = all
    .map((d) => {
      const m = d.dealId.match(/^DL-(\d+)$/i)
      return m ? parseInt(m[1], 10) : 0
    })
    .filter((n) => n > 0)
  const max = numbers.length ? Math.max(...numbers) : 0
  return `DL-${String(max + 1).padStart(3, '0')}`
}

export function getAllDeals(): Deal[] {
  const clients = getClientStore().filter((c) => !c.archived)
  const deals: Deal[] = []
  let dealIndex = 0
  clients.forEach((c) => {
    getTransactionsByClientId(c.id).forEach((t) => {
      dealIndex += 1
      const dealId = t.dealId ?? `DL-${String(dealIndex).padStart(3, '0')}`
      const status = normalizeStatus(t.status)
      const closingDate = t.closingDate ?? null
      deals.push({
        id: t.id,
        dealId,
        clientId: c.id,
        clientName: c.name,
        propertyId: t.propertyId ?? null,
        propertyTitle: t.propertyTitle,
        status,
        price: t.finalSalePrice ?? t.amount,
        date: t.date,
        closingDate,
        expectedClosingDate: t.expectedClosingDate ?? null,
        cancelledReason: t.cancelledReason ?? null,
        propertyPrice: t.propertyPrice ?? null,
        finalSalePrice: t.finalSalePrice ?? null,
        paymentMethod: t.paymentMethod ?? null,
        createdAt: t.createdAt ?? null,
        adminNotes: t.adminNotes ?? null,
        updatedAt: t.updatedAt ?? null,
        documents: t.documents ?? undefined,
        activity: t.activity ?? undefined,
        payments: t.payments ?? undefined,
        statusHistory: t.statusHistory ?? undefined,
        discount: getDealDiscountFormatted(t.propertyPrice ?? null, t.finalSalePrice ?? t.amount),
        _clientId: c.id,
        _row: t,
      })
    })
  })
  return deals.sort((a, b) => {
    const ta = new Date(a.createdAt || a.closingDate || a.date || 0).getTime()
    const tb = new Date(b.createdAt || b.closingDate || b.date || 0).getTime()
    return tb - ta
  })
}

export function getDealByDealId(dealId: string): Deal | null {
  return getAllDeals().find((d) => d.dealId === dealId) ?? null
}
