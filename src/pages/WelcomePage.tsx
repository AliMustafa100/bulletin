import { Link } from 'react-router-dom'

export function WelcomePage() {
  return (
    <div className="welcome-page">
      <div className="welcome-content">
        <p className="welcome-eyebrow">Bulletin</p>
        <h1>Welcome to your bulletin</h1>
        <p className="welcome-subtitle">
          Your personal space to stay organized — job applications, documents,
          and more as you build it out.
        </p>
        <Link to="/applications" className="btn-primary welcome-cta">
          Get Started
        </Link>
      </div>
    </div>
  )
}
