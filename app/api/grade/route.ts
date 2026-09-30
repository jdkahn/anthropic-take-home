import { setTimeout as sleep } from "node:timers/promises";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { fixtureGrade, fixturesEnabled, GRADE_DELAY_MS } from "@/lib/fixtures";
import { GradeRequestSchema, MAX_GRADE_BYTES } from "@/lib/grading";

// Grades one answer. Returns the grader's raw JSON as text; the browser parses it with
// parseGrade(), like rounds (D57). M3.5: stub mode only. M4 calls Sonnet 5.5 (D97).
export async function POST(request: NextRequest) {
  // Defense in depth, as in /api/round: this route will spend money in M4.
  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // E2E checklist: reject oversized payloads before parsing them.
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_GRADE_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = GradeRequestSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid grade request" }, { status: 400 });

  if (!fixturesEnabled()) {
    return NextResponse.json({ error: "grading not wired yet (M4)" }, { status: 501 });
  }
  await sleep(GRADE_DELAY_MS);
  return new Response(fixtureGrade(parsed.data), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}
