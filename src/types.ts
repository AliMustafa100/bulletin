import type { ApplicationStatus } from './constants/statuses'
import { DEFAULT_STATUS } from './constants/statuses'

export type { ApplicationStatus }

export interface StoredDocument {
  type: 'text' | 'pdf'
  content: string
  fileName?: string
}

export interface JobApplication {
  id: string
  title: string
  company: string
  status: ApplicationStatus
  jobDescription: string
  tailoredResume: StoredDocument | null
  tailoredCv: StoredDocument | null
  createdAt: string
}

export interface ApplicationDraft {
  title: string
  company: string
  status: ApplicationStatus
  jobDescription: string
  tailoredResume: StoredDocument | null
  tailoredCv: StoredDocument | null
}

export const emptyDocument = (): StoredDocument | null => null

export const emptyDraft = (): ApplicationDraft => ({
  title: '',
  company: '',
  status: DEFAULT_STATUS,
  jobDescription: '',
  tailoredResume: null,
  tailoredCv: null,
})

export function documentHasContent(doc: StoredDocument | null | undefined): boolean {
  if (!doc) return false
  return doc.content.trim().length > 0
}

export function normalizeDocument(
  value: StoredDocument | string | null | undefined
): StoredDocument | null {
  if (!value) return null
  if (typeof value === 'string') {
    return value.trim() ? { type: 'text', content: value } : null
  }
  return documentHasContent(value) ? value : null
}
