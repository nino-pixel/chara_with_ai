import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  /** Content to render inside the existing .admin-toolbar row (filters, buttons, etc.) */
  toolbar?: ReactNode
}

/**
 * Reusable admin page header.
 * Renders the existing .admin-page-title, .admin-page-subtitle and .admin-toolbar
 * structure so styling stays consistent across pages.
 */
export default function PageHeader({ title, subtitle, toolbar }: PageHeaderProps) {
  return (
    <>
      <h1 className="admin-page-title">{title}</h1>
      {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
      {toolbar && <div className="admin-toolbar">{toolbar}</div>}
    </>
  )
}
