import { useAuth } from '../contexts/AuthContext'

export function UserMenu() {
  const { user, signOut } = useAuth()

  if (!user) return null

  const label =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'Account'

  return (
    <div className="user-menu">
      <span className="user-menu-label" title={user.email ?? undefined}>
        {label}
      </span>
      <button type="button" className="btn-ghost btn-sm" onClick={() => signOut()}>
        Sign out
      </button>
    </div>
  )
}
