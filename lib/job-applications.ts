export type JobCategorization = {
  company: string | null;
  roleTitle: string | null;
  location: string | null;
  workMode: "remote" | "hybrid" | "onsite" | "unknown";
  employmentType: string | null;
  seniority: string | null;
  skills: string[];
  summary: string | null;
};

export type JobApplication = {
  id: string;
  createdAt: string;
  rawListing: string;
  applied: boolean;
  dateApplied: string;
  resumeUsed: string;
  coverLetterRemix: string;
  categorization: JobCategorization | null;
};

const STORAGE_KEY = "hub-job-applications-v1";

export function loadApplications(): JobApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isJobApplication);
  } catch {
    return [];
  }
}

export function saveApplications(apps: JobApplication[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function isJobApplication(v: unknown): v is JobApplication {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.createdAt === "string" &&
    typeof o.rawListing === "string" &&
    typeof o.applied === "boolean" &&
    typeof o.dateApplied === "string" &&
    typeof o.resumeUsed === "string" &&
    typeof o.coverLetterRemix === "string"
  );
}

export function displayTitle(app: JobApplication): string {
  const c = app.categorization;
  if (c?.company && c?.roleTitle) return `${c.company} — ${c.roleTitle}`;
  if (c?.roleTitle) return c.roleTitle;
  if (c?.company) return c.company;
  const line = app.rawListing.trim().split(/\r?\n/).find(Boolean) ?? "";
  if (line.length > 72) return `${line.slice(0, 69)}…`;
  return line || "Untitled listing";
}
