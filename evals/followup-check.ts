// D111: does the summer question stay on seasonality when it's a follow-up? M1 asked it
// single-turn (9/9 seasonality); the M4.2 smoke test asked it after August and drifted.
// Only the history changes here: round 1 is a fixed, real Opus reply (verbatim, D110), and
// the rung map is what the staircase sends after a correct August.
//
// Run: npx tsx --env-file=.env.local evals/followup-check.ts   (real API calls, ~$0.30)
// Writes evals/followup-runs/<timestamp>/{report.md, results.json}.

import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { DEFAULT_ROUND_MODEL } from "@/lib/claude";
import { buildRoundParams } from "@/lib/prompts/round";
import { parseRound } from "@/lib/round";

const MODEL = DEFAULT_ROUND_MODEL; // always Opus, whatever ROUND_MODEL says (D81)
const RUNS = 3;
const CONCEPT = "seasonality_vs_trend";
const RUNG = 2;
const PASS_AT = 2; // D111: ≥ 2/3, fixed before the run

const ROUND1_QUESTION = "Summarize August for the leadership update";
const ROUND1_REPLY = readFileSync("evals/followup-runs/august-round1.txt", "utf8");
const FOLLOWUP = "How does this summer compare to last summer?";

// Opus 5.5, $/MTok (docs, 2026-09-25): input 4, output 20, 5-minute cache write 5, cache read 0.20.
const PRICE = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };

async function runOne(client: Anthropic, run: number) {
  const params = buildRoundParams(
    {
      conversation: [
        { role: "user", content: ROUND1_QUESTION },
        { role: "assistant", content: ROUND1_REPLY },
        { role: "user", content: FOLLOWUP },
      ],
      attachData: true,
      rungMap: { [CONCEPT]: RUNG },
      goal: null,
    },
    MODEL,
  );
  const start = performance.now();
  const message = await client.messages.stream(params).finalMessage();
  const seconds = (performance.now() - start) / 1000;
  const raw = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  const u = message.usage;
  const costUsd =
    (u.input_tokens * PRICE.input +
      u.output_tokens * PRICE.output +
      (u.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite +
      (u.cache_read_input_tokens ?? 0) * PRICE.cacheRead) /
    1e6;
  const parsed = parseRound(raw);
  const round = parsed.kind === "cloze" ? parsed.round : null;
  const pass = round?.concept === CONCEPT && round.rung === RUNG;
  console.info(`run ${run}: ${round ? `${round.concept} rung ${round.rung}` : `plain (${parsed.kind === "plain" ? parsed.reason : ""})`} ${pass ? "✅" : "❌"}`);
  return { run, pass, round, concept: round?.concept ?? null, rung: round?.rung ?? null, stopReason: message.stop_reason, usage: u, seconds, costUsd, raw };
}

function renderReport(results: Awaited<ReturnType<typeof runOne>>[]) {
  const passes = results.filter((r) => r.pass).length;
  const cost = results.reduce((sum, r) => sum + r.costUsd, 0);
  const rows = results.map(
    (r) =>
      `| ${r.run} | ${r.concept ?? "plain"} | ${r.rung ?? "–"} | ${r.pass ? "✅" : "❌"} | ${r.round?.blank ?? ""} | ${r.seconds.toFixed(0)} s | ${r.usage.cache_read_input_tokens} |`,
  );
  const bodies = results.map(({ run, round, raw }) => {
    if (!round) return `## Run ${run}: plain\n\n${raw}`;
    return [
      `## Run ${run}: ${round.concept} (rung ${round.rung})`,
      `**Goal:** ${round.goal}`,
      round.before + ` **[${round.blank}]** ` + round.after,
      "**Options:**",
      ...round.options.map((o) => `- ${o.text} — _${o.mistake ?? "correct"}_`),
    ].join("\n\n");
  });
  return [
    "# D111 follow-up concept check",
    `Round 1: "${ROUND1_QUESTION}" (fixed real reply) → follow-up: "${FOLLOWUP}" · rung map \`{${CONCEPT}: ${RUNG}}\` · ${MODEL}`,
    `**Result: ${passes}/${results.length} on ${CONCEPT} at rung ${RUNG} → ${passes >= PASS_AT ? "PASS" : "FAIL"}** (rule: ≥ ${PASS_AT}/${results.length}, D111) · cost $${cost.toFixed(2)}`,
    "| Run | Concept | Rung | Pass | Blank | Time | Cache read |\n|---|---|---|---|---|---|---|\n" + rows.join("\n"),
    ...bodies,
  ].join("\n\n");
}

async function main() {
  const client = new Anthropic();
  const results = [];
  for (let run = 1; run <= RUNS; run++) results.push(await runOne(client, run)); // sequential: each reads the cache
  const dir = `evals/followup-runs/${new Date().toISOString().replace(/[:.]/g, "-")}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/results.json`, JSON.stringify(results, null, 2) + "\n");
  writeFileSync(`${dir}/report.md`, renderReport(results) + "\n");
  console.info(`Wrote ${dir}/report.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
