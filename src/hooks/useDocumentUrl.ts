import { useEffect, useState } from 'react'
import type { StoredDocument } from '../types'
import { isDataUrl, isStoragePath, resolveDocumentUrl } from '../lib/documentStorage'
import { isSupabaseConfigured } from '../lib/supabase'

export function useDocumentUrl(document: StoredDocument | null | undefined) {
  const [url, setUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!document || document.type !== 'pdf') {
      setUrl(null)
      setError(null)
      setLoading(false)
      return
    }

    if (isDataUrl(document.content) || document.content.startsWith('http')) {
      setUrl(document.content)
      setError(null)
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured || !isStoragePath(document.content)) {
      setUrl(null)
      setError('Unable to load PDF.')
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError(null)

    resolveDocumentUrl(document)
      .then((signedUrl) => {
        if (!cancelled) {
          setUrl(signedUrl)
          setLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF.')
          setUrl(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [document?.type, document?.content])

  return { url, loading, error }
}
