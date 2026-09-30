import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import august from "@/fixtures/rounds/august-rung1.json";
import { createSessionValue } from "@/lib/auth";
import { gradeReply } from "@/lib/claude";
import { parseGrade } from "@/lib/grade";
import { MAX_LEARNER_CHARS } from "@/lib/grading";
import { POST } from "./route";

// No real delay in tests.
vi.mock("node:timers/promises", () => ({ setTimeout: () => Promise.resolve() }));
// Unit tests never call Claude (D79): swap the one function that does.
vi.mock("@/lib/claude", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/claude")>()),
  gradeReply: vi.fn(),
}));
const gradeMock = vi.mocked(gradeReply);

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

  describe("live (M4.3)", () => {
    beforeEach(() => {
      vi.stubEnv("USE_FIXTURES", "");
      vi.stubEnv("GRADE_MODEL", "");
      gradeMock.mockReset();
    });

    it("sends the grade request to Sonnet 5.5 by default (D97) and returns its raw text", async () => {
      gradeMock.mockResolvedValue('{"assessment":"…"}');
      const res = await grade(request());
      expect(res.status).toBe(200);
      expect(await res.text()).toBe('{"assessment":"…"}');
      const [params, signal] = gradeMock.mock.calls[0];
      expect(params.model).toBe("claude-sonnet-5-5");
      expect(params.output_config?.format).toMatchObject({ type: "json_schema" });
      expect(JSON.stringify(params.messages)).toContain(correct); // the round goes to the grader (D56)
      expect(signal).toBeInstanceOf(AbortSignal);
    });

    it("uses GRADE_MODEL when set", async () => {
      vi.stubEnv("GRADE_MODEL", "claude-opus-5-5");
      gradeMock.mockResolvedValue("{}");
      await grade(request());
      expect(gradeMock.mock.calls[0][0].model).toBe("claude-opus-5-5");
    });

    it("fails with 502 (never calls Claude) on a GRADE_MODEL the eval didn't measure", async () => {
      vi.stubEnv("GRADE_MODEL", "claude-sonnet-5.5");
      expect((await grade(request())).status).toBe(502);
      expect(gradeMock).not.toHaveBeenCalled();
    });

    it("maps rate limits and overload to 503, other failures to 502", async () => {
      for (const status of [429, 529]) {
        gradeMock.mockRejectedValueOnce(new Anthropic.APIError(status, undefined, "busy", new Headers()));
        expect((await grade(request())).status).toBe(503);
      }
      gradeMock.mockRejectedValueOnce(new Error("network down"));
      expect((await grade(request())).status).toBe(502);
    });
  });
});
