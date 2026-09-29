import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parsePartialRound, repairJson } from "./partial-round";

// The 9 real Opus rounds from the M1 harness (D89 run): 3 per rung, 3.2–4.4 KB each.
const RUN = "evals/round-runs/2026-09-29T01-22-41-526Z/results.json";
const opusRaws: string[] = JSON.parse(readFileSync(RUN, "utf8")).map((r: { raw: string }) => r.raw);

// Synthetic: a Python code block (Experimental chip) with braces, quotes, backslashes, backticks,
// plus a \u escape and a surrogate pair, the cases real analysis rounds rarely hit.
const codeRaw = JSON.stringify({
  significant: true,
  goal: "Read a dict comprehension.",
  domain: "other",
  concept: "dict_comprehensions",
  rung: 1,
  before: '```python\nd = {k: v for k, v in pairs if k != "a"}\npath = "C:\\\\tmp"\n```\nCafé 😀 [done]',
  blank: "It skips the key `a`.",
  after: null,
  options: [
    { text: "Keeps every key", mistake: "ignores the filter" },
    { text: "Skips key \"a\"", mistake: null },
    { text: "Skips values equal to a", mistake: "reads k as v" },
    { text: "Raises on duplicates", mistake: "confuses dicts with sets" },
  ],
}).replace("é", "\\u00e9");

// A partial value is correct if every string is a prefix of its final value, every array
// element and object key is correct in turn, and everything else matches exactly.
function isPrefixOf(partial: unknown, final: unknown): boolean {
  if (typeof partial === "string") return typeof final === "string" && final.startsWith(partial);
  if (Array.isArray(partial)) {
    return Array.isArray(final) && partial.length <= final.length && partial.every((p, i) => isPrefixOf(p, final[i]));
  }
  if (partial !== null && typeof partial === "object") {
    if (final === null || typeof final !== "object") return false;
    const f = final as Record<string, unknown>;
    return Object.entries(partial).every(([k, v]) => k in f && isPrefixOf(v, f[k]));
  }
  return partial === final;
}

describe("repairJson", () => {
  it.each([
    ['{"significant":true,"goal":"Separate the Aug', '{"significant":true,"goal":"Separate the Aug"}'],
    ['{"significant":true,"before":"Churn rose [see table] {', '{"significant":true,"before":"Churn rose [see table] {"}'],
    ['{"significant":true,"options":[{"text":"Seasonal', '{"significant":true,"options":[{"text":"Seasonal"}]}'],
    ['{"significant":true,"before":"Revenue fell 10%\\', '{"significant":true,"before":"Revenue fell 10%"}'],
    ['{"before":"Caf\\u00', '{"before":"Caf"}'],
    ['{"before":"C:\\\\', '{"before":"C:\\\\"}'], // a complete escaped backslash stays
  ])("repairs %s", (buffer, expected) => {
    expect(repairJson(buffer)).toBe(expected);
  });
});

describe("parsePartialRound", () => {
  it.each([
    ['{"significant":true,"goal"', "dangling key"],
    ['{"significant":true,"goal":', "after a colon"],
    ['{"significant":true,', "after a comma"],
    ['{"significant":tr', "half a literal"],
    ["", "empty buffer"],
  ])("returns null for %s (%s)", (buffer) => {
    expect(parsePartialRound(buffer)).toBeNull();
  });

  describe.each([...opusRaws.map((raw, i) => [`Opus round ${i + 1}`, raw]), ["code block", codeRaw]])(
    "every prefix of %s",
    (_name, raw) => {
      const final = JSON.parse(raw);

      it("never throws, and every non-null result is a prefix of the final round", () => {
        for (let i = 1; i <= raw.length; i++) {
          const partial = parsePartialRound(raw.slice(0, i));
          if (partial !== null && !isPrefixOf(partial, final)) {
            throw new Error(`prefix ${i} is not a prefix of the final round: ${JSON.stringify(partial)}`);
          }
        }
      });

      it("returns the whole round on the full text", () => {
        expect(parsePartialRound(raw)).toEqual(final);
      });

      it("stays stale for at most a few characters at a time", () => {
        let run = 0;
        let longest = 0;
        for (let i = 1; i <= raw.length; i++) {
          run = parsePartialRound(raw.slice(0, i)) === null ? run + 1 : 0;
          longest = Math.max(longest, run);
        }
        // Worst case is the opening: nothing parses from `{"` until `"significant":true` completes
        // (17 prefixes). Later runs are ≤ 14 characters, ~50 ms at Opus's ~3.6 ms per character.
        expect(longest).toBeLessThanOrEqual(17);
      });
    },
  );
});
