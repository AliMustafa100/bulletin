import type { ApplicationStatus } from '../constants/statuses'
import { normalizeStatus } from '../constants/statuses'
import type { ApplicationDraft, JobApplication, StoredDocument } from '../types'
import { normalizeDocument } from '../types'
import { deleteStoredDocument, persistDocument } from './documentStorage'
import { requireSupabase } from './supabase'

interface ApplicationRow {
  id: string
  user_id: string
  title: string
  company: string
  status: ApplicationStatus
  job_description: string
  tailored_resume: StoredDocument | null
  tailored_cv: StoredDocument | null
  created_at: string
  updated_at: string
}

function rowToApplication(row: ApplicationRow): JobApplication {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    status: normalizeStatus(row.status),
    jobDescription: row.job_description,
    tailoredResume: normalizeDocument(row.tailored_resume),
    tailoredCv: normalizeDocument(row.tailored_cv),
    createdAt: row.created_at,
  }
}

function draftToInsert(userId: string, draft: ApplicationDraft) {
  return {
    user_id: userId,
    title: draft.title,
    company: draft.company,
    status: draft.status,
    job_description: draft.jobDescription,
    tailored_resume: draft.tailoredResume,
    tailored_cv: draft.tailoredCv,
  }
}

async function persistDocumentsForApplication(
  userId: string,
  applicationId: string,
  resume: StoredDocument | null,
  cv: StoredDocument | null
): Promise<{ tailoredResume: StoredDocument | null; tailoredCv: StoredDocument | null }> {
  const [tailoredResume, tailoredCv] = await Promise.all([
    persistDocument(userId, applicationId, 'resume', resume),
    persistDocument(userId, applicationId, 'cv', cv),
  ])

  return { tailoredResume, tailoredCv }
}

export async function fetchApplications(userId: string): Promise<JobApplication[]> {
  const client = requireSupabase()
  const { data, error } = await client
    .from('applications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data as ApplicationRow[]).map(rowToApplication)
}

export async function createApplication(
  userId: string,
  draft: ApplicationDraft
): Promise<JobApplication> {
  const client = requireSupabase()

  const { data, error } = await client
    .from('applications')
    .insert({
      ...draftToInsert(userId, {
        ...draft,
        tailoredResume: draft.tailoredResume?.type === 'text' ? draft.tailoredResume : null,
        tailoredCv: draft.tailoredCv?.type === 'text' ? draft.tailoredCv : null,
      }),
    })
    .select('*')
    .single()

  if (error) throw error

  const row = data as ApplicationRow
  const documents = await persistDocumentsForApplication(
    userId,
    row.id,
    draft.tailoredResume,
    draft.tailoredCv
  )

  const hasPdf =
    documents.tailoredResume !== draft.tailoredResume ||
    documents.tailoredCv !== draft.tailoredCv

  if (hasPdf) {
    const { data: updated, error: updateError } = await client
      .from('applications')
      .update({
        tailored_resume: documents.tailoredResume,
        tailored_cv: documents.tailoredCv,
      })
      .eq('id', row.id)
      .select('*')
      .single()

    if (updateError) throw updateError
    return rowToApplication(updated as ApplicationRow)
  }

  return rowToApplication({ ...row, ...documents })
}

export async function updateApplicationRecord(
  userId: string,
  id: string,
  updates: Partial<JobApplication>,
  previous?: JobApplication
): Promise<JobApplication> {
  const client = requireSupabase()

  let tailoredResume = updates.tailoredResume
  let tailoredCv = updates.tailoredCv

  if ('tailoredResume' in updates) {
    if (previous?.tailoredResume && updates.tailoredResume !== previous.tailoredResume) {
      await deleteStoredDocument(previous.tailoredResume)
    }
    tailoredResume = await persistDocument(
      userId,
      id,
      'resume',
      updates.tailoredResume ?? null
    )
  }

  if ('tailoredCv' in updates) {
    if (previous?.tailoredCv && updates.tailoredCv !== previous.tailoredCv) {
      await deleteStoredDocument(previous.tailoredCv)
    }
    tailoredCv = await persistDocument(userId, id, 'cv', updates.tailoredCv ?? null)
  }

  const payload: Record<string, unknown> = {}

  if (updates.title !== undefined) payload.title = updates.title
  if (updates.company !== undefined) payload.company = updates.company
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.jobDescription !== undefined) payload.job_description = updates.jobDescription
  if ('tailoredResume' in updates) payload.tailored_resume = tailoredResume
  if ('tailoredCv' in updates) payload.tailored_cv = tailoredCv

  const { data, error } = await client
    .from('applications')
    .update(payload)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single()

  if (error) throw error
  return rowToApplication(data as ApplicationRow)
}

export async function deleteApplicationRecord(
  userId: string,
  application: JobApplication
): Promise<void> {
  const client = requireSupabase()

  await Promise.all([
    deleteStoredDocument(application.tailoredResume),
    deleteStoredDocument(application.tailoredCv),
  ])

  const { error } = await client
    .from('applications')
    .delete()
    .eq('id', application.id)
    .eq('user_id', userId)

  if (error) throw error
}
