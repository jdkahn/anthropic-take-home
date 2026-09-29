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

  it("puts the data first in the first user message, cached, then the question", () => {
    const first = buildRoundParams(input()).messages[0];
    expect(first.content).toEqual([
      expect.objectContaining({ text: expect.stringMatching(/^<data>\n\{"company"/), cache_control: { type: "ephemeral" } }),
      { type: "text", text: "Summarize the quarter." },
    ]);
  });

  it("sends no data when nothing is attached (D37)", () => {
    const first = buildRoundParams(input({ attachData: false })).messages[0];
    expect(first.content).toBe("Summarize the quarter.");
  });

  it("keeps the rest of the conversation in order", () => {
    const conversation = [
      { role: "user" as const, content: "Q1" },
      { role: "assistant" as const, content: "A1" },
      { role: "user" as const, content: "Q2" },
    ];
    const { messages } = buildRoundParams(input({ conversation }));
    expect(messages.map((m) => m.role)).toEqual(["user", "assistant", "user", "system"]);
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
