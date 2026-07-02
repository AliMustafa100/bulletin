import { PublicShell } from "@/components/layout/public-shell";

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicShell>{children}</PublicShell>;
}
