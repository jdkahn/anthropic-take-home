import { describe, expect, it } from "vitest";
import type { Turn } from "./conversation";
import { initialRound } from "./round-reducer";
import { MAX_MESSAGE_CHARS, roundRequestBody, RoundRequestSchema } from "./round-request";

const turn = (question: string, reply: string, attached = true): Turn => ({
  id: 0,
  question,
  attached,
  reply,
  round: initialRound, // status doesn't matter to the history
});

describe("roundRequestBody (D110)", () => {
  it("sends only the question on the first turn, with the starter's data flag", () => {
    expect(roundRequestBody([], "Summarize August", true)).toEqual({
      conversation: [{ role: "user", content: "Summarize August" }],
      attachData: true,
      rungMap: {},
      goal: null,
    });
  });

  it("sends past replies verbatim, whitespace and all, then the new question", () => {
    const raw = '{"significant": true,\n  "goal": "…"}\n';
    const body = roundRequestBody([turn("Q1", raw)], "Q2", false);
    expect(body.conversation).toEqual([
      { role: "user", content: "Q1" },
      { role: "assistant", content: raw },
      { role: "user", content: "Q2" },
    ]);
  });

  it("keeps a cut-off or stopped reply as its partial text", () => {
    const body = roundRequestBody([turn("Q1", '{"significant": tr')], "Q2", false);
    expect(body.conversation[1]).toEqual({ role: "assistant", content: '{"significant": tr' });
  });

  it("drops a turn with no reply together with its question", () => {
    const body = roundRequestBody([turn("failed", ""), turn("Q2", "A2"), turn("stopped early", "  ")], "Q3", false);
    expect(body.conversation.map((t) => t.content)).toEqual(["Q2", "A2", "Q3"]);
  });

  it("lets the first turn decide whether data is attached", () => {
    expect(roundRequestBody([turn("Q1", "A1", true)], "free question", false).attachData).toBe(true);
    expect(roundRequestBody([turn("Q1", "A1", false)], "Q2", true).attachData).toBe(false);
  });

  it("always produces a request the server accepts", () => {
    const body = roundRequestBody([turn("Q1", "A1"), turn("Q2", "")], "Q3", true);
    expect(RoundRequestSchema.safeParse(body).success).toBe(true);
  });
});

describe("RoundRequestSchema", () => {
  const ok = { conversation: [{ role: "user", content: "Q" }], attachData: true, rungMap: {}, goal: null };
  const valid = (overrides: object) => RoundRequestSchema.safeParse({ ...ok, ...overrides }).success;

  it("accepts a minimal request and a full one", () => {
    expect(valid({})).toBe(true);
    expect(valid({ rungMap: { seasonality_vs_trend: 2 }, goal: "Spot hidden segments" })).toBe(true);
  });

  it("requires alternating turns that start and end with the learner", () => {
    const [u, a] = [{ role: "user", content: "Q" }, { role: "assistant", content: "A" }];
    expect(valid({ conversation: [] })).toBe(false);
    expect(valid({ conversation: [u, a] })).toBe(false); // ends with Claude
    expect(valid({ conversation: [a, u] })).toBe(false); // starts with Claude
    expect(valid({ conversation: [u, u] })).toBe(false);
    expect(valid({ conversation: [u, a, u] })).toBe(true);
  });

  it("rejects blank turns and an oversized question", () => {
    expect(valid({ conversation: [{ role: "user", content: "   " }] })).toBe(false);
    expect(valid({ conversation: [{ role: "user", content: "x".repeat(MAX_MESSAGE_CHARS + 1) }] })).toBe(false);
  });

  it("keeps assistant text as sent (no trimming)", () => {
    const conversation = [{ role: "user", content: "Q" }, { role: "assistant", content: " A \n" }, { role: "user", content: "Q2" }];
    const parsed = RoundRequestSchema.parse({ ...ok, conversation });
    expect(parsed.conversation[1].content).toBe(" A \n");
  });

  it("only allows rungs 2 and 3 in the sparse map (D66)", () => {
    expect(valid({ rungMap: { x: 1 } })).toBe(false);
    expect(valid({ rungMap: { x: 4 } })).toBe(false);
  });
});
