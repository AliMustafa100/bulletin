"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/daily-board", label: "Daily Board" },
  { href: "/dashboard/applications", label: "Tracker" },
  { href: "/dashboard/links", label: "Links" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export function HubNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function HubNavHorizontal({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard" || pathname === "/dashboard/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-colors",
              active
                ? "border-border bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
