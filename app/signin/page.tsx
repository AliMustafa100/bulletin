import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12 sm:px-8 sm:py-20">
      <div className="surface-pop sign-in-card w-full max-w-md px-8 py-9 sm:px-10 sm:py-10">
        <div className="mb-7 space-y-2 text-center sm:mb-8">
          <h1 className="text-3xl font-medium leading-snug tracking-tight text-neutral-900">
            Sign in
          </h1>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-neutral-500">
            Use the email you joined with to access your membership.
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
