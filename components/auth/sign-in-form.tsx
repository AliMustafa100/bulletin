"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-10 min-h-10 rounded-lg border-[#e5e2dc] bg-[#F2F0EB] px-3.5 text-sm text-neutral-900 shadow-none !bg-[#F2F0EB] placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-300/60 dark:!bg-[#F2F0EB] dark:focus-visible:ring-neutral-300/60";

export function SignInForm() {
  const router = useRouter();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    router.push("/dashboard");
  }

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-neutral-800"
          >
            Email address
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            className={cn(fieldClass)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-4">
            <Label
              htmlFor="password"
              className="text-sm font-semibold text-neutral-800"
            >
              Password
            </Label>
            <button
              type="button"
              className="text-[13px] text-neutral-500 underline decoration-neutral-400/80 underline-offset-2 transition-colors hover:text-neutral-700"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className={cn(fieldClass)}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 pt-0.5">
          <input
            type="checkbox"
            name="remember"
            className="mt-0.5 size-4 shrink-0 rounded border-neutral-300 bg-white text-neutral-900 accent-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2"
          />
          <span className="text-[13px] leading-snug text-neutral-500">
            Keep me signed in on this device
          </span>
        </label>

        <Button
          type="submit"
          size="lg"
          className="h-11 w-full rounded-lg bg-[#374151] text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4b5563] focus-visible:ring-neutral-400"
        >
          Sign In
        </Button>
      </form>

      <p className="text-center text-[13px] text-neutral-500">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-neutral-800 underline decoration-neutral-400/90 underline-offset-2 transition-colors hover:text-neutral-950"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
