import type { ReactNode } from 'react'

export interface StatusBadgeProps {
  /** Full className including base badge + variant classes (e.g. "admin-badge admin-badge--closed") */
  className: string
  /** Badge label/content */
  children: ReactNode
  /** Optional title for tooltip/description */
  title?: string
}

/**
 * Reusable status/role badge.
 * Renders a span with the existing admin-badge classes so styling stays consistent.
 */
export default function StatusBadge({ className, children, title }: StatusBadgeProps) {
  return (
    <span className={className} title={title}>
      {children}
    </span>
  )
}

