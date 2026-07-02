export type DailyBoardTheme = "postit" | "dark";

export type DailyNote = {
  id: string;
  date: number;
  did: string;
  learned: string;
  title?: string;
  didList?: string[];
  learnedList?: string[];
  polished: boolean;
  srsStage: number;
  nextReview: number | null;
};

export type DailyBoardState = {
  notes: DailyNote[];
  theme: DailyBoardTheme;
};

export type PolishedNote = {
  title: string;
  did: string[];
  learned: string[];
};

export const DAILY_BOARD_STORE_KEY = "dailyboard-v2";
export const DAILY_BOARD_LEGACY_NOTES_KEY = "dailyboard-notes-v1";
export const SRS_INTERVALS = [1, 3, 7, 14, 30, 60] as const;
export const DAY_MS = 24 * 60 * 60 * 1000;

export function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function fmtDate(iso: number): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function loadDailyBoardState(): DailyBoardState {
  if (typeof window === "undefined") {
    return { notes: [], theme: "postit" };
  }

  try {
    const raw = localStorage.getItem(DAILY_BOARD_STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const theme =
        parsed.theme === "notion" || parsed.theme === "dark"
          ? "dark"
          : "postit";
      return normalizeState({
        notes: Array.isArray(parsed.notes) ? parsed.notes : [],
        theme,
      });
    }
  } catch {
    /* fall through */
  }

  try {
    const legacy = localStorage.getItem(DAILY_BOARD_LEGACY_NOTES_KEY);
    if (legacy) {
      return { notes: JSON.parse(legacy) as DailyNote[], theme: "postit" };
    }
  } catch {
    /* fall through */
  }

  return { notes: [], theme: "postit" };
}

export function saveDailyBoardState(state: DailyBoardState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(DAILY_BOARD_STORE_KEY, JSON.stringify(state));
}

function normalizeState(state: DailyBoardState): DailyBoardState {
  return {
    theme: state.theme === "dark" ? "dark" : "postit",
    notes: Array.isArray(state.notes) ? state.notes.filter(isDailyNote) : [],
  };
}

function isDailyNote(v: unknown): v is DailyNote {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.date === "number" &&
    typeof o.did === "string" &&
    typeof o.learned === "string" &&
    typeof o.polished === "boolean" &&
    typeof o.srsStage === "number" &&
    (o.nextReview === null || typeof o.nextReview === "number")
  );
}

export function normalizePolishedNote(data: unknown): PolishedNote {
  const o = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const did = Array.isArray(o.did)
    ? o.did.filter((s): s is string => typeof s === "string")
    : [];
  const learned = Array.isArray(o.learned)
    ? o.learned.filter((s): s is string => typeof s === "string")
    : [];
  const title =
    typeof o.title === "string" && o.title.trim()
      ? o.title.trim()
      : "Untitled day";
  return { title, did, learned };
}
