"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  displayTitle,
  loadApplications,
  type JobApplication,
  type JobCategorization,
  saveApplications,
} from "@/lib/job-applications";

const textareaClass =
  "min-h-[180px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs text-foreground">
      {children}
    </span>
  );
}

function CategorizationSummary({ c }: { c: JobCategorization }) {
  return (
    <div className="flex flex-wrap gap-2">
      {c.company ? <Chip>{c.company}</Chip> : null}
      {c.roleTitle ? <Chip>{c.roleTitle}</Chip> : null}
      {c.location ? <Chip>{c.location}</Chip> : null}
      {c.workMode !== "unknown" ? <Chip>{c.workMode}</Chip> : null}
      {c.employmentType ? <Chip>{c.employmentType}</Chip> : null}
      {c.seniority ? <Chip>{c.seniority}</Chip> : null}
      {c.skills.map((s) => (
        <Chip key={s}>{s}</Chip>
      ))}
    </div>
  );
}

export function ApplicationsTracker() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  const [rawListing, setRawListing] = useState("");
  const [applied, setApplied] = useState(false);
  const [dateApplied, setDateApplied] = useState("");
  const [resumeUsed, setResumeUsed] = useState("");
  const [coverLetterRemix, setCoverLetterRemix] = useState("");
  const [categorization, setCategorization] =
    useState<JobCategorization | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    setApplications(loadApplications());
    setHydrated(true);
  }, []);

  useEffect(() => {
    void fetch("/api/applications/categorize")
      .then((r) => r.json())
      .then((d: { configured?: boolean }) =>
        setAiConfigured(Boolean(d.configured)),
      )
      .catch(() => setAiConfigured(false));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveApplications(applications);
  }, [applications, hydrated]);

  const sorted = useMemo(
    () =>
      [...applications].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [applications],
  );

  const runCategorize = useCallback(async () => {
    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/applications/categorize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawListing }),
      });
      const data = (await res.json()) as {
        categorization?: JobCategorization;
        error?: string;
        detail?: string;
      };
      if (!res.ok) {
        setAiError(data.error ?? "Request failed");
        return;
      }
      if (data.categorization) setCategorization(data.categorization);
    } catch {
      setAiError("Network error");
    } finally {
      setAiLoading(false);
    }
  }, [rawListing]);

  const addApplication = useCallback(() => {
    const trimmed = rawListing.trim();
    if (!trimmed) return;
    const next: JobApplication = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      rawListing: trimmed,
      applied,
      dateApplied,
      resumeUsed: resumeUsed.trim(),
      coverLetterRemix: coverLetterRemix.trim(),
      categorization,
    };
    setApplications((prev) => [next, ...prev]);
    setRawListing("");
    setApplied(false);
    setDateApplied("");
    setResumeUsed("");
    setCoverLetterRemix("");
    setCategorization(null);
    setAiError(null);
  }, [
    rawListing,
    applied,
    dateApplied,
    resumeUsed,
    coverLetterRemix,
    categorization,
  ]);

  const remove = useCallback((id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Tracker
        </h1>
        <p className="mt-2 text-neutral-400">
          Paste a job listing, optionally auto-fill tags with AI, then record
          when you applied and which materials you used. Data stays in this
          browser (local storage).
        </p>
      </div>

      <Card className="surface-pop border-0 shadow-none">
        <CardHeader>
          <CardTitle>New application</CardTitle>
          <CardDescription>
            {aiConfigured === false ? (
              <span className="text-amber-800">
                Add{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  OPENAI_API_KEY
                </code>{" "}
                to{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  .env.local
                </code>{" "}
                and restart{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  next dev
                </code>{" "}
                to enable paste-to-categorize. Your key never ships to the
                browser.
              </span>
            ) : (
              "Paste the listing below, run AI extraction if you want structured tags, then fill the rest and save."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="listing">Job listing (paste)</Label>
            <textarea
              id="listing"
              className={textareaClass}
              value={rawListing}
              onChange={(e) => setRawListing(e.target.value)}
              placeholder="Paste the full job ad here…"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={aiLoading || rawListing.trim().length < 20}
              onClick={() => void runCategorize()}
            >
              {aiLoading ? "Extracting…" : "Auto-categorize with AI"}
            </Button>
            {categorization ? (
              <span className="text-xs text-muted-foreground">
                Tags updated below — edit nothing here; re-run if the paste
                changes.
              </span>
            ) : null}
          </div>
          {aiError ? (
            <p className="text-sm text-destructive">{aiError}</p>
          ) : null}

          {categorization ? (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
              {categorization.summary ? (
                <p className="text-sm text-foreground">{categorization.summary}</p>
              ) : null}
              <CategorizationSummary c={categorization} />
            </div>
          ) : null}

          <Separator />

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={applied}
                onChange={(e) => setApplied(e.target.checked)}
                className={cn(
                  "size-4 rounded border-input accent-primary",
                  "focus-visible:ring-3 focus-visible:ring-ring/50",
                )}
              />
              I applied
            </label>
            <div className="space-y-2 sm:col-span-1">
              <Label htmlFor="date">Date applied</Label>
              <Input
                id="date"
                type="date"
                value={dateApplied}
                onChange={(e) => setDateApplied(e.target.value)}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="resume">Resume used</Label>
              <Input
                id="resume"
                value={resumeUsed}
                onChange={(e) => setResumeUsed(e.target.value)}
                placeholder="e.g. software-resume-v3.pdf or Google Doc name"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="cover">Cover letter (template / remix notes)</Label>
              <textarea
                id="cover"
                className={cn(textareaClass, "min-h-[100px]")}
                value={coverLetterRemix}
                onChange={(e) => setCoverLetterRemix(e.target.value)}
                placeholder="Which base template, what you changed for this company, tone, etc."
              />
            </div>
          </div>

          <Button
            type="button"
            onClick={addApplication}
            disabled={!rawListing.trim()}
          >
            Save to tracker
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-medium text-white">Saved</h2>
        {!hydrated ? (
          <p className="text-sm text-neutral-500">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-neutral-500">
            No applications yet — save one above.
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((app) => (
              <li key={app.id}>
                <Card className="surface-pop border-0 shadow-none">
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="min-w-0 space-y-1">
                      <CardTitle className="truncate text-base">
                        {displayTitle(app)}
                      </CardTitle>
                      <CardDescription className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                        {app.dateApplied ? (
                          <span>Applied {app.dateApplied}</span>
                        ) : (
                          <span className="text-muted-foreground">
                            No date set
                          </span>
                        )}
                        <span>{app.applied ? "Marked applied" : "Not applied"}</span>
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label="Delete"
                      onClick={() => remove(app.id)}
                    >
                      <Trash2 />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {app.categorization ? (
                      <CategorizationSummary c={app.categorization} />
                    ) : null}
                    {app.resumeUsed ? (
                      <p>
                        <span className="font-medium text-foreground">
                          Resume:{" "}
                        </span>
                        {app.resumeUsed}
                      </p>
                    ) : null}
                    {app.coverLetterRemix ? (
                      <div>
                        <p className="font-medium text-foreground">
                          Cover letter notes
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
                          {app.coverLetterRemix}
                        </p>
                      </div>
                    ) : null}
                    <details className="group">
                      <summary className="cursor-pointer text-xs font-medium text-muted-foreground hover:text-foreground">
                        Full listing
                      </summary>
                      <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/40 p-3 text-xs text-foreground">
                        {app.rawListing}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
