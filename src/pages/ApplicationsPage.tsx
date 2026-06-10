import { Link } from 'react-router-dom'
import { useState } from 'react'
import { AddApplicationForm } from '../components/AddApplicationForm'
import { ApplicationColumn } from '../components/ApplicationColumn'
import { StatusSummary } from '../components/StatusSummary'
import { useApplications } from '../hooks/useApplications'
import type { ApplicationDraft, ApplicationStatus } from '../types'

export function ApplicationsPage() {
  const { applications, addApplication, updateApplication, deleteApplication } =
    useApplications()
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | null>(
    null
  )

  const handleAdd = (draft: ApplicationDraft) => {
    addApplication(draft)
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
        <div className="header-stats">
          <span className="stat">
            {applications.length}{' '}
            {applications.length === 1 ? 'application' : 'applications'}
          </span>
        </div>
      </header>

      <main className="app-main">
        <AddApplicationForm onAdd={handleAdd} />

        <section className="board-section">
          <div className="board-header">
            <h2 className="board-title">Your Applications</h2>
            <StatusSummary
              applications={applications}
              activeFilter={statusFilter}
              onFilter={setStatusFilter}
            />
          </div>

          {applications.length === 0 ? (
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
                  onUpdate={updateApplication}
                  onDelete={deleteApplication}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Your data is saved locally in your browser.</p>
      </footer>
    </div>
  )
}
