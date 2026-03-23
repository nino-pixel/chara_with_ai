/**
 * Smart lead qualification — shared by public forms, API payload, and admin display.
 */

export type BudgetRangeKey = 'below_20k' | '20k_40k' | '40k_60k' | '60k_plus'
export type BuyingTimelineKey = 'asap' | '1_3_months' | '3_6_months' | 'exploring'
export type FinancingMethodKey = 'bank_loan' | 'pagibig' | 'cash' | 'not_sure'
export type EmploymentStatusKey = 'employed' | 'self_employed' | 'ofw' | 'business_owner' | ''

export const BUDGET_RANGE_OPTIONS: { value: BudgetRangeKey; label: string }[] = [
  { value: 'below_20k', label: 'Below ₱20,000/month' },
  { value: '20k_40k', label: '₱20,000 – ₱40,000' },
  { value: '40k_60k', label: '₱40,000 – ₱60,000' },
  { value: '60k_plus', label: '₱60,000+' },
]

export const BUYING_TIMELINE_OPTIONS: { value: BuyingTimelineKey; label: string }[] = [
  { value: 'asap', label: 'ASAP' },
  { value: '1_3_months', label: 'Within 1–3 months' },
  { value: '3_6_months', label: '3–6 months' },
  { value: 'exploring', label: 'Just exploring' },
]

export const FINANCING_METHOD_OPTIONS: { value: FinancingMethodKey; label: string }[] = [
  { value: 'bank_loan', label: 'Bank loan' },
  { value: 'pagibig', label: 'Pag-IBIG' },
  { value: 'cash', label: 'Cash' },
  { value: 'not_sure', label: 'Not sure yet' },
]

export const EMPLOYMENT_STATUS_OPTIONS: { value: EmploymentStatusKey; label: string }[] = [
  { value: '', label: 'Prefer not to say' },
  { value: 'employed', label: 'Employed' },
  { value: 'self_employed', label: 'Self-employed' },
  { value: 'ofw', label: 'OFW' },
  { value: 'business_owner', label: 'Business owner' },
]

export function budgetRangeLabel(key: string | null | undefined): string {
  if (!key) return '—'
  return BUDGET_RANGE_OPTIONS.find((o) => o.value === key)?.label ?? key
}

export function buyingTimelineLabel(key: string | null | undefined): string {
  if (!key) return '—'
  return BUYING_TIMELINE_OPTIONS.find((o) => o.value === key)?.label ?? key
}

export function financingMethodLabel(key: string | null | undefined): string {
  if (!key) return '—'
  return FINANCING_METHOD_OPTIONS.find((o) => o.value === key)?.label ?? key
}

export function employmentStatusLabel(key: string | null | undefined): string {
  if (!key) return '—'
  return EMPLOYMENT_STATUS_OPTIONS.find((o) => o.value === key)?.label ?? key
}

/** Map calculator monthly payment to budget bucket (PHP). */
export function estimatedMonthlyToBudgetRange(monthly: number): BudgetRangeKey {
  const m = Number(monthly)
  if (!Number.isFinite(m) || m < 0) return 'below_20k'
  if (m < 20_000) return 'below_20k'
  if (m < 40_000) return '20k_40k'
  if (m < 60_000) return '40k_60k'
  return '60k_plus'
}
