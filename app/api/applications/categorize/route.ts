import { NextResponse } from "next/server";

import type { JobCategorization } from "@/lib/job-applications";

const SYSTEM = `You extract structured job-posting fields from pasted text. Return ONLY valid JSON with this exact shape (no markdown, no prose):
{
  "company": string or null,
  "roleTitle": string or null,
  "location": string or null,
  "workMode": "remote" | "hybrid" | "onsite" | "unknown",
  "employmentType": string or null,
  "seniority": string or null,
  "skills": string[],
  "summary": string or null
}
Rules:
- If unsure, use null or "unknown" for workMode.
- skills: up to 10 short items (languages, frameworks, tools) inferred from the post.
- summary: one sentence under 200 characters describing the role.`;

function normalizeCategorization(data: unknown): JobCategorization {
  const o = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;
  const wm = o.workMode;
  const workMode =
    wm === "remote" || wm === "hybrid" || wm === "onsite" || wm === "unknown"
      ? wm
      : "unknown";
  const skills = Array.isArray(o.skills)
    ? o.skills.filter((s): s is string => typeof s === "string").slice(0, 10)
    : [];
  return {
    company: typeof o.company === "string" ? o.company : null,
    roleTitle: typeof o.roleTitle === "string" ? o.roleTitle : null,
    location: typeof o.location === "string" ? o.location : null,
    workMode,
    employmentType:
      typeof o.employmentType === "string" ? o.employmentType : null,
    seniority: typeof o.seniority === "string" ? o.seniority : null,
    skills,
    summary: typeof o.summary === "string" ? o.summary : null,
  };
}

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

  let body: { text?: string };
  try {
    body = (await request.json()) as { text?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (text.length < 20) {
    return NextResponse.json(
      { error: "Paste at least a few lines of the job listing." },
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
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Job listing text:\n\n${text.slice(0, 24000)}`,
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

  const categorization = normalizeCategorization(parsed);
  return NextResponse.json({ categorization });
}
