import {
  BUDGET_RANGE_OPTIONS,
  BUYING_TIMELINE_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  FINANCING_METHOD_OPTIONS,
} from '../data/leadQualification'
import './LeadQualificationFields.css'

export type LeadQualificationFormSlice = {
  budgetRange: string
  buyingTimeline: string
  financingMethod: string
  employmentStatus: string
}

type Props = {
  values: LeadQualificationFormSlice
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  /** Property page: call when user changes budget (stops calculator overwriting). */
  onBudgetUserEdit?: () => void
  disabled?: boolean
}

export default function LeadQualificationFields({ values, onChange, onBudgetUserEdit, disabled }: Props) {
  const onBudgetChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onBudgetUserEdit?.()
    onChange(e)
  }

  return (
    <fieldset className="lead-qualify-fieldset">
      <legend className="lead-qualify-legend">Help us match you better</legend>
      <p className="lead-qualify-intro">A few quick choices so we can prioritize and respond with the right options.</p>

      <label className="lead-qualify-label" htmlFor="lq-budget">
        Budget range (monthly) *
      </label>
      <select
        id="lq-budget"
        name="budgetRange"
        className="lead-qualify-select"
        required
        value={values.budgetRange}
        onChange={onBudgetChange}
        disabled={disabled}
      >
        <option value="">Select budget range</option>
        {BUDGET_RANGE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label className="lead-qualify-label" htmlFor="lq-timeline">
        Buying timeline *
      </label>
      <select
        id="lq-timeline"
        name="buyingTimeline"
        className="lead-qualify-select"
        required
        value={values.buyingTimeline}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">Select timeline</option>
        {BUYING_TIMELINE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label className="lead-qualify-label" htmlFor="lq-finance">
        Financing method *
      </label>
      <select
        id="lq-finance"
        name="financingMethod"
        className="lead-qualify-select"
        required
        value={values.financingMethod}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">Select financing</option>
        {FINANCING_METHOD_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <label className="lead-qualify-label" htmlFor="lq-employment">
        Employment status <span className="lead-qualify-optional">(optional)</span>
      </label>
      <select
        id="lq-employment"
        name="employmentStatus"
        className="lead-qualify-select"
        value={values.employmentStatus}
        onChange={onChange}
        disabled={disabled}
      >
        {EMPLOYMENT_STATUS_OPTIONS.map((o) => (
          <option key={o.value || 'none'} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </fieldset>
  )
}
