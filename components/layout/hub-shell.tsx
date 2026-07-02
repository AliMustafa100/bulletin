import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HubNav, HubNavHorizontal } from "@/components/layout/hub-nav";
import { cn } from "@/lib/utils";

function BackToHomeLink({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-md px-0.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <ArrowLeft className="size-4 shrink-0" aria-hidden />
      Back to home
    </Link>
  );
}

export function HubShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="bg-sidebar text-sidebar-foreground hidden w-56 shrink-0 flex-col border-r border-sidebar-border p-5 md:flex">
        <Link
          href="/dashboard"
          className="h-serif mb-10 px-0.5 text-lg font-medium tracking-tight text-foreground transition-opacity hover:opacity-75"
        >
          Bulletin
        </Link>
        <HubNav />
        <BackToHomeLink className="mt-8 border-t border-sidebar-border pt-4" />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="bg-transparent px-4 py-3 md:hidden">
          <Link
            href="/dashboard"
            className="h-serif mb-2 block text-lg font-medium tracking-tight text-foreground transition-opacity hover:opacity-75"
          >
            Bulletin
          </Link>
          <HubNavHorizontal />
          <BackToHomeLink className="mt-4 w-full border-t border-border pt-3" />
        </header>

        <main className="flex-1 bg-background p-4 md:p-10">{children}</main>
      </div>
    </div>
  );
}
