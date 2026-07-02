import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Settings
        </h1>
        <p className="mt-2 text-neutral-400">
          Account, API keys, and appearance can live here later.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Local-only for now</CardTitle>
          <CardDescription>
            No secrets in the browser yet. When you add auth or env-backed
            config, this page is the right home for it.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
