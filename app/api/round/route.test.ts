import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionValue } from "@/lib/auth";
import { openRoundStream } from "@/lib/claude";
import { fixtureText, REPLAY_PACE } from "@/lib/fixtures";
import { MAX_MESSAGE_CHARS, MAX_ROUND_BYTES, roundRequestBody } from "@/lib/round-request";
import { POST } from "./route";

// Unit tests never call Claude (D79): swap the one function that does.
vi.mock("@/lib/claude", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/claude")>()),
  openRoundStream: vi.fn(),
}));
const openMock = vi.mocked(openRoundStream);

function round(body: unknown, { session = true } = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (session) headers.cookie = `session=${createSessionValue()}`;
  return POST(
    new NextRequest("http://localhost/api/round", {
      method: "POST",
      headers,
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

// A first-turn request, as the browser builds it.
const ask = (question: string) => roundRequestBody([], question, true);

async function* chunks(...parts: string[]) {
  for (const p of parts) yield p;
}

beforeEach(() => {
  vi.stubEnv("SESSION_SECRET", "test-secret");
  openMock.mockReset();
});

describe("POST /api/round", () => {
  it("streams Claude's text through as plain text", async () => {
    openMock.mockResolvedValue(chunks("Churn ", "rose ", "in March."));
    const res = await round(ask("Why did churn change?"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
    expect(await res.text()).toBe("Churn rose in March.");
  });

  it("sends Claude the real round request: system prompt, schema, conversation, settings (M4.2)", async () => {
    openMock.mockResolvedValue(chunks("{}"));
    const body = { ...ask("Q1"), conversation: [
      { role: "user", content: "Q1" },
      { role: "assistant", content: '{"significant":true}' },
      { role: "user", content: "Q2" },
    ] };
    await round(body);
    const [params, signal] = openMock.mock.calls[0];
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(params.system).toBeDefined();
    expect(params.output_config?.format).toMatchObject({ type: "json_schema" });
    expect(params.messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "system"]);
    expect(params.messages[1]).toEqual({ role: "assistant", content: '{"significant":true}' });
  });

  it("re-checks the session itself (doesn't rely on proxy.ts) and never calls Claude", async () => {
    const res = await round(ask("hi"), { session: false });
    expect(res.status).toBe(401);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("rejects invalid, empty and oversized requests before spending anything", async () => {
    expect((await round("not json")).status).toBe(400);
    expect((await round({})).status).toBe(400);
    expect((await round({ message: "the M0 shape" })).status).toBe(400);
    expect((await round(ask("   "))).status).toBe(400);
    expect((await round(ask("x".repeat(MAX_MESSAGE_CHARS + 1)))).status).toBe(400);
    const huge = { ...ask("Q"), goal: "x".repeat(MAX_ROUND_BYTES) };
    expect((await round(huge)).status).toBe(413);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("maps rate limits and overload to 503 'busy'", async () => {
    for (const status of [429, 529]) {
      openMock.mockRejectedValueOnce(new Anthropic.APIError(status, undefined, "busy", new Headers()));
      const res = await round(ask("hi"));
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "busy" });
    }
  });

  it("maps other upstream failures to 502", async () => {
    openMock.mockRejectedValueOnce(new Anthropic.APIError(401, undefined, "bad key", new Headers()));
    expect((await round(ask("hi"))).status).toBe(502);
    openMock.mockRejectedValueOnce(new Error("network down"));
    expect((await round(ask("hi"))).status).toBe(502);
  });

  it("closes the Claude stream when the browser cancels", async () => {
    let closed = false;
    openMock.mockResolvedValue(
      (async function* () {
        try {
          yield "first";
          yield "never read";
        } finally {
          closed = true;
        }
      })(),
    );
    const res = await round(ask("hi"));
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(closed).toBe(true);
  });

  describe("stub mode (USE_FIXTURES=1)", () => {
    beforeEach(() => {
      vi.stubEnv("USE_FIXTURES", "1");
      Object.assign(REPLAY_PACE, { firstTokenMs: 0, msPerChar: 0 });
    });
    afterEach(() => vi.unstubAllEnvs());

    it("replays the fixture and never calls Claude", async () => {
      const res = await round(ask("/plain"));
      expect(res.status).toBe(200);
      expect(await res.text()).toBe(fixtureText("/plain"));
      expect(openMock).not.toHaveBeenCalled();
    });

    it("is ignored on the production deployment", async () => {
      vi.stubEnv("VERCEL_ENV", "production");
      openMock.mockResolvedValue(chunks("real"));
      expect(await (await round(ask("/plain"))).text()).toBe("real");
    });
  });
});
