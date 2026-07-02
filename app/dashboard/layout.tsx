import { HubShell } from "@/components/layout/hub-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HubShell>{children}</HubShell>;
}
