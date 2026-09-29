import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSessionValue } from "@/lib/auth";
import { MAX_MESSAGE_CHARS, openRoundStream } from "@/lib/claude";
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
      body: JSON.stringify(body),
    }),
  );
}

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
    const res = await round({ message: "Why did churn change?" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/plain/);
    expect(await res.text()).toBe("Churn rose in March.");
    expect(openMock).toHaveBeenCalledWith("Why did churn change?", expect.any(AbortSignal));
  });

  it("re-checks the session itself (doesn't rely on proxy.ts) and never calls Claude", async () => {
    const res = await round({ message: "hi" }, { session: false });
    expect(res.status).toBe(401);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("rejects empty and oversized messages before spending anything", async () => {
    expect((await round({ message: "   " })).status).toBe(400);
    expect((await round({})).status).toBe(400);
    expect((await round({ message: "x".repeat(MAX_MESSAGE_CHARS + 1) })).status).toBe(413);
    expect(openMock).not.toHaveBeenCalled();
  });

  it("maps rate limits and overload to 503 'busy'", async () => {
    for (const status of [429, 529]) {
      openMock.mockRejectedValueOnce(new Anthropic.APIError(status, undefined, "busy", new Headers()));
      const res = await round({ message: "hi" });
      expect(res.status).toBe(503);
      expect(await res.json()).toEqual({ error: "busy" });
    }
  });

  it("maps other upstream failures to 502", async () => {
    openMock.mockRejectedValueOnce(new Anthropic.APIError(401, undefined, "bad key", new Headers()));
    expect((await round({ message: "hi" })).status).toBe(502);
    openMock.mockRejectedValueOnce(new Error("network down"));
    expect((await round({ message: "hi" })).status).toBe(502);
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
    const res = await round({ message: "hi" });
    const reader = res.body!.getReader();
    await reader.read();
    await reader.cancel();
    expect(closed).toBe(true);
  });
});
