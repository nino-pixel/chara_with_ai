import type { ReactNode } from 'react'

export interface SectionCardProps {
  /** Section title shown in the header */
  title: string
  /** Optional extra classes for the card container */
  className?: string
  /** Optional aria-label/id association for accessibility (if needed later) */
  headerId?: string
  children: ReactNode
}

/**
 * Reusable content section card used on Deal Profile.
 * Wraps content in the existing `deal-profile-card` + header structure so
 * styling stays consistent with the current design.
 */
export default function SectionCard({ title, className = '', headerId, children }: SectionCardProps) {
  const cardClass = ['deal-profile-card', className].filter(Boolean).join(' ')
  const headingId = headerId ?? undefined

  return (
    <section className={cardClass} aria-labelledby={headingId}>
      <h2 className="deal-profile-section-title" id={headingId}>
        {title}
      </h2>
      {children}
    </section>
  )
}

