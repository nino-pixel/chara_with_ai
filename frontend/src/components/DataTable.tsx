import type { ReactNode } from 'react'

export interface DataTableProps {
  /** Extra classes to append to the base admin-table-wrap container */
  wrapperClassName?: string
  /** Extra classes to append to the base admin-table element */
  tableClassName?: string
  /** Table content (thead, tbody, tfoot, etc.) */
  children: ReactNode
}

/**
 * Reusable admin table wrapper.
 * Renders the existing `.admin-table-wrap` and `.admin-table` structure so
 * layout and styling remain consistent across pages.
 */
export default function DataTable({ wrapperClassName = '', tableClassName = '', children }: DataTableProps) {
  const wrapClass = ['admin-table-wrap', wrapperClassName].filter(Boolean).join(' ')
  const tableClass = ['admin-table', tableClassName].filter(Boolean).join(' ')

  return (
    <div className={wrapClass}>
      <table className={tableClass}>
        {children}
      </table>
    </div>
  )
}

