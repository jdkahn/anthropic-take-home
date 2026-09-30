import { describe, expect, it } from "vitest";
import expected from "@/data/expected.json";
import { ANALYSIS_CONCEPTS } from "@/lib/round";
import { buildRoundParams, ROUND_SYSTEM, type RoundInput } from "./round";

const input = (overrides: Partial<RoundInput> = {}): RoundInput => ({
  conversation: [{ role: "user", content: "Summarize the quarter." }],
  attachData: true,
  rungMap: {},
  goal: null,
  ...overrides,
});

describe("ROUND_SYSTEM", () => {
  // D65: Claude gets the method, never the answers. D69: prompt examples ≠ eval items.
  it.each([
    "Tasklane", "August", "December", "summer", "mobile", "redesign",
    "AI Summaries", "Product Hunt", "free-plan", "seasonal dip",
  ])("never mentions the planted traps: %s", (term) => {
    expect(ROUND_SYSTEM.toLowerCase()).not.toContain(term.toLowerCase());
  });

  it("contains none of the measured trap numbers", () => {
    const traps = Object.entries(expected).filter(([key]) => key !== "seed").map(([, group]) => group);
    const numbers = traps.flatMap((group) => Object.values(group as Record<string, number>));
    for (const n of numbers) expect(ROUND_SYSTEM).not.toContain(String(n));
  });

  it("lists every concept in the analysis pack", () => {
    for (const id of ANALYSIS_CONCEPTS) expect(ROUND_SYSTEM).toContain(id);
  });
});

describe("buildRoundParams", () => {
  it("caches the system prompt", () => {
    const { system } = buildRoundParams(input());
    expect(system).toEqual([expect.objectContaining({ text: ROUND_SYSTEM, cache_control: { type: "ephemeral" } })]);
  });

  const CACHED = { cache_control: { type: "ephemeral" } };

  it("puts the data first in the first user message, cached, then the question", () => {
    const first = buildRoundParams(input()).messages[0];
    expect(first.content).toEqual([
      expect.objectContaining({ text: expect.stringMatching(/^<data>\n\{"company"/), ...CACHED }),
      { type: "text", text: "Summarize the quarter.", ...CACHED }, // also the latest message
    ]);
  });

  it("sends no data when nothing is attached (D37)", () => {
    const first = buildRoundParams(input({ attachData: false })).messages[0];
    expect(first.content).toEqual([{ type: "text", text: "Summarize the quarter.", ...CACHED }]);
  });

  describe("a multi-turn conversation (D110)", () => {
    const conversation = [
      { role: "user" as const, content: "Q1" },
      { role: "assistant" as const, content: '{"significant":true}' },
      { role: "user" as const, content: "Q2" },
    ];
    const { messages } = buildRoundParams(input({ conversation }));

    it("keeps turns in order, settings last", () => {
      expect(messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "system"]);
    });

    it("sends assistant turns verbatim", () => {
      expect(messages[1]).toEqual({ role: "assistant", content: '{"significant":true}' });
    });

    it("marks only the latest user message for caching (plus system and data): 3 of 4 markers", () => {
      expect(messages[0].content).toEqual([expect.objectContaining({ text: expect.stringMatching(/^<data>/), ...CACHED }), { type: "text", text: "Q1" }]);
      expect(messages[2].content).toEqual([{ type: "text", text: "Q2", ...CACHED }]);
      const markers = JSON.stringify(buildRoundParams(input({ conversation }))).match(/cache_control/g);
      expect(markers).toHaveLength(3);
    });

    it("re-sends an earlier request's messages with the same content (a byte-stable prefix)", () => {
      const earlier = buildRoundParams(input({ conversation: conversation.slice(0, 1) })).messages[0];
      const strip = (m: unknown) => JSON.stringify(m).replace(/,"cache_control":\{"type":"ephemeral"\}/g, "");
      // The moving marker isn't an invalidator (caching docs); everything else must match.
      expect(strip(messages[0])).toBe(strip(earlier));
    });
  });

  it("ends with round settings as a system message: sparse rung map, sorted (D66)", () => {
    const { messages } = buildRoundParams(
      input({ rungMap: { seasonality_vs_trend: 2, averages_hiding_segments: 3 } }),
    );
    expect(messages.at(-1)).toEqual({
      role: "system",
      content:
        '<round_settings>\nRung map (concepts not listed are at rung 1): {"averages_hiding_segments":3,"seasonality_vs_trend":2}\n</round_settings>',
    });
  });

  it("says every concept is at rung 1 when the map is empty", () => {
    expect(buildRoundParams(input()).messages.at(-1)?.content).toContain("every concept is at rung 1");
  });

  it("passes a learner-set goal through (D40)", () => {
    expect(buildRoundParams(input({ goal: "Spot hidden segments" })).messages.at(-1)?.content).toContain(
      "Learner-set goal: Spot hidden segments",
    );
  });

  it("keeps Opus effort and adds the schema to output_config", () => {
    const { model, output_config } = buildRoundParams(input(), "claude-opus-5-5");
    expect(model).toBe("claude-opus-5-5");
    expect(output_config).toMatchObject({ effort: "medium", format: { type: "json_schema" } });
  });

  it("sends Haiku no effort (it rejects it) but still the schema", () => {
    const { output_config } = buildRoundParams(input(), "claude-haiku-4-5");
    expect(output_config).not.toHaveProperty("effort");
    expect(output_config).toHaveProperty("format.type", "json_schema");
  });

  it("requests the round schema in reasoning order (D60, D86)", () => {
    const format = buildRoundParams(input()).output_config?.format as unknown as { schema: { required: string[] } };
    expect(format.schema.required).toEqual([
      "significant", "goal", "domain", "concept", "rung", "before", "blank", "after", "options",
    ]);
  });
});
