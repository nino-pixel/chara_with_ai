/**
 * Parse listing price strings like "₱4,200,000" or "4200000" to a number.
 */
export function parsePropertyPriceToNumber(price: string | null | undefined): number | null {
  if (price == null || String(price).trim() === '') return null
  const cleaned = String(price).replace(/[^\d.]/g, '')
  if (!cleaned) return null
  const n = parseFloat(cleaned)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

export function formatPeso(n: number, fractionDigits = 0): string {
  const abs = Math.abs(n)
  const formatted = abs.toLocaleString('en-PH', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })
  return n < 0 ? `-₱${formatted}` : `₱${formatted}`
}

/**
 * Format typed/pasted input as Philippine peso with thousands separators
 * (e.g. 9999999 → ₱9,999,999). Strips non-digits; empty → ''.
 */
export function formatPesoInputFromRaw(raw: string): string {
  const digits = String(raw).replace(/\D/g, '').slice(0, 15)
  if (!digits) return ''
  const n = parseInt(digits, 10)
  if (!Number.isFinite(n)) return ''
  return '₱' + n.toLocaleString('en-PH')
}

export type AmortizationResult = {
  monthlyPayment: number
  loanAmount: number
  totalInterest: number
  totalPayment: number
  numPayments: number
}

/**
 * Fixed-rate amortization: M = P * [ r(1+r)^n ] / [ (1+r)^n - 1 ]
 * P = principal (loan amount), r = monthly rate, n = number of months.
 */
export function computeAmortization(
  loanAmount: number,
  annualInterestPercent: number,
  years: number
): AmortizationResult | null {
  if (!Number.isFinite(loanAmount) || loanAmount <= 0) return null
  if (!Number.isFinite(years) || years <= 0) return null
  const n = Math.round(years * 12)
  if (n <= 0) return null

  let annual = annualInterestPercent
  if (!Number.isFinite(annual) || annual < 0) annual = 0
  const r = annual / 100 / 12

  let monthlyPayment: number
  if (r === 0) {
    monthlyPayment = loanAmount / n
  } else {
    const pow = Math.pow(1 + r, n)
    monthlyPayment = (loanAmount * r * pow) / (pow - 1)
  }

  if (!Number.isFinite(monthlyPayment) || monthlyPayment <= 0) return null

  const totalPayment = monthlyPayment * n
  const totalInterest = Math.max(0, totalPayment - loanAmount)

  return {
    monthlyPayment,
    loanAmount,
    totalInterest,
    totalPayment,
    numPayments: n,
  }
}

export type AffordabilityTier = 'affordable' | 'mid' | 'premium'

/** Interpretation label for monthly payment (PHP). */
export function getAffordabilityInsight(monthly: number): { label: string; tier: AffordabilityTier } {
  if (!Number.isFinite(monthly) || monthly <= 0) {
    return { label: '—', tier: 'affordable' }
  }
  if (monthly < 25_000) {
    return { label: 'Affordable range', tier: 'affordable' }
  }
  if (monthly < 50_000) {
    return { label: 'Mid-range', tier: 'mid' }
  }
  return { label: 'Premium investment', tier: 'premium' }
}

export type MortgageCalculatorSnapshot = {
  estimatedMonthly: number | null
  downpayment: string | null
  /** Effective down payment as % of list price (0–100) */
  downpaymentPercent: number | null
  loanTerm: number | null
  interestRate: number | null
  /** True when price parses and loan amount > 0 */
  isValid: boolean
  /** Computed: valid estimate + DP ≥ 20% — strong signal for sales */
  highBuyingIntent: boolean
}
