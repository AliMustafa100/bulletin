import { useEffect, useState } from 'react'
import type { JobApplication } from '../types'
import { normalizeDocument } from '../types'
import { normalizeStatus } from '../constants/statuses'

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

function loadApplications(): JobApplication[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Record<string, unknown>[]
    return parsed.map(migrateApplication)
  } catch {
    return []
  }
}

export function useApplications() {
  const [applications, setApplications] = useState<JobApplication[]>(loadApplications)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications))
  }, [applications])

  const addApplication = (app: Omit<JobApplication, 'id' | 'createdAt'>) => {
    const newApp: JobApplication = {
      ...app,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setApplications((prev) => [newApp, ...prev])
    return newApp
  }

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, ...updates } : app))
    )
  }

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.id !== id))
  }

  return { applications, addApplication, updateApplication, deleteApplication }
}
