import type { Metadata } from "next";
import { PublicShell } from "@/components/layout/public-shell";

export const metadata: Metadata = {
  title: "Bulletin — Ideas and projects in one place",
  description:
    "A calm workspace to manage multiple ideas and projects at once.",
};

export default function HomePage() {
  return (
    <PublicShell>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-10 py-12 sm:px-8 sm:py-12">
        <div className="mx-auto w-full max-w-3xl -translate-y-6 text-center sm:-translate-y-20">
          <p className="text-lg font-medium tracking-wide text-white sm:text-xl">
            Welcome to Bulletin
          </p>
          <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-tight text-white sm:mt-6 sm:text-6xl sm:leading-[1.06]">
            One place for your ideas and projects
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-white sm:mt-10 sm:text-xl sm:leading-relaxed">
            Bulletin is a workspace where you can organize multiple ideas and
            projects side by side—clear, focused, and ready to grow as you add
            more tools and workflows.
          </p>
        </div>
      </div>
    </PublicShell>
  );
}
