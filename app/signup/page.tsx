import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const fieldClass =
  "h-10 min-h-10 rounded-lg border-[#e5e2dc] bg-[#F2F0EB] px-3.5 text-sm text-neutral-900 shadow-none !bg-[#F2F0EB] placeholder:text-neutral-400 focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-300/60 dark:!bg-[#F2F0EB]";

export default function SignupPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-20">
      <div className="surface-pop w-full max-w-md px-8 py-9 sm:px-10 sm:py-10">
        <div className="mb-7 space-y-2 text-center sm:mb-8">
          <h1 className="text-3xl font-medium leading-snug tracking-tight text-neutral-900">
            Create an account
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-neutral-500">
            Add your details below. You can wire this to real auth whenever
            you&apos;re ready.
          </p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="signup-email"
              className="text-sm font-semibold text-neutral-800"
            >
              Email address
            </Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className={fieldClass}
              required
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="signup-password"
              className="text-sm font-semibold text-neutral-800"
            >
              Password
            </Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              className={fieldClass}
              required
            />
          </div>
          <Button
            type="button"
            className="h-11 w-full rounded-lg bg-[#374151] text-sm font-semibold text-white shadow-sm hover:bg-[#4b5563]"
          >
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-[13px] text-neutral-500">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-neutral-800 underline decoration-neutral-400/90 underline-offset-2 hover:text-neutral-950"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
