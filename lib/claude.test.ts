import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it, vi } from "vitest";
import { roundModelParams, textChunks } from "./claude";

describe("roundModelParams (D81)", () => {
  it("defaults to Opus 5.5 with explicit effort when ROUND_MODEL is unset", () => {
    vi.stubEnv("ROUND_MODEL", ""); // isolate from any .env.local value
    const req = roundModelParams();
    expect(req.model).toBe("claude-opus-5-5");
    expect(req.output_config).toEqual({ effort: "medium" });
  });

  it("sends no effort to Haiku (Haiku 4.5 returns 400 on it)", () => {
    for (const model of ["claude-haiku-4-5", "claude-haiku-4-5-20251001"]) {
      const req = roundModelParams(model);
      expect(req.model).toBe(model);
      expect(req).not.toHaveProperty("output_config");
    }
  });

  it("fails loudly on a typo instead of sending an unknown model", () => {
    expect(() => roundModelParams("claude-opus-5.5")).toThrow(/not one of/);
  });
});

async function* fakeEvents(events: unknown[]) {
  for (const e of events) yield e as Anthropic.MessageStreamEvent;
}

async function collect(gen: AsyncIterable<string>) {
  const out: string[] = [];
  for await (const chunk of gen) out.push(chunk);
  return out;
}

describe("textChunks", () => {
  it("yields only visible text deltas, skipping thinking and metadata events", async () => {
    const events = [
      { type: "message_start", message: {} },
      { type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "" } },
      { type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "" } },
      { type: "content_block_stop", index: 0 },
      { type: "content_block_start", index: 1, content_block: { type: "text", text: "" } },
      { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Hel" } },
      { type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "lo" } },
      { type: "content_block_stop", index: 1 },
      { type: "message_delta", delta: { stop_reason: "end_turn" }, usage: {} },
      { type: "message_stop" },
    ];
    expect(await collect(textChunks(fakeEvents(events)))).toEqual(["Hel", "lo"]);
  });

  it("reports a refusal with its category, having yielded only the partial text (D91)", async () => {
    const stops: unknown[] = [];
    const events = [
      { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: '{"significant":' } },
      {
        type: "message_delta",
        delta: { stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber", explanation: null } },
        usage: {},
      },
      { type: "message_stop" },
    ];
    const chunks = await collect(textChunks(fakeEvents(events), (s) => stops.push(s)));
    expect(chunks).toEqual(['{"significant":']);
    expect(stops).toEqual([
      { stop_reason: "refusal", stop_details: { type: "refusal", category: "cyber", explanation: null } },
    ]);
  });

  it("reports stop_details as null on a normal end_turn", async () => {
    const stops: unknown[] = [];
    await collect(textChunks(fakeEvents([{ type: "message_delta", delta: { stop_reason: "end_turn" }, usage: {} }]), (s) => stops.push(s)));
    expect(stops).toEqual([{ stop_reason: "end_turn", stop_details: null }]);
  });

  it("stopping early closes the upstream iterator (which is what aborts the SDK stream)", async () => {
    let closed = false;
    async function* upstream() {
      try {
        yield { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "a" } } as Anthropic.MessageStreamEvent;
        yield { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "b" } } as Anthropic.MessageStreamEvent;
      } finally {
        closed = true;
      }
    }
    const gen = textChunks(upstream());
    await gen.next();
    await gen.return(undefined);
    expect(closed).toBe(true);
  });
});
