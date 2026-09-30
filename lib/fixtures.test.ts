import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { chunkText, fixturesEnabled, fixtureText, replayFixture } from "./fixtures";
import { parseRound } from "./round";

const RUN = "evals/round-runs/2026-09-29T01-22-41-526Z/results.json";
const runs: { starter: number; run: number; question: string; raw: string }[] = JSON.parse(readFileSync(RUN, "utf8"));
const rawOf = (starter: number, run: number) => runs.find((r) => r.starter === starter && r.run === run)!;

describe("fixturesEnabled", () => {
  it.each([
    [{ USE_FIXTURES: "1" }, true],
    [{ USE_FIXTURES: "1", VERCEL_ENV: "preview" }, true],
    [{ USE_FIXTURES: "1", VERCEL_ENV: "production" }, false],
    [{ USE_FIXTURES: "true" }, false],
    [{}, false],
  ])("%j → %s", (env, expected) => {
    expect(fixturesEnabled(env as NodeJS.ProcessEnv)).toBe(expected);
  });
});

describe("fixtureText", () => {
  it.each([
    [1, 2, 1],
    [2, 2, 2],
    [3, 1, 3],
  ])("replays M1 run %i.%i byte for byte, as a rung %i cloze", (starter, run, rung) => {
    const { question, raw } = rawOf(starter, run);
    expect(fixtureText(question)).toBe(raw);
    const parsed = parseRound(fixtureText(question));
    expect(parsed.kind === "cloze" && parsed.round.rung).toBe(rung);
  });

  it("gives free typing the August round", () => {
    expect(fixtureText("anything else")).toBe(rawOf(1, 2).raw);
  });

  it("has dev commands for each fallback path", () => {
    expect(parseRound(fixtureText("/plain"))).toMatchObject({ kind: "plain", reason: null });
    expect(parseRound(fixtureText("/truncated"))).toMatchObject({ kind: "plain", reason: "invalid JSON" });
    expect(fixtureText("/empty")).toBe("");
  });
});

describe("chunkText", () => {
  it("splits into uneven chunks that join back to the original", () => {
    const text = fixtureText("anything");
    const chunks = chunkText(text);
    expect(chunks.join("")).toBe(text);
    expect(new Set(chunks.map((c) => c.length)).size).toBeGreaterThan(1);
  });

  it("returns no chunks for empty text", () => {
    expect(chunkText("")).toEqual([]);
  });
});

describe("replayFixture", () => {
  it("streams the whole fixture", async () => {
    let text = "";
    for await (const chunk of replayFixture("/plain", { firstTokenMs: 0, msPerChar: 0 })) text += chunk;
    expect(text).toBe(fixtureText("/plain"));
  });
});
