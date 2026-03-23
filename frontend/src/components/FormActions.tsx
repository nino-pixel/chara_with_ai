import type { ReactNode } from 'react'

/**
 * Reusable sticky action bar for form sidebars and modals.
 * Renders Save (or primary) and Cancel at the bottom of the form container.
 * All form modules (Property, Client, Deal, etc.) must use this component
 * so Save and Cancel always appear as a sticky action bar.
 */
export interface FormActionsProps {
  /** Label for the primary button (e.g. "Save", "Add Property", "Update Deal") */
  primaryLabel: string
  /** Handler for the primary action */
  onPrimary: () => void
  /** Label for the cancel button. Default: "Cancel" */
  cancelLabel?: string
  /** Handler for cancel */
  onCancel: () => void
  /** Disable the primary button (e.g. while submitting) */
  primaryDisabled?: boolean
  /** Optional: render custom content instead of default primary/cancel buttons */
  children?: ReactNode
  /** Optional: extra class name for the footer (e.g. property-sidebar-footer for Property module) */
  className?: string
}

export default function FormActions({
  primaryLabel,
  onPrimary,
  cancelLabel = 'Cancel',
  onCancel,
  primaryDisabled = false,
  children,
  className = '',
}: FormActionsProps) {
  const footerClass = ['sidebar-form-footer', className].filter(Boolean).join(' ')
  return (
    <footer className={footerClass}>
      <div className="admin-form-actions">
        {children ?? (
          <>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onPrimary}
              disabled={primaryDisabled}
            >
              {primaryLabel}
            </button>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              {cancelLabel}
            </button>
          </>
        )}
      </div>
    </footer>
  )
}
