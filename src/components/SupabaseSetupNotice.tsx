export function SupabaseSetupNotice() {
  return (
    <div className="supabase-setup">
      <p className="auth-error">
        Supabase is not configured for this deployment.
      </p>
      <div className="setup-steps">
        <p>
          <strong>On Vercel</strong> (most likely why you see this after deploy):
        </p>
        <ol>
          <li>
            Vercel → your project → <strong>Settings → Environment Variables</strong>
          </li>
          <li>
            Add <code>VITE_SUPABASE_URL</code> and{' '}
            <code>VITE_SUPABASE_ANON_KEY</code> (copy from Supabase → Project
            Settings → API)
          </li>
          <li>
            Enable for <strong>Production</strong> and <strong>Preview</strong>
          </li>
          <li>
            <strong>Redeploy</strong> — Vite only reads these at build time, not
            when you visit the site
          </li>
        </ol>
        <p>
          <strong>Locally:</strong> put the same values in a <code>.env</code>{' '}
          file in the project root, then restart <code>npm run dev</code>.
        </p>
      </div>
    </div>
  )
}
