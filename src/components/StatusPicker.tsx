import { useEffect, useRef, useState } from 'react'
import {
  APPLICATION_STATUSES,
  getStatusConfig,
  type ApplicationStatus,
} from '../constants/statuses'

interface Props {
  value: ApplicationStatus
  onChange: (status: ApplicationStatus) => void
  compact?: boolean
}

export function StatusPicker({ value, onChange, compact = false }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = getStatusConfig(value)

  useEffect(() => {
    if (!open) return

    const handleClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className={`status-picker ${compact ? 'status-picker--compact' : ''}`}
    >
      <button
        type="button"
        className={`status-badge status-badge--${current.tone}`}
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="status-dot" aria-hidden />
        {current.label}
        <span className="status-chevron" aria-hidden>
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open && (
        <ul className="status-menu" role="listbox">
          {APPLICATION_STATUSES.map((status) => (
            <li key={status.value}>
              <button
                type="button"
                role="option"
                aria-selected={status.value === value}
                className={`status-option status-option--${status.tone} ${
                  status.value === value ? 'selected' : ''
                }`}
                onClick={() => {
                  onChange(status.value)
                  setOpen(false)
                }}
              >
                <span className="status-dot" aria-hidden />
                <span className="status-option-text">
                  <span className="status-option-label">{status.label}</span>
                  {!compact && (
                    <span className="status-option-hint">{status.hint}</span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
