import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import august from "@/fixtures/rounds/august-rung1.json";
import { createSessionValue } from "@/lib/auth";
import { parseGrade } from "@/lib/grade";
import { MAX_LEARNER_CHARS } from "@/lib/grading";
import { POST } from "./route";

// No real delay in tests.
vi.mock("node:timers/promises", () => ({ setTimeout: () => Promise.resolve() }));

const correct = august.options.find((o) => o.mistake === null)!.text;
const wrong = august.options.find((o) => o.mistake !== null)!.text;

function grade(body: unknown, { session = true } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session) headers.cookie = `session=${createSessionValue()}`;
  return POST(
    new NextRequest("http://localhost/api/grade", {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const request = (over: object = {}) => ({ round: august, pick: correct, answer: null, why: "Last August fell too.", ...over });

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
  vi.stubEnv("USE_FIXTURES", "1");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/grade", () => {
  it("re-checks the session itself", async () => {
    expect((await grade(request(), { session: false })).status).toBe(401);
  });

  it("rejects oversized, malformed, and invalid requests before grading", async () => {
    expect((await grade(JSON.stringify({ ...request(), pad: "x".repeat(40_000) }))).status).toBe(413);
    expect((await grade("{not json")).status).toBe(400);
    expect((await grade(request({ why: "x".repeat(MAX_LEARNER_CHARS + 1) }))).status).toBe(400);
    expect((await grade(request({ round: { ...august, options: august.options.slice(0, 3) } }))).status).toBe(400);
  });

  it("stub mode: a correct pick gets a sound grade, a wrong pick the miss", async () => {
    const right = parseGrade(await (await grade(request())).text(), 1);
    expect(right).toMatchObject({ kind: "graded", grade: { why_sound: true } });
    const miss = parseGrade(await (await grade(request({ pick: wrong }))).text(), 1);
    expect(miss).toMatchObject({ kind: "graded", grade: { why_sound: false } });
  });

  it("stub mode: /miss forces the weak-why grade on a correct pick", async () => {
    const res = parseGrade(await (await grade(request({ why: "summers are slow /miss" }))).text(), 1);
    expect(res).toMatchObject({ kind: "graded", grade: { why_sound: false, mistake: "cites a general belief instead of the numbers" } });
  });

  it("returns 501 until M4 wires the real grader", async () => {
    vi.stubEnv("USE_FIXTURES", "");
    expect((await grade(request())).status).toBe(501);
  });
});
