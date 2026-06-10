import { useCallback, useEffect, useState } from 'react'
import type { ApplicationDraft, JobApplication } from '../types'
import { normalizeDocument } from '../types'
import { normalizeStatus } from '../constants/statuses'
import { useAuth } from '../contexts/AuthContext'
import {
  createApplication,
  deleteApplicationRecord,
  fetchApplications,
  updateApplicationRecord,
} from '../lib/applicationsApi'
import { isSupabaseConfigured } from '../lib/supabase'

const STORAGE_KEY = 'job-tracker-applications'

function migrateApplication(raw: Record<string, unknown>): JobApplication {
  return {
    id: String(raw.id),
    title: String(raw.title ?? ''),
    company: String(raw.company ?? ''),
    status: normalizeStatus(raw.status),
    jobDescription: String(raw.jobDescription ?? ''),
    tailoredResume: normalizeDocument(
      raw.tailoredResume as JobApplication['tailoredResume'] | string
    ),
    tailoredCv: normalizeDocument(
      raw.tailoredCv as JobApplication['tailoredCv'] | string
    ),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
  }
}

function loadLocalApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    return parsed.map(migrateApplication)
  } catch {
    return []
  }
}

function clearLocalApplications() {
  localStorage.removeItem(STORAGE_KEY)
}

export function useApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!user) {
      setApplications([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let remote = await fetchApplications(user.id)
      const local = loadLocalApplications()

      if (remote.length === 0 && local.length > 0) {
        setSyncing(true)
        for (const app of local) {
          const created = await createApplication(user.id, {
            title: app.title,
            company: app.company,
            status: app.status,
            jobDescription: app.jobDescription,
            tailoredResume: app.tailoredResume,
            tailoredCv: app.tailoredCv,
          })
          remote = [created, ...remote]
        }
        clearLocalApplications()
        setSyncing(false)
      }

      setApplications(remote)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load applications.')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setApplications(loadLocalApplications())
      setLoading(false)
      return
    }

    void refresh()
  }, [refresh])

  useEffect(() => {
    if (isSupabaseConfigured) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const addApplication = async (draft: ApplicationDraft) => {
    if (!user) {
      throw new Error('You must be signed in to add applications.')
    }

    setError(null)

    if (isSupabaseConfigured) {
      const created = await createApplication(user.id, draft)
      setApplications((prev) => [created, ...prev])
      return created
    }

    const newApp: JobApplication = {
      ...draft,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setApplications((prev) => [newApp, ...prev])
    return newApp
  }

  const updateApplication = async (id: string, updates: Partial<JobApplication>) => {
    setError(null)

    if (isSupabaseConfigured && user) {
      const previous = applications.find((app) => app.id === id)
      const updated = await updateApplicationRecord(user.id, id, updates, previous)
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? updated : app))
      )
      return updated
    }

    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    )
  }

  const deleteApplication = async (id: string) => {
    setError(null)

    if (isSupabaseConfigured && user) {
      const existing = applications.find((app) => app.id === id)
      if (!existing) return
      await deleteApplicationRecord(user.id, existing)
      setApplications((prev) => prev.filter((app) => app.id !== id))
      return
    }

    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  return {
    applications,
    loading,
    syncing,
    error,
    addApplication,
    updateApplication,
    deleteApplication,
    refresh,
  }
}
