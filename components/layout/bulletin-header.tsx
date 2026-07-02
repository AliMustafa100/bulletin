import Link from "next/link";

export function BulletinHeader() {
  return (
    <header className="bg-transparent">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-white transition-opacity hover:opacity-90"
        >
          Bulletin
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/signin"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:px-4"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:px-4"
          >
            Demo
          </Link>
          <Link
            href="/dashboard/applications"
            className="rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 sm:px-4"
          >
            Tracker
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-white/40 px-3 py-2 text-sm font-semibold text-white transition-colors hover:border-white/70 hover:bg-white/[0.07] sm:px-4"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
