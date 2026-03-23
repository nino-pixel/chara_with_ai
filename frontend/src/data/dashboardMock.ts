/**
 * Mock data for Admin Dashboard (chart-based).
 * KEEP IT LEAN: This is a single-user CRM. Do NOT add enterprise fluff:
 *   - weather, calendar, quotes, notifications, agent ranking.
 * BACKEND NOTES (for when wiring API):
 * - Summary cards: clients count(id), properties status=available, transactions sum(amount) this month,
 *   inquiries status=pending/new, transactions status=closed.
 * - Sales trend: SUM(deal amount) per month from transactions/deals — NOT property price.
 *   Deals can have discounts, different closing price. Use transaction.amount only.
 *   Chart: Jan–Dec, sales amount per month.
 * - Lead source: clients.source (Facebook, Website, Walk-in, Referral).
 * - Property status: properties.status (Available, Reserved, Sold).
 * - Inquiries/leads per month: COUNT of leads created per month (GROUP BY month, created_at). Jan–Dec.
 *   Use for lead growth and marketing performance. Chart = new leads created that month.
 * - Recent activity: Last 5 system activities (e.g. property added, lead created, client saved property, deal closed, status changed). Activity + date.
 * - OPTIONAL LATER: Average Property Price (Avg Listing Price) — e.g. ₱6,200,000. Helps brokers understand market positioning. Formula: AVG(price) over active/listable properties.
 * - SECURITY: Dashboard must not be public; require authenticated admin and redirect if not.
 */

export const MOCK_SUMMARY = {
  totalClients: 24,
  activeListings: 6,
  newLeadsThisMonth: 12,
  pendingInquiries: 5,
  closedDeals: 2,
  monthlySales: 6888000,
}

/** Monthly sales = deal amount (transaction amount) per month, Jan–Dec. NOT property price — deals may have discounts, different closing price. */
export const MOCK_MONTHLY_SALES = [
  { month: 'Jan', total: 3500000 },
  { month: 'Feb', total: 7800000 },
  { month: 'Mar', total: 0 },
  { month: 'Apr', total: 4100000 },
  { month: 'May', total: 2800000 },
  { month: 'Jun', total: 5500000 },
  { month: 'Jul', total: 4900000 },
  { month: 'Aug', total: 5200000 },
  { month: 'Sep', total: 6100000 },
  { month: 'Oct', total: 4800000 },
  { month: 'Nov', total: 7200000 },
  { month: 'Dec', total: 6500000 },
]

export const MOCK_CLIENT_SOURCE = [
  { source: 'Facebook', count: 120 },
  { source: 'Website', count: 80 },
  { source: 'Walk-in', count: 45 },
  { source: 'Referral', count: 40 },
]

export const MOCK_PROPERTY_STATUS: { name: string; value: number; statusKey: string }[] = [
  { name: 'Available', value: 4, statusKey: 'available' },
  { name: 'Reserved', value: 1, statusKey: 'reserved' },
  { name: 'Under Negotiation', value: 1, statusKey: 'under_negotiation' },
  { name: 'Processing Docs', value: 0, statusKey: 'processing_docs' },
  { name: 'Sold', value: 2, statusKey: 'sold' },
  { name: 'Draft', value: 1, statusKey: 'draft' },
  { name: 'Cancelled', value: 0, statusKey: 'cancelled' },
]

/** Leads created per month, Jan–Dec. Count of new leads/inquiries created that month. Use for lead growth and marketing performance. */
export const MOCK_INQUIRIES_PER_MONTH = [
  { month: 'Jan', count: 20 },
  { month: 'Feb', count: 15 },
  { month: 'Mar', count: 28 },
  { month: 'Apr', count: 22 },
  { month: 'May', count: 18 },
  { month: 'Jun', count: 25 },
  { month: 'Jul', count: 19 },
  { month: 'Aug', count: 24 },
  { month: 'Sep', count: 21 },
  { month: 'Oct', count: 26 },
  { month: 'Nov', count: 23 },
  { month: 'Dec', count: 17 },
]

export interface RecentActivityRow {
  activity: string
  date: string
  /** Icon key for activity type: property_added, lead_created, inquiry_received, deal_closed, property_saved, property_status_changed */
  activityType: 'property_added' | 'lead_created' | 'inquiry_received' | 'deal_closed' | 'property_saved' | 'property_status_changed'
}

/** Last 5 system activities — property added, lead created, saved, deal closed, status changed. */
export const MOCK_RECENT_ACTIVITY: RecentActivityRow[] = [
  { activity: 'Maria added property "Solana Heights"', date: 'Feb 12, 2026', activityType: 'property_added' },
  { activity: 'Lead created from website', date: 'Feb 11, 2026', activityType: 'lead_created' },
  { activity: 'Client Roberto saved property', date: 'Feb 11, 2026', activityType: 'property_saved' },
  { activity: 'Deal closed for Greenfield Residence', date: 'Feb 10, 2026', activityType: 'deal_closed' },
  { activity: 'Property status changed to Sold', date: 'Feb 10, 2026', activityType: 'property_status_changed' },
]

