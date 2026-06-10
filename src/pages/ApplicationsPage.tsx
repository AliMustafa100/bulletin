import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AddApplicationForm } from '../components/AddApplicationForm'
import { ApplicationColumn } from '../components/ApplicationColumn'
import { StatusSummary } from '../components/StatusSummary'
import { UserMenu } from '../components/UserMenu'
import { useApplications } from '../hooks/useApplications'
import type { ApplicationDraft, ApplicationStatus } from '../types'

export function ApplicationsPage() {
  const {
    applications,
    loading,
    syncing,
    error,
    addApplication,
    updateApplication,
    deleteApplication,
  } = useApplications()
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const handleAdd = async (draft: ApplicationDraft) => {
    setSubmitting(true)
    setActionError(null)
    try {
      await addApplication(draft)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to add application.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (id: string, updates: Parameters<typeof updateApplication>[1]) => {
    setActionError(null)
    try {
      await updateApplication(id, updates)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update application.')
    }
  }

  const handleDelete = async (id: string) => {
    setActionError(null)
    try {
      await deleteApplication(id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to delete application.')
    }
  }

  const filteredApplications = statusFilter
    ? applications.filter((app) => app.status === statusFilter)
    : applications

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="brand-link">
            Bulletin
          </Link>
          <h1>Job Applications</h1>
          <p className="tagline">
            Organize your applications, resumes, and CVs in one place
          </p>
        </div>
        <div className="header-actions">
          <div className="header-stats">
            <span className="stat">
              {applications.length}{' '}
              {applications.length === 1 ? 'application' : 'applications'}
            </span>
          </div>
          <UserMenu />
        </div>
      </header>

      <main className="app-main">
        {(error || actionError) && (
          <div className="banner banner-error" role="alert">
            {actionError ?? error}
          </div>
        )}

        {syncing && (
          <div className="banner banner-info" role="status">
            Importing your locally saved applications to the cloud…
          </div>
        )}

        <AddApplicationForm onAdd={handleAdd} submitting={submitting} />

        <section className="board-section">
          <div className="board-header">
            <h2 className="board-title">Your Applications</h2>
            <StatusSummary
              applications={applications}
              activeFilter={statusFilter}
              onFilter={setStatusFilter}
            />
          </div>

          {loading ? (
            <div className="empty-board">
              <p>Loading your applications…</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="empty-board">
              <div className="empty-icon">📋</div>
              <p>No applications yet</p>
              <p className="empty-hint">
                Fill in the form above and click &ldquo;Add to Board&rdquo; to
                create your first column.
              </p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-board">
              <p>No applications with this status</p>
              <p className="empty-hint">
                Try selecting a different filter, or show all applications.
              </p>
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setStatusFilter(null)}
              >
                Show all
              </button>
            </div>
          ) : (
            <div className="board">
              {filteredApplications.map((app) => (
                <ApplicationColumn
                  key={app.id}
                  application={app}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Your data is saved securely to your Bulletin account.</p>
      </footer>
    </div>
  )
}
