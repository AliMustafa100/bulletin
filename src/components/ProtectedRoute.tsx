import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SupabaseSetupNotice } from './SupabaseSetupNotice'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, configured } = useAuth()
  const location = useLocation()

  if (!configured) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="welcome-eyebrow">Bulletin</p>
          <h1>Supabase not configured</h1>
          <SupabaseSetupNotice />
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-loading">
          <p>Loading your account…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}
