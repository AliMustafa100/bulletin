import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const shortcuts = [
  {
    title: "Mail",
    description: "Your inbox",
    href: "https://mail.google.com",
    external: true,
  },
  {
    title: "Calendar",
    description: "Schedule",
    href: "https://calendar.google.com",
    external: true,
  },
  {
    title: "Daily Board",
    description: "Journal notes & spaced memory checks",
    href: "/dashboard/daily-board",
    external: false,
  },
  {
    title: "Links",
    description: "Bookmarks you’ll add here",
    href: "/dashboard/links",
    external: false,
  },
  {
    title: "Settings",
    description: "Theme & preferences later",
    href: "/dashboard/settings",
    external: false,
  },
] as const;

export default function DashboardHomePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="h-serif text-3xl font-medium tracking-tight text-white md:text-4xl">
          Welcome home
        </h1>
        <p className="mt-2 text-pretty text-neutral-400">
          Your Bulletin dashboard. Replace the shortcuts below with the tools
          and pages you use every day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map((item) => (
          <Card
            key={item.title}
            className="card-hover border-0 bg-card text-card-foreground shadow-[0_4px_6px_-1px_rgba(0,0,0,0.2),0_20px_50px_-12px_rgba(0,0,0,0.55)]"
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
              <Link
                href={item.href}
                className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                Open
              </Link>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
