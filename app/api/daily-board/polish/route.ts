import { NextResponse } from "next/server";

import { normalizePolishedNote } from "@/lib/daily-board";

const SYSTEM = `You are a gentle journal editor. Fix spelling and grammar, organize "what I did" into short clear bullet points, organize "what I learned" into short clear bullet points, and write a one-line title (max 6 words) capturing the day.

Return ONLY valid JSON with this exact shape (no markdown, no prose):
{"title": "...", "did": ["..."], "learned": ["..."]}`;

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}

export async function POST(request: Request) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      {
        error:
          "Missing OPENAI_API_KEY on the server. Add it to .env.local and restart dev.",
      },
      { status: 503 },
    );
  }

  let body: { did?: string; learned?: string };
  try {
    body = (await request.json()) as { did?: string; learned?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const did = typeof body.did === "string" ? body.did.trim() : "";
  const learned = typeof body.learned === "string" ? body.learned.trim() : "";
  if (!did && !learned) {
    return NextResponse.json(
      { error: "Nothing to polish — add what you did or learned." },
      { status: 400 },
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `WHAT I DID:\n${did || "(empty)"}\n\nWHAT I LEARNED:\n${learned || "(empty)"}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json(
      { error: `OpenAI error (${res.status})`, detail: errText.slice(0, 500) },
      { status: 502 },
    );
  }

  const completion = (await res.json()) as {
    choices?: Array<{ message?: { content?: string | null } }>;
  };
  const raw = completion.choices?.[0]?.message?.content;
  if (!raw || typeof raw !== "string") {
    return NextResponse.json(
      { error: "Unexpected response from OpenAI" },
      { status: 502 },
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json(
      { error: "Model did not return valid JSON" },
      { status: 502 },
    );
  }

  return NextResponse.json({ polished: normalizePolishedNote(parsed) });
}
