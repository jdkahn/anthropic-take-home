import { setTimeout as sleep } from "node:timers/promises";
import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { gradeModel, gradeReply } from "@/lib/claude";
import { fixtureGrade, fixturesEnabled, GRADE_DELAY_MS } from "@/lib/fixtures";
import { GradeRequestSchema, MAX_GRADE_BYTES } from "@/lib/grading";
import { buildGradeParams } from "@/lib/prompts/grade";

// Grades one answer. Returns the grader's raw JSON as text; the browser parses it with
// parseGrade(), like rounds (D57). Sonnet 5.5 by default (D97); stub mode replays M2 grades.
export async function POST(request: NextRequest) {
  // Defense in depth, as in /api/round: this route spends money.
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

  const headers = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };
  if (fixturesEnabled()) {
    await sleep(GRADE_DELAY_MS);
    return new Response(fixtureGrade(parsed.data), { headers });
  }

  try {
    const text = await gradeReply(buildGradeParams(parsed.data, gradeModel()), request.signal);
    return new Response(text, { headers });
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? err.status : undefined;
    console.error("grade failed", { status, err });
    // Same mapping as /api/round: 429 / 529 → 503 "busy"; anything else → 502.
    const busy = status === 429 || status === 529;
    return NextResponse.json({ error: busy ? "busy" : "upstream" }, { status: busy ? 503 : 502 });
  }
}
