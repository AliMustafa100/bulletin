"use client";

import { useEffect, useRef, useState } from "react";

import {
  DAY_MS,
  fmtDate,
  loadDailyBoardState,
  saveDailyBoardState,
  SRS_INTERVALS,
  uid,
  type DailyBoardState,
  type DailyBoardTheme,
  type DailyNote,
  type PolishedNote,
} from "@/lib/daily-board";

const SERIF = "Georgia,'Iowan Old Style','Times New Roman',serif";
const SANS = "'Avenir Next','Nunito Sans','Segoe UI',system-ui,sans-serif";

const D = {
  page: "#0B0F17",
  card: "#141A24",
  cardInner: "#0E1420",
  panel: "#121826",
  border: "#232B39",
  borderSoft: "#2A3342",
  ink: "#E6EAF2",
  faint: "#8B93A3",
  fainter: "#7C8494",
  footer: "#5C6472",
  blue: "#3E7BFA",
  blueSoft: "rgba(62,123,250,0.15)",
  blueText: "#6EA8FE",
};

const POSTIT_PALETTE = [
  { bg: "#FFE97F", tape: "#F9C74F" },
  { bg: "#FFB9CC", tape: "#F48FB1" },
  { bg: "#B5EAD7", tape: "#74C69D" },
  { bg: "#BDE0FE", tape: "#79B8F4" },
  { bg: "#E4C1F9", tape: "#C77DFF" },
];
const DARK_ACCENTS = ["#33415E", "#4A3A5E", "#2E4A3E", "#2C4658", "#523848"];
const ROTS = [-2.2, 1.6, -1, 2.4, -1.8, 1.2];

async function polishNote(note: DailyNote): Promise<PolishedNote> {
  const res = await fetch("/api/daily-board/polish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ did: note.did, learned: note.learned }),
  });
  const data = (await res.json()) as { polished?: PolishedNote; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Polish failed");
  if (!data.polished) throw new Error("Unexpected response");
  return data.polished;
}

function Tape({ color }: { color: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: -12,
        left: "50%",
        transform: "translateX(-50%) rotate(-3deg)",
        width: 92,
        height: 26,
        background: color,
        opacity: 0.85,
        borderRadius: 2,
        boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
      }}
    />
  );
}

function SectionLabel({
  children,
  dark,
}: {
  children: React.ReactNode;
  dark: boolean;
}) {
  return (
    <div
      style={{
        fontFamily: SANS,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: 1.2,
        textTransform: "uppercase",
        color: dark ? D.fainter : "rgba(0,0,0,0.5)",
        marginBottom: 3,
      }}
    >
      {children}
    </div>
  );
}

function Bullets({
  list,
  text,
  color,
}: {
  list?: string[];
  text: string;
  color: string;
}) {
  if (list?.length) {
    return (
      <ul
        style={{
          margin: "2px 0 0 16px",
          fontSize: 13.5,
          lineHeight: 1.5,
          color,
          fontFamily: SANS,
        }}
      >
        {list.map((d, i) => (
          <li key={i} style={{ listStyle: "disc", marginBottom: 2 }}>
            {d}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p
      style={{
        fontSize: 13.5,
        lineHeight: 1.5,
        marginTop: 2,
        color,
        whiteSpace: "pre-wrap",
        fontFamily: SANS,
      }}
    >
      {text}
    </p>
  );
}

function NoteCard({
  note,
  index,
  theme,
  onPolish,
  onDelete,
  busy,
}: {
  note: DailyNote;
  index: number;
  theme: DailyBoardTheme;
  onPolish: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const due = note.nextReview != null && note.nextReview <= Date.now();
  const isDark = theme === "dark";

  const wrapStyle = isDark
    ? {
        width: 288,
        minHeight: 280,
        background: D.card,
        border: `1px solid ${D.border}`,
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.3), 0 3px 8px rgba(0,0,0,0.25)",
        padding: "0 18px 14px",
        overflow: "hidden" as const,
        transition: "box-shadow .15s ease, border-color .15s ease",
      }
    : {
        width: 272,
        minHeight: 300,
        background: POSTIT_PALETTE[index % POSTIT_PALETTE.length].bg,
        transform: `rotate(${ROTS[index % ROTS.length]}deg)`,
        boxShadow: "3px 6px 14px rgba(0,0,0,0.35)",
        borderRadius: 3,
        padding: "26px 18px 14px",
        transition: "transform .15s ease",
      };

  const ink = isDark ? D.ink : "rgba(0,0,0,0.8)";
  const faint = isDark ? D.faint : "rgba(0,0,0,0.55)";

  return (
    <div
      className="relative flex shrink-0 flex-col"
      style={wrapStyle}
      onMouseEnter={(e) => {
        if (isDark) {
          e.currentTarget.style.boxShadow =
            "0 2px 4px rgba(0,0,0,0.35), 0 8px 20px rgba(62,123,250,0.12)";
          e.currentTarget.style.borderColor = "#33415E";
        } else {
          e.currentTarget.style.transform = "rotate(0deg) scale(1.03)";
        }
      }}
      onMouseLeave={(e) => {
        if (isDark) {
          e.currentTarget.style.boxShadow =
            "0 1px 2px rgba(0,0,0,0.3), 0 3px 8px rgba(0,0,0,0.25)";
          e.currentTarget.style.borderColor = D.border;
        } else {
          e.currentTarget.style.transform = `rotate(${ROTS[index % ROTS.length]}deg)`;
        }
      }}
    >
      {isDark ? (
        <div
          style={{
            height: 6,
            background: DARK_ACCENTS[index % DARK_ACCENTS.length],
            margin: "0 -18px 12px",
          }}
        />
      ) : (
        <Tape color={POSTIT_PALETTE[index % POSTIT_PALETTE.length].tape} />
      )}

      <div className="mb-1 flex items-center justify-between">
        <div
          style={{
            fontFamily: SANS,
            fontWeight: 600,
            fontSize: 12.5,
            color: faint,
          }}
        >
          {fmtDate(note.date)}
        </div>
        {due ? (
          <span
            style={{
              fontFamily: SANS,
              fontSize: 10.5,
              fontWeight: 700,
              background: isDark ? D.blueSoft : "rgba(0,0,0,0.14)",
              color: isDark ? D.blueText : "rgba(0,0,0,0.65)",
              border: isDark ? "1px solid rgba(62,123,250,0.35)" : "none",
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            ● review due
          </span>
        ) : null}
      </div>

      <div
        style={{
          fontFamily: SERIF,
          fontSize: 18,
          fontWeight: 700,
          color: ink,
          marginBottom: 8,
          lineHeight: 1.25,
        }}
      >
        {note.title || "Untitled day"}
      </div>

      <div className="mb-3">
        <SectionLabel dark={isDark}>Did</SectionLabel>
        <Bullets list={note.didList} text={note.did} color={ink} />
      </div>

      <div className="mb-2 flex-1">
        <SectionLabel dark={isDark}>Learned</SectionLabel>
        <Bullets list={note.learnedList} text={note.learned} color={ink} />
      </div>

      <div
        className="mt-auto flex items-center justify-between pt-2"
        style={{
          borderTop: isDark
            ? `1px solid ${D.border}`
            : "1px dashed rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ fontFamily: SANS, fontSize: 11, color: faint }}>
          {note.nextReview
            ? `next check ${fmtDate(note.nextReview)}`
            : "no memory checks"}
        </div>
        <div className="flex gap-1">
          {!note.polished ? (
            <button
              type="button"
              onClick={() => onPolish(note.id)}
              disabled={busy}
              title="Fix spelling & organize with AI"
              style={{
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: 600,
                background: isDark ? D.blue : "rgba(0,0,0,0.75)",
                color: "#fff",
                borderRadius: 6,
                padding: "3px 9px",
                opacity: busy ? 0.5 : 1,
              }}
            >
              {busy ? "polishing…" : "✨ polish"}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            title="Delete note"
            style={{
              fontFamily: SANS,
              fontSize: 12,
              background: isDark ? "#1E2530" : "rgba(0,0,0,0.12)",
              color: isDark ? D.faint : "inherit",
              border: isDark ? `1px solid ${D.border}` : "none",
              borderRadius: 6,
              padding: "3px 9px",
            }}
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

function MemoryCheck({
  note,
  remaining,
  theme,
  onResult,
  onClose,
}: {
  note: DailyNote;
  remaining: number;
  theme: DailyBoardTheme;
  onResult: (id: string, result: "remembered" | "forgot" | "skip") => void;
  onClose: () => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const isDark = theme === "dark";
  const hint = (note.didList?.[0] ?? note.did ?? "")
    .split(" ")
    .slice(0, 7)
    .join(" ");
  const ink = isDark ? D.ink : "rgba(0,0,0,0.85)";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(5,8,14,0.72)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={
          isDark
            ? {
                width: 400,
                maxWidth: "100%",
                background: D.card,
                border: `1px solid ${D.border}`,
                borderRadius: 14,
                boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
                padding: "24px 26px 20px",
                position: "relative",
              }
            : {
                width: 390,
                maxWidth: "100%",
                background: "#FFE97F",
                borderRadius: 4,
                boxShadow: "0 18px 50px rgba(0,0,0,0.5)",
                transform: "rotate(-1deg)",
                padding: "34px 24px 22px",
                position: "relative",
              }
        }
      >
        {!isDark ? <Tape color="#F9C74F" /> : null}
        <div
          style={{
            fontFamily: SANS,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.2,
            color: isDark ? D.faint : "rgba(0,0,0,0.5)",
          }}
        >
          MEMORY CHECK · {remaining} LEFT
        </div>
        <h2
          style={{
            fontFamily: SERIF,
            fontSize: 21,
            fontWeight: 700,
            margin: "6px 0 10px",
            color: ink,
            lineHeight: 1.3,
          }}
        >
          {fmtDate(note.date)} — do you remember what you learned?
        </h2>
        <p
          style={{
            fontFamily: SANS,
            fontSize: 13.5,
            color: isDark ? "#9AA3B2" : "rgba(0,0,0,0.65)",
            marginBottom: 14,
          }}
        >
          Hint — that day you: <em>&ldquo;{hint}…&rdquo;</em>
        </p>

        {revealed ? (
          <div
            style={{
              background: isDark ? D.cardInner : "rgba(255,255,255,0.6)",
              border: isDark ? `1px solid ${D.border}` : "none",
              borderRadius: 8,
              padding: "10px 14px",
              marginBottom: 16,
              fontSize: 14,
              color: ink,
              fontFamily: SANS,
              lineHeight: 1.5,
            }}
          >
            {note.learnedList?.length ? (
              <ul style={{ marginLeft: 16 }}>
                {note.learnedList.map((l, i) => (
                  <li key={i} style={{ listStyle: "disc", marginBottom: 3 }}>
                    {l}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ whiteSpace: "pre-wrap" }}>{note.learned}</p>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setRevealed(true)}
            className="mb-4 w-full"
            style={{
              fontFamily: SANS,
              background: isDark ? D.blue : "rgba(0,0,0,0.8)",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 0",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Show what I wrote
          </button>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onResult(note.id, "remembered")}
            className="flex-1"
            style={{
              fontFamily: SANS,
              background: "#2E7D52",
              color: "#fff",
              borderRadius: 8,
              padding: "9px 0",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ✓ I remembered
          </button>
          <button
            type="button"
            onClick={() => onResult(note.id, "forgot")}
            className="flex-1"
            style={{
              fontFamily: SANS,
              background: "#B4432F",
              color: "#fff",
              borderRadius: 8,
              padding: "9px 0",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            ✗ Went back over it
          </button>
        </div>
        <button
          type="button"
          onClick={() => onResult(note.id, "skip")}
          className="mt-2 w-full"
          style={{
            fontFamily: SANS,
            background: "transparent",
            color: isDark ? D.fainter : "rgba(0,0,0,0.55)",
            fontSize: 12.5,
            padding: "6px 0",
            textDecoration: "underline",
          }}
        >
          Skip for now (ask me tomorrow)
        </button>
      </div>
    </div>
  );
}

export function DailyBoard() {
  const [state, setState] = useState<DailyBoardState | null>(null);
  const [did, setDid] = useState("");
  const [learned, setLearned] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const boardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setState(loadDailyBoardState());
  }, []);

  const persist = (next: DailyBoardState) => {
    setState(next);
    saveDailyBoardState(next);
  };

  if (state === null) {
    return (
      <div
        className="flex min-h-[70vh] items-center justify-center"
        style={{ background: D.page, fontFamily: SANS, color: D.faint }}
      >
        Unpinning your notes…
      </div>
    );
  }

  const { notes, theme } = state;
  const isDark = theme === "dark";
  const dueNotes = notes.filter(
    (n) => n.nextReview != null && n.nextReview <= Date.now(),
  );
  const currentReview =
    reviewOpen && dueNotes.length > 0 ? dueNotes[0] : null;

  const setTheme = (t: DailyBoardTheme) => persist({ ...state, theme: t });
  const setNotes = (ns: DailyNote[]) => persist({ ...state, notes: ns });

  const addNote = () => {
    if (!did.trim() && !learned.trim()) return;
    const note: DailyNote = {
      id: uid(),
      date: Date.now(),
      did: did.trim(),
      learned: learned.trim(),
      polished: false,
      srsStage: 0,
      nextReview: learned.trim()
        ? Date.now() + SRS_INTERVALS[0] * DAY_MS
        : null,
    };
    setNotes([note, ...notes]);
    setDid("");
    setLearned("");
    setShowForm(false);
    setTimeout(
      () => boardRef.current?.scrollTo({ left: 0, behavior: "smooth" }),
      100,
    );
  };

  const handlePolish = async (id: string) => {
    setBusyId(id);
    setError("");
    try {
      const note = notes.find((n) => n.id === id);
      if (!note) return;
      const out = await polishNote(note);
      setNotes(
        notes.map((n) =>
          n.id === id
            ? {
                ...n,
                title: out.title,
                didList: out.did,
                learnedList: out.learned,
                polished: true,
              }
            : n,
        ),
      );
    } catch {
      setError("The AI polish didn't go through — try again in a moment.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (id: string) =>
    setNotes(notes.filter((n) => n.id !== id));

  const handleReviewResult = (
    id: string,
    result: "remembered" | "forgot" | "skip",
  ) => {
    setNotes(
      notes.map((n) => {
        if (n.id !== id) return n;
        if (result === "remembered") {
          const stage = Math.min(n.srsStage + 1, SRS_INTERVALS.length - 1);
          return {
            ...n,
            srsStage: stage,
            nextReview: Date.now() + SRS_INTERVALS[stage] * DAY_MS,
          };
        }
        if (result === "forgot") {
          return {
            ...n,
            srsStage: 0,
            nextReview: Date.now() + SRS_INTERVALS[0] * DAY_MS,
          };
        }
        return { ...n, nextReview: Date.now() + DAY_MS };
      }),
    );
    if (dueNotes.length <= 1) setReviewOpen(false);
  };

  const pageBg = isDark
    ? D.page
    : "radial-gradient(circle at 20% 10%, #45565E 0%, #37444B 55%, #2C373D 100%)";
  const headText = isDark ? D.ink : "#F5EFDD";
  const subText = isDark ? D.faint : "rgba(245,239,221,0.55)";
  const panelBg = isDark ? D.panel : "rgba(245,239,221,0.08)";
  const panelBorder = isDark
    ? `1px solid ${D.border}`
    : "1px solid rgba(245,239,221,0.15)";
  const inputBg = isDark ? D.cardInner : "rgba(0,0,0,0.25)";
  const inputText = isDark ? D.ink : "#F5EFDD";
  const inputBorder = isDark
    ? `1px solid ${D.border}`
    : "1px solid rgba(245,239,221,0.15)";

  return (
    <div
      className="flex min-h-[70vh] w-full flex-col rounded-xl overflow-hidden"
      style={{ background: pageBg, fontFamily: SANS }}
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6 pb-3">
        <div>
          <h1
            style={{
              color: headText,
              fontSize: 27,
              fontWeight: 700,
              fontFamily: SERIF,
              letterSpacing: 0.2,
            }}
          >
            The Daily Board
          </h1>
          <p style={{ color: subText, fontSize: 13.5 }}>
            Pin what you did &amp; learned. I&apos;ll quiz you before you forget
            it.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex overflow-hidden rounded-full"
            style={{
              border: isDark
                ? `1px solid ${D.border}`
                : "1px solid rgba(245,239,221,0.25)",
            }}
          >
            {(
              [
                { id: "postit" as const, label: "🗒️ Post-it" },
                { id: "dark" as const, label: "🌙 Dark" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: "8px 13px",
                  background:
                    theme === t.id
                      ? isDark
                        ? D.blue
                        : "#F5EFDD"
                      : "transparent",
                  color:
                    theme === t.id
                      ? isDark
                        ? "#FFFFFF"
                        : "#2C373D"
                      : isDark
                        ? D.faint
                        : "rgba(245,239,221,0.7)",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {dueNotes.length > 0 ? (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              style={{
                background: isDark ? D.blueSoft : "#FFE97F",
                color: isDark ? D.blueText : "#2C2C2C",
                borderRadius: 999,
                padding: "9px 16px",
                fontWeight: 700,
                fontSize: 13.5,
                boxShadow: isDark ? "none" : "0 3px 10px rgba(0,0,0,0.35)",
                border: isDark ? "1px solid rgba(62,123,250,0.35)" : "none",
              }}
            >
              🧠 Memory check ({dueNotes.length})
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            style={{
              background: showForm
                ? isDark
                  ? "#1E2530"
                  : "rgba(245,239,221,0.15)"
                : isDark
                  ? D.blue
                  : "#79B8F4",
              color: showForm
                ? isDark
                  ? D.faint
                  : "#F5EFDD"
                : isDark
                  ? "#fff"
                  : "#15242E",
              border: showForm && isDark ? `1px solid ${D.border}` : "none",
              borderRadius: 999,
              padding: "9px 16px",
              fontWeight: 700,
              fontSize: 13.5,
              boxShadow: isDark ? "none" : "0 3px 10px rgba(0,0,0,0.35)",
            }}
          >
            {showForm ? "Close" : "+ New daily"}
          </button>
        </div>
      </header>

      {error ? (
        <div
          className="mx-6 mb-2 rounded-lg px-4 py-2"
          style={{ background: "#B4432F", color: "#fff", fontSize: 13 }}
        >
          {error}
        </div>
      ) : null}

      {showForm ? (
        <div
          className="mx-6 mb-4 rounded-xl p-4"
          style={{ background: panelBg, border: panelBorder }}
        >
          <label
            style={{
              color: headText,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            WHAT I DID TODAY
          </label>
          <textarea
            value={did}
            onChange={(e) => setDid(e.target.value)}
            rows={3}
            placeholder="Type freely — typos welcome, the AI will tidy it up…"
            className="mt-1 mb-3 w-full rounded-lg p-3"
            style={{
              background: inputBg,
              color: inputText,
              fontSize: 14,
              outline: "none",
              border: inputBorder,
              fontFamily: SANS,
            }}
          />
          <label
            style={{
              color: headText,
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            WHAT I LEARNED
          </label>
          <textarea
            value={learned}
            onChange={(e) => setLearned(e.target.value)}
            rows={3}
            placeholder="This becomes your flashcard for memory checks."
            className="mt-1 mb-3 w-full rounded-lg p-3"
            style={{
              background: inputBg,
              color: inputText,
              fontSize: 14,
              outline: "none",
              border: inputBorder,
              fontFamily: SANS,
            }}
          />
          <button
            type="button"
            onClick={addNote}
            disabled={!did.trim() && !learned.trim()}
            style={{
              background: isDark ? D.blue : "#FFE97F",
              color: isDark ? "#fff" : "#2C2C2C",
              borderRadius: 8,
              padding: "10px 20px",
              fontWeight: 700,
              fontSize: 14,
              opacity: !did.trim() && !learned.trim() ? 0.4 : 1,
            }}
          >
            📌 Pin it to the board
          </button>
        </div>
      ) : null}

      <main
        ref={boardRef}
        className="flex flex-1 items-start gap-7 overflow-x-auto px-8 pt-8 pb-10"
        style={{ scrollbarWidth: "thin" }}
      >
        {notes.length === 0 ? (
          <div
            className="flex shrink-0 flex-col items-center justify-center"
            style={{
              width: 280,
              minHeight: 290,
              border: isDark
                ? `2px dashed ${D.borderSoft}`
                : "2px dashed rgba(245,239,221,0.3)",
              borderRadius: 12,
              color: isDark ? D.faint : "rgba(245,239,221,0.55)",
              fontSize: 14,
              textAlign: "center",
              padding: 20,
              lineHeight: 1.6,
            }}
          >
            <div style={{ fontSize: 34, marginBottom: 8 }}>📌</div>
            The board is empty.
            <br />
            Hit &quot;+ New daily&quot; to pin your first note.
          </div>
        ) : (
          notes.map((n, i) => (
            <NoteCard
              key={n.id}
              note={n}
              index={i}
              theme={theme}
              busy={busyId === n.id}
              onPolish={handlePolish}
              onDelete={handleDelete}
            />
          ))
        )}
      </main>

      <footer
        className="px-6 pb-4"
        style={{
          color: isDark ? D.footer : "rgba(245,239,221,0.35)",
          fontSize: 11.5,
        }}
      >
        ✨ polish = AI fixes spelling &amp; sorts your note · 🧠 checks follow
        the forgetting curve: 1 → 3 → 7 → 14 → 30 → 60 days
      </footer>

      {currentReview ? (
        <MemoryCheck
          note={currentReview}
          remaining={dueNotes.length}
          theme={theme}
          onResult={handleReviewResult}
          onClose={() => setReviewOpen(false)}
        />
      ) : null}
    </div>
  );
}
