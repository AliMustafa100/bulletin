import { useRef, useState } from 'react'
import type { StoredDocument } from '../types'
import { readFileAsDataUrl } from '../utils/files'

interface FieldProps {
  id: string
  label: string
  value: StoredDocument | null
  onChange: (value: StoredDocument | null) => void
  textPlaceholder?: string
}

export function DocumentField({
  id,
  label,
  value,
  onChange,
  textPlaceholder = 'Paste text here...',
}: FieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File | undefined) => {
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file.')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      alert('PDF must be under 4 MB to store locally in your browser.')
      return
    }

    const dataUrl = await readFileAsDataUrl(file)
    onChange({ type: 'pdf', content: dataUrl, fileName: file.name })
  }

  const clearDocument = () => {
    onChange(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="field document-field">
      <label htmlFor={id}>
        {label}
        <span className="optional">optional</span>
      </label>

      {value?.type === 'pdf' ? (
        <div className="pdf-attached">
          <div className="pdf-attached-info">
            <span className="pdf-icon">PDF</span>
            <div>
              <span className="pdf-name">{value.fileName ?? 'document.pdf'}</span>
              <span className="pdf-hint">Uploaded PDF</span>
            </div>
          </div>
          <button type="button" className="btn-ghost btn-sm" onClick={clearDocument}>
            Remove
          </button>
        </div>
      ) : (
        <>
          <textarea
            id={id}
            placeholder={textPlaceholder}
            rows={5}
            value={value?.type === 'text' ? value.content : ''}
            onChange={(e) => {
              const text = e.target.value
              onChange(text.trim() ? { type: 'text', content: text } : null)
            }}
          />
          <div className="document-upload-row">
            <span className="upload-divider">or</span>
            <label className="file-upload-btn">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                hidden
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              Upload PDF
            </label>
            <span className="upload-hint">Max 4 MB</span>
          </div>
        </>
      )}
    </div>
  )
}

export function DocumentBlock({
  label,
  document,
  emptyText,
}: {
  label: string
  document: StoredDocument | string | null
  emptyText: string
}) {
  const normalized: StoredDocument | null =
    typeof document === 'string'
      ? document.trim()
        ? { type: 'text', content: document }
        : null
      : document

  if (!normalized?.content?.trim()) {
    return (
      <div className="content-block empty">
        <span className="content-label">{label}</span>
        <span className="empty-text">{emptyText}</span>
      </div>
    )
  }

  if (normalized.type === 'pdf') {
    return <PdfBlock label={label} document={normalized} />
  }

  return <TextBlock label={label} content={normalized.content} />
}

function TextBlock({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(false)

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

function PdfBlock({ label, document }: { label: string; document: StoredDocument }) {
  const [open, setOpen] = useState(false)
  const fileName = document.fileName ?? 'document.pdf'

  return (
    <div className={`content-block pdf-block ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="content-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="content-label">{label}</span>
        <span className="pdf-badge">PDF</span>
      </button>
      <div className="pdf-meta">
        <span className="pdf-name">{fileName}</span>
        <a
          href={document.content}
          download={fileName}
          className="pdf-action"
          onClick={(e) => e.stopPropagation()}
        >
          Download
        </a>
        <a
          href={document.content}
          target="_blank"
          rel="noopener noreferrer"
          className="pdf-action"
          onClick={(e) => e.stopPropagation()}
        >
          Open
        </a>
        <button type="button" className="pdf-action-btn" onClick={() => setOpen(!open)}>
          {open ? 'Hide preview' : 'Preview'}
        </button>
      </div>
      {open && (
        <iframe
          title={`${label} preview`}
          src={document.content}
          className="pdf-preview"
        />
      )}
    </div>
  )
}
