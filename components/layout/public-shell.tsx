import { BulletinHeader } from "./bulletin-header";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-1 flex-col">
      <BulletinHeader />
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
