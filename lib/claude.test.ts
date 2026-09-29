import type Anthropic from "@anthropic-ai/sdk";
import { describe, expect, it } from "vitest";
import { textChunks } from "./claude";

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
