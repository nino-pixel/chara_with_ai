import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { buildPublicPath, getMarketingAttribution } from '../utils/marketingAttribution'
import { useMarketingLinkTo } from '../hooks/useMarketingLinkTo'
import Swal from 'sweetalert2'
import { getPropertyById, getPropertyStore } from '../data/properties'
import { isPropertyPublicListing } from '../services/propertiesService'
import { trackEvent } from '../services/analyticsService'
import { createPublicInquiry } from '../services/inquiriesService'
import LeadQualificationFields from '../components/LeadQualificationFields'
import './Inquiry.css'

const SOURCE_OPTIONS = [
  { value: '', label: 'Select (optional)' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'google', label: 'Google' },
  { value: 'referral', label: 'Referral' },
  { value: 'walk-in', label: 'Walk-in' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
] as const

export default function Inquiry() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const homeTo = useMarketingLinkTo('/')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [utm, setUtm] = useState({ source: '', campaign: '', medium: '' })
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    propertyId: '',
    message: '',
    sourceManual: '',
    budgetRange: '',
    buyingTimeline: '',
    financingMethod: '',
    employmentStatus: '',
  })

  useEffect(() => {
    const fromStore = getMarketingAttribution()
    const source = searchParams.get('utm_source')?.trim() || fromStore.utm_source || ''
    const campaign = searchParams.get('utm_campaign')?.trim() || fromStore.utm_campaign || ''
    const medium = searchParams.get('utm_medium')?.trim() || fromStore.utm_medium || ''
    setUtm({ source, campaign, medium })
  }, [searchParams, location.pathname])

  useEffect(() => {
    trackEvent('page_view', { page: 'inquiry' })
  }, [])

  const propertyOptions = getPropertyStore().filter((p) => isPropertyPublicListing(p))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setFormError('')

    const name = form.name.trim()
    const email = form.email.trim()
    const phone = form.phone.trim()
    const message = form.message.trim()
    const phoneDigits = phone.replace(/\D/g, '')

    if (name.length < 2) {
      setFormError('Name must be at least 2 characters.')
      return
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRe.test(email)) {
      setFormError('Please enter a valid email address.')
      return
    }
    if (phoneDigits.length !== 11) {
      setFormError('Phone must be 11 digits (PH format).')
      return
    }
    if (!message) {
      setFormError('Message is required.')
      return
    }
    if (!form.budgetRange || !form.buyingTimeline || !form.financingMethod) {
      setFormError('Please select budget range, buying timeline, and financing method.')
      return
    }

    const pid = form.propertyId.trim() || null
    if (pid) {
      const prop = getPropertyById(pid)
      if (!prop || !isPropertyPublicListing(prop)) {
        setFormError('Selected property is not available.')
        return
      }
    }

    setSubmitting(true)
    try {
      const prop = pid ? getPropertyById(pid) : undefined
      await createPublicInquiry({
        name,
        email,
        phone: phoneDigits,
        message,
        propertyId: pid,
        propertyTitle: prop?.title ?? 'General inquiry',
        origin: 'general',
        source_manual: form.sourceManual.trim() || null,
        utm_source: utm.source || null,
        utm_campaign: utm.campaign || null,
        utm_medium: utm.medium || null,
        budgetRange: form.budgetRange,
        buyingTimeline: form.buyingTimeline,
        financingMethod: form.financingMethod,
        employmentStatus: form.employmentStatus.trim() || null,
      })
      setSubmitted(true)
      Swal.fire({
        icon: 'success',
        title: 'Inquiry sent',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2200,
        timerProgressBar: true,
      })
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (submitted) {
    return (
      <div className="inquiry-page">
        <section className="inquiry-success section">
          <div className="container inquiry-card inquiry-card--success">
            <button
              type="button"
              className="inquiry-form-close"
              onClick={() => navigate(buildPublicPath('/'))}
              aria-label="Close"
              title="Close"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <h1 className="section-title">Thank you</h1>
            <p>We&apos;ve received your inquiry and will get back to you soon.</p>
            <Link to={homeTo} className="btn btn-primary">Back to Home</Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="inquiry-page">
      <section className="page-hero inquiry-hero">
        <div className="container">
          <h1 className="page-title">Inquiry Form</h1>
          <p className="page-subtitle">Tell us what you&apos;re looking for. We&apos;ll respond as soon as we can.</p>
        </div>
      </section>
      <section className="inquiry-form-section section">
        <div className="container">
          <form onSubmit={handleSubmit} className="inquiry-form-wrapper">
            <button
              type="button"
              className="inquiry-form-close"
              onClick={() => navigate(buildPublicPath('/'))}
              aria-label="Cancel / Close"
              title="Cancel"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <input type="hidden" name="utm_source" value={utm.source} />
            <input type="hidden" name="utm_campaign" value={utm.campaign} />
            <input type="hidden" name="utm_medium" value={utm.medium} />
            {formError && <p className="form-error" style={{ gridColumn: '1 / -1' }}>{formError}</p>}
            
            <div className="inquiry-cards-container">
              {/* First Card: Personal Info & Source */}
              <div className="inquiry-card-panel">
                <h2 className="inquiry-panel-title">Your Details</h2>
                <div className="form-row">
                  <label htmlFor="name">Name *</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your full name"
                    disabled={submitting}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    disabled={submitting}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="11-digit PH mobile"
                    disabled={submitting}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="propertyId">Property</label>
                  <select
                    id="propertyId"
                    name="propertyId"
                    value={form.propertyId}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    <option value="">Select a property (optional)</option>
                    {propertyOptions.map((p) => (
                      <option key={p.id} value={p.id}>{p.title} — {p.price}</option>
                    ))}
                  </select>
                </div>
                <div className="form-row">
                  <label htmlFor="sourceManual">How did you find us?</label>
                  <select
                    id="sourceManual"
                    name="sourceManual"
                    value={form.sourceManual}
                    onChange={handleChange}
                    disabled={submitting}
                  >
                    {SOURCE_OPTIONS.map((o) => (
                      <option key={o.value || 'empty'} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Second Card: Preferences & Message */}
              <div className="inquiry-card-panel">
                <h2 className="inquiry-panel-title">Your Preferences</h2>
                <div className="form-row form-row--full">
                  <LeadQualificationFields
                    values={{
                      budgetRange: form.budgetRange,
                      buyingTimeline: form.buyingTimeline,
                      financingMethod: form.financingMethod,
                      employmentStatus: form.employmentStatus,
                    }}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </div>
                <div className="form-row">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={form.message}
                    onChange={handleChange}
                    placeholder="What are you looking for? Budget, location, or specific questions..."
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>

            <div className="inquiry-submit-sticky">
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit Inquiry'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
