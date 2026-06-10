import {
  APPLICATION_STATUSES,
  countByStatus,
  type ApplicationStatus,
} from '../constants/statuses'
import type { JobApplication } from '../types'

interface Props {
  applications: JobApplication[]
  activeFilter: ApplicationStatus | null
  onFilter: (status: ApplicationStatus | null) => void
}

export function StatusSummary({ applications, activeFilter, onFilter }: Props) {
  if (applications.length === 0) return null

  const counts = countByStatus(applications)

  return (
    <div className="status-summary">
      <button
        type="button"
        className={`status-chip ${activeFilter === null ? 'active' : ''}`}
        onClick={() => onFilter(null)}
      >
        All
        <span className="status-chip-count">{applications.length}</span>
      </button>
      {APPLICATION_STATUSES.map((status) => {
        const count = counts[status.value]
        if (count === 0) return null

        return (
          <button
            key={status.value}
            type="button"
            className={`status-chip status-chip--${status.tone} ${
              activeFilter === status.value ? 'active' : ''
            }`}
            onClick={() =>
              onFilter(activeFilter === status.value ? null : status.value)
            }
          >
            <span className="status-dot" aria-hidden />
            {status.label}
            <span className="status-chip-count">{count}</span>
          </button>
        )
      })}
    </div>
  )
}
