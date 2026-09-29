import { describe, expect, it } from "vitest";
import { parseRound, RoundSchema, type RawRound } from "./round";

function round(overrides: Partial<RawRound> = {}): string {
  const base: RawRound = {
    significant: true,
    goal: "Tell a seasonal dip from a real decline.",
    domain: "analysis",
    concept: "seasonality_vs_trend",
    rung: 1,
    before: "Active users fell 8.3% from July to August.",
    blank: "That matches last August's dip, so it reads as seasonal, not a decline.",
    after: "Year over year, August is still up 35%.",
    options: [
      { text: "Seasonal: last August dipped the same amount", mistake: null },
      { text: "A real decline: usage is falling", mistake: "reads a seasonal dip as a trend" },
      { text: "Noise: one month means nothing", mistake: "dismisses a repeated pattern as noise" },
      { text: "The May launch is wearing off", mistake: "attributes the dip to a coincident event" },
    ],
  };
  return JSON.stringify({ ...base, ...overrides });
}

describe("RoundSchema", () => {
  it("keeps output order = reasoning order (D60)", () => {
    expect(Object.keys(RoundSchema.shape)).toEqual([
      "significant", "goal", "domain", "concept", "rung", "before", "blank", "after", "options",
    ]);
  });
});

describe("parseRound", () => {
  it("returns a cloze for a valid significant round", () => {
    const result = parseRound(round());
    expect(result.kind).toBe("cloze");
    if (result.kind === "cloze") expect(result.round.concept).toBe("seasonality_vs_trend");
  });

  it("accepts any Claude-named concept outside the analysis pack (D34)", () => {
    expect(parseRound(round({ domain: "other", concept: "list comprehensions" })).kind).toBe("cloze");
  });

  it("returns `before` as a plain answer when not significant (D8)", () => {
    const raw = round({
      significant: false, goal: null, domain: null, concept: null, rung: null,
      before: "Paris.", blank: null, after: null, options: null,
    });
    expect(parseRound(raw)).toEqual({ kind: "plain", text: "Paris.", reason: null });
  });

  it.each([
    ["3 options", { options: JSON.parse(round()).options.slice(0, 3) }, "expected exactly 4 options"],
    ["no correct option", { options: JSON.parse(round()).options.map((o: object) => ({ ...o, mistake: "x" })) }, "expected exactly one correct option"],
    ["concept outside the pack", { concept: "survivorship_bias" }, 'concept "survivorship_bias" is not in the analysis pack'],
    ["significant but no goal", { goal: null }, "significant round missing goal, domain, concept, or rung"],
    ["significant but no blank", { blank: null }, "significant round missing blank or after"],
  ])("falls back to the full plain answer on %s", (_, overrides, reason) => {
    const result = parseRound(round(overrides as Partial<RawRound>));
    expect(result).toEqual({
      kind: "plain",
      text: expect.stringContaining("Active users fell 8.3%"),
      reason,
    });
  });

  it("puts the blanked inference back into the fallback text", () => {
    const result = parseRound(round({ concept: "survivorship_bias" }));
    expect(result.kind === "plain" && result.text).toContain("reads as seasonal");
  });

  it("falls back on invalid JSON (e.g. truncated at max_tokens)", () => {
    expect(parseRound('{"significant": true, "goal": "Tell')).toMatchObject({ kind: "plain", reason: "invalid JSON" });
  });

  it("falls back on a schema mismatch (rung out of range)", () => {
    expect(parseRound(round({ rung: 4 as 1 }))).toMatchObject({ kind: "plain", reason: "schema mismatch" });
  });
});
