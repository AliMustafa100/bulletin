import { useState } from 'react'
import { getStatusConfig } from '../constants/statuses'
import type { JobApplication, StoredDocument } from '../types'
import { DocumentBlock, DocumentField } from './DocumentField'
import { StatusPicker } from './StatusPicker'

interface Props {
  application: JobApplication
  onUpdate: (id: string, updates: Partial<JobApplication>) => void
  onDelete: (id: string) => void
}

function ContentBlock({
  label,
  content,
  emptyText,
}: {
  label: string
  content: string
  emptyText: string
}) {
  const [open, setOpen] = useState(false)

  if (!content.trim()) {
    return (
      <div className="content-block empty">
        <span className="content-label">{label}</span>
        <span className="empty-text">{emptyText}</span>
      </div>
    )
  }

  return (
    <div className={`content-block ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="content-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="content-label">{label}</span>
        <span className="content-toggle">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && <pre className="content-body">{content}</pre>}
    </div>
  )
}

export function ApplicationColumn({ application, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const displayTitle =
    application.title.trim() ||
    application.company.trim() ||
    'Untitled Application'

  const displaySubtitle = [application.company, application.title]
    .filter(Boolean)
    .join(' · ')

  const formattedDate = new Date(application.createdAt).toLocaleDateString(
    undefined,
    { month: 'short', day: 'numeric', year: 'numeric' }
  )

  const statusConfig = getStatusConfig(application.status)

  const updateDoc = (
    field: 'tailoredResume' | 'tailoredCv',
    value: StoredDocument | null
  ) => {
    onUpdate(application.id, { [field]: value })
  }

  if (editing) {
    return (
      <article className="column editing">
        <div className="column-header">
          <h3>Edit Application</h3>
          <button
            type="button"
            className="btn-icon"
            onClick={() => setEditing(false)}
            aria-label="Cancel edit"
          >
            ✕
          </button>
        </div>
        <div className="edit-fields">
          <input
            type="text"
            placeholder="Job title"
            value={application.title}
            onChange={(e) => onUpdate(application.id, { title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Company"
            value={application.company}
            onChange={(e) =>
              onUpdate(application.id, { company: e.target.value })
            }
          />
          <textarea
            placeholder="Job description"
            rows={4}
            value={application.jobDescription}
            onChange={(e) =>
              onUpdate(application.id, { jobDescription: e.target.value })
            }
          />
          <div className="field status-field">
            <label>Status</label>
            <StatusPicker
              value={application.status}
              onChange={(status) => onUpdate(application.id, { status })}
            />
          </div>
          <DocumentField
            id={`resume-${application.id}`}
            label="Tailored Resume"
            value={application.tailoredResume}
            onChange={(value) => updateDoc('tailoredResume', value)}
            textPlaceholder="Paste resume text..."
          />
          <DocumentField
            id={`cv-${application.id}`}
            label="Tailored CV"
            value={application.tailoredCv}
            onChange={(value) => updateDoc('tailoredCv', value)}
            textPlaceholder="Paste CV text..."
          />
        </div>
        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={() => setEditing(false)}
        >
          Done
        </button>
      </article>
    )
  }

  return (
    <article
      className={`column column--${statusConfig.tone}`}
      data-status={application.status}
    >
      <div className="column-header">
        <div className="column-title-group">
          <StatusPicker
            value={application.status}
            onChange={(status) => onUpdate(application.id, { status })}
            compact
          />
          <h3>{displayTitle}</h3>
          {displaySubtitle && displaySubtitle !== displayTitle && (
            <p className="column-subtitle">{displaySubtitle}</p>
          )}
          <time className="column-date">{formattedDate}</time>
        </div>
        <div className="column-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setEditing(true)}
            aria-label="Edit application"
            title="Edit"
          >
            ✎
          </button>
          {!confirmDelete ? (
            <button
              type="button"
              className="btn-icon danger"
              onClick={() => setConfirmDelete(true)}
              aria-label="Delete application"
              title="Delete"
            >
              🗑
            </button>
          ) : (
            <div className="confirm-delete">
              <button
                type="button"
                className="btn-danger btn-sm"
                onClick={() => onDelete(application.id)}
              >
                Delete
              </button>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="column-content">
        <ContentBlock
          label="Job Description"
          content={application.jobDescription}
          emptyText="No job description yet"
        />
        <DocumentBlock
          label="Tailored Resume"
          document={application.tailoredResume}
          emptyText="No resume yet"
        />
        <DocumentBlock
          label="Tailored CV"
          document={application.tailoredCv}
          emptyText="No CV yet"
        />
      </div>
    </article>
  )
}
