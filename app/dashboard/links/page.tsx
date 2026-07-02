import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LinksPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Links
        </h1>
        <p className="mt-2 text-neutral-400">
          Add your bookmarks here next — we can wire this to a JSON file, a
          database, or a CMS when you’re ready.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Empty state on purpose. Tell me how you want to store links (file in
            repo, Supabase, Notion, etc.) and we’ll plug it in.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
