import type { StoredDocument } from '../types'
import { requireSupabase } from './supabase'

export const DOCUMENTS_BUCKET = 'application-documents'

export type DocumentKind = 'resume' | 'cv'

export function documentStoragePath(
  userId: string,
  applicationId: string,
  kind: DocumentKind
): string {
  return `${userId}/${applicationId}/${kind}.pdf`
}

export function isDataUrl(value: string): boolean {
  return value.startsWith('data:')
}

export function isStoragePath(value: string): boolean {
  return !isDataUrl(value) && !value.startsWith('http')
}

export async function uploadPdfFile(
  userId: string,
  applicationId: string,
  kind: DocumentKind,
  file: File
): Promise<StoredDocument> {
  const client = requireSupabase()
  const path = documentStoragePath(userId, applicationId, kind)

  const { error } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { upsert: true, contentType: 'application/pdf' })

  if (error) throw error

  return { type: 'pdf', content: path, fileName: file.name }
}

export async function uploadPdfFromDataUrl(
  userId: string,
  applicationId: string,
  kind: DocumentKind,
  dataUrl: string,
  fileName: string
): Promise<StoredDocument> {
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const file = new File([blob], fileName, { type: 'application/pdf' })
  return uploadPdfFile(userId, applicationId, kind, file)
}

export async function resolveDocumentUrl(
  document: StoredDocument
): Promise<string> {
  if (document.type !== 'pdf') return document.content
  if (isDataUrl(document.content) || document.content.startsWith('http')) {
    return document.content
  }

  const client = requireSupabase()
  const { data, error } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(document.content, 3600)

  if (error) throw error
  return data.signedUrl
}

export async function deleteStoredDocument(
  document: StoredDocument | null | undefined
): Promise<void> {
  if (!document || document.type !== 'pdf') return
  if (!isStoragePath(document.content)) return

  const client = requireSupabase()
  const { error } = await client.storage
    .from(DOCUMENTS_BUCKET)
    .remove([document.content])

  if (error) throw error
}

export async function persistDocument(
  userId: string,
  applicationId: string,
  kind: DocumentKind,
  document: StoredDocument | null
): Promise<StoredDocument | null> {
  if (!document) return null

  if (document.type === 'text') {
    return document.content.trim() ? document : null
  }

  if (isStoragePath(document.content)) {
    return document
  }

  if (isDataUrl(document.content)) {
    return uploadPdfFromDataUrl(
      userId,
      applicationId,
      kind,
      document.content,
      document.fileName ?? `${kind}.pdf`
    )
  }

  return document
}
