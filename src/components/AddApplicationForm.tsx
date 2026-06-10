import { useState } from 'react'
import type { ApplicationDraft, ApplicationStatus } from '../types'
import { documentHasContent, emptyDraft } from '../types'
import { DocumentField } from './DocumentField'
import { StatusPicker } from './StatusPicker'

interface Props {
  onAdd: (draft: ApplicationDraft) => void | Promise<void>
  submitting?: boolean
}

export function AddApplicationForm({ onAdd, submitting = false }: Props) {
  const [draft, setDraft] = useState<ApplicationDraft>(emptyDraft)
  const [expanded, setExpanded] = useState(true)

  const update = (field: keyof ApplicationDraft, value: string) => {
    setDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAdd(draft)
    setDraft(emptyDraft())
  }

  const hasContent =
    draft.title.trim() ||
    draft.company.trim() ||
    draft.jobDescription.trim() ||
    documentHasContent(draft.tailoredResume) ||
    documentHasContent(draft.tailoredCv)

  return (
    <section className="add-form-section">
      <button
        type="button"
        className="section-toggle"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <span className="toggle-icon">{expanded ? '−' : '+'}</span>
        New Application
      </button>

      {expanded && (
        <form className="add-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="title">Job Title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Software Engineer"
                value={draft.title}
                onChange={(e) => update('title', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                type="text"
                placeholder="e.g. Acme Corp"
                value={draft.company}
                onChange={(e) => update('company', e.target.value)}
              />
            </div>
          </div>

          <div className="field status-field">
            <label>Status</label>
            <StatusPicker
              value={draft.status}
              onChange={(status: ApplicationStatus) =>
                setDraft((prev) => ({ ...prev, status }))
              }
            />
          </div>

          <div className="field">
            <label htmlFor="jobDescription">
              Job Description
              <span className="optional">optional</span>
            </label>
            <textarea
              id="jobDescription"
              placeholder="Paste the job description here..."
              rows={5}
              value={draft.jobDescription}
              onChange={(e) => update('jobDescription', e.target.value)}
            />
          </div>

          <div className="form-row">
            <DocumentField
              id="tailoredResume"
              label="Tailored Resume"
              value={draft.tailoredResume}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, tailoredResume: value }))
              }
              textPlaceholder="Paste your tailored resume here..."
            />
            <DocumentField
              id="tailoredCv"
              label="Tailored CV"
              value={draft.tailoredCv}
              onChange={(value) =>
                setDraft((prev) => ({ ...prev, tailoredCv: value }))
              }
              textPlaceholder="Paste your tailored CV here..."
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={!hasContent || submitting}
            >
              {submitting ? 'Adding…' : 'Add to Board'}
            </button>
            {hasContent && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setDraft(emptyDraft())}
              >
                Clear
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  )
}
