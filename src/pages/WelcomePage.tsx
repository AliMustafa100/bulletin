import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function WelcomePage() {
  const { user, loading } = useAuth()

  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <p className="welcome-eyebrow">Bulletin</p>
        <h1>Welcome to your bulletin</h1>
        <p className="welcome-subtitle">
          Track job applications, store tailored resumes and CVs, and keep
          everything synced to your account.
        </p>
        <div className="welcome-actions">
          {!loading && user ? (
            <Link to="/applications" className="btn-primary welcome-cta">
              Open Applications
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn-primary welcome-cta">
                Sign in
              </Link>
              <Link to="/signup" className="btn-ghost welcome-secondary">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
