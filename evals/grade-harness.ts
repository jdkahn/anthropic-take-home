// M2 mini-eval: 12 labeled items × 3 runs × Sonnet 5.5 and Opus 5.5 (D92, D93).
// Scoring lives in grade-metrics.ts; the decision is D71 as written.
//
// Run: npm run eval:grade   (72 real API calls, roughly $1–3)
// Writes evals/grade-runs/<timestamp>/{report.md, results.json}. Re-render: -- --rerender <dir>
// Check requests first (2 calls, no verdicts shown): -- --smoke

import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import items from "@/evals/grader-items.json";
import { GRADE_MODELS, type GradeModel } from "@/lib/claude";
import { parseGrade, type ParsedGrade } from "@/lib/grade";
import { buildGradeParams } from "@/lib/prompts/grade";
import type { ClozeRound } from "@/lib/round";
import { decide, flipped, itemAgrees, percentile, runAgrees, type Label, type Vote } from "./grade-metrics";

const RUNS = 3;
const CONCURRENCY = 4;

// $/MTok (docs, 2026-09-25). 5-minute cache write = 1.25× input.
const PRICE: Record<GradeModel, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  "claude-sonnet-5-5": { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  "claude-opus-5-5": { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
};

type Item = (typeof items.items)[number];
type Job = { model: GradeModel; run: number; item: Item; warm: boolean };
type Result = {
  model: GradeModel;
  run: number;
  id: string;
  warm: boolean; // false for each model's first call (cache write + grammar compile): excluded from latency (D92)
  raw: string;
  parsed: ParsedGrade;
  stopReason: string | null;
  usage: Anthropic.Usage | null;
  ms: number;
  costUsd: number;
  error: string | null;
};

function loadRound(source: Item["source"]): ClozeRound {
  const runs = JSON.parse(readFileSync(`evals/round-runs/${source.runDir}/results.json`, "utf8"));
  const r = runs.find((x: { starter: number; run: number }) => x.starter === source.starter && x.run === source.run);
  if (r?.parsed?.kind !== "cloze") throw new Error(`No cloze round for ${JSON.stringify(source)}`);
  // Grade against the rung the round was rendered at (D67), not the rung that was asked for.
  return r.parsed.round;
}

async function runOne(client: Anthropic, { model, run, item, warm }: Job): Promise<Result> {
  const round = loadRound(item.source);
  const params = buildGradeParams({ round, pick: item.pick, answer: item.answer, why: item.why }, model);
  const start = performance.now();
  try {
    const message = await client.messages.create(params);
    const ms = performance.now() - start;
    const raw = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const u = message.usage;
    const p = PRICE[model];
    const costUsd =
      (u.input_tokens * p.input +
        (u.cache_creation_input_tokens ?? 0) * p.cacheWrite +
        (u.cache_read_input_tokens ?? 0) * p.cacheRead +
        u.output_tokens * p.output) /
      1e6;
    console.info(`${model} run ${run} ${item.id}: ${(ms / 1000).toFixed(1)} s, ${message.stop_reason}`);
    return { model, run, id: item.id, warm, raw, parsed: parseGrade(raw, round.rung), stopReason: message.stop_reason, usage: u, ms, costUsd, error: null };
  } catch (err) {
    const ms = performance.now() - start;
    console.error(`${model} run ${run} ${item.id}: ERROR ${err}`);
    return { model, run, id: item.id, warm, raw: "", parsed: { kind: "invalid", reason: "API error" }, stopReason: null, usage: null, ms, costUsd: 0, error: String(err) };
  }
}

async function pool<T, R>(list: T[], size: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(list.length);
  let next = 0;
  const worker = async () => {
    while (next < list.length) {
      const i = next++;
      out[i] = await fn(list[i]);
    }
  };
  await Promise.all(Array.from({ length: size }, worker));
  return out;
}

// --- Report -------------------------------------------------------------------------

const vote = (r: Result): Vote =>
  r.parsed.kind === "graded" ? { answer_sound: r.parsed.grade.answer_sound, why_sound: r.parsed.grade.why_sound } : null;
const yn = (b: boolean | null | undefined) => (b === true ? "y" : b === false ? "n" : "—");
const fmtVote = (v: Vote, label: Label) =>
  v === null ? "✗" : label.answer_sound === null ? `W:${yn(v.why_sound)}` : `A:${yn(v.answer_sound)} W:${yn(v.why_sound)}`;
const secs = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function score(results: Result[], model: GradeModel) {
  const mine = results.filter((r) => r.model === model);
  const perItem = items.items.map((item) => {
    const votes = mine.filter((r) => r.id === item.id).sort((a, b) => a.run - b.run).map(vote);
    return { item, votes, agrees: itemAgrees(item.label, votes), flipped: flipped(item.label, votes) };
  });
  const warmMs = mine.filter((r) => r.warm && r.error === null).map((r) => r.ms);
  const singleRun = Array.from({ length: RUNS }, (_, i) =>
    items.items.filter((item) => runAgrees(item.label, vote(mine.find((r) => r.id === item.id && r.run === i + 1)!))).length,
  );
  return {
    model,
    perItem,
    agreement: perItem.filter((p) => p.agrees).length,
    singleRunMean: singleRun.reduce((a, b) => a + b, 0) / RUNS,
    flips: perItem.filter((p) => p.flipped).map((p) => p.item.id),
    p50Ms: percentile(warmMs, 50),
    p90Ms: percentile(warmMs, 90),
    invalid: mine.filter((r) => r.parsed.kind === "invalid").length,
    notEndTurn: mine.filter((r) => r.stopReason !== "end_turn").length,
    outTokens: percentile(mine.flatMap((r) => (r.usage ? [r.usage.output_tokens] : [])), 50),
    cost: mine.reduce((s, r) => s + r.costUsd, 0),
  };
}

function renderReport(results: Result[]): string {
  const scores = GRADE_MODELS.map((m) => score(results, m));
  const decision = decide(scores.map(({ model, agreement, p50Ms }) => ({ model, agreement, p50Ms })));
  const n = items.items.length;

  const summary = [
    "| Model | **Agreement** (majority of 3) | Single-run mean | Flipped items | **Warm p50** | Warm p90 | Invalid | ≠ end_turn | Out tokens p50 | Cost |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...scores.map((s) =>
      `| ${s.model} | **${s.agreement}/${n}** | ${s.singleRunMean.toFixed(1)}/${n} | ${s.flips.length ? s.flips.join(", ") : "none"} | **${secs(s.p50Ms)}** | ${secs(s.p90Ms)} | ${s.invalid} | ${s.notEndTurn} | ${s.outTokens} | $${s.cost.toFixed(2)} |`,
    ),
  ];

  const perItem = [
    `| Item | Rung | Label | ${GRADE_MODELS.map((m) => `${m} (runs 1·2·3)`).join(" | ")} |`,
    `|---|---|---|${GRADE_MODELS.map(() => "---").join("|")}|`,
    ...items.items.map((item) => {
      const label = item.label as Label;
      const cells = scores.map((s) => {
        const p = s.perItem.find((x) => x.item.id === item.id)!;
        return `${p.agrees ? "✅" : "❌"} ${p.votes.map((v) => fmtVote(v, label)).join(" · ")}`;
      });
      return `| ${item.id} | ${item.rung} | ${fmtVote(label, label)} | ${cells.join(" | ")} |`;
    }),
  ];

  // Justin reads these: where the grader and the label disagree, and the grader's reasoning.
  const misses = scores.flatMap((s) =>
    s.perItem.filter((p) => !p.agrees).map((p) => {
      const runs = results.filter((r) => r.model === s.model && r.id === p.item.id).sort((a, b) => a.run - b.run);
      return [
        `### ${p.item.id} · ${s.model}`,
        `**Label:** ${fmtVote(p.item.label as Label, p.item.label as Label)} · **Why:** ${p.item.why}`,
        ...runs.map((r) =>
          r.parsed.kind === "graded"
            ? `- **Run ${r.run}** (${fmtVote(vote(r), p.item.label as Label)}): ${r.parsed.grade.assessment}\n  - *Feedback:* ${r.parsed.grade.feedback}`
            : `- **Run ${r.run}:** invalid (${r.parsed.reason}${r.error ? `: ${r.error}` : ""})`,
        ),
      ].join("\n");
    }),
  );

  const total = scores.reduce((s, x) => s + x.cost, 0);
  return [
    `# Grader mini-eval · ${new Date().toISOString()}`,
    "",
    "Rule (D71, pre-registered in D92): fastest model with ≥ 10/12 agreement (majority of 3), within 1 item of the best, warm p50 ≤ 3 s. Latency measured from Justin's laptop, first call per model dropped.",
    "",
    `## Decision: **${decision.pick ?? "none"}**`,
    decision.reason,
    "",
    ...summary,
    "",
    `Single-run mean and flipped items are diagnostics, not part of D71: production grades once, so they show how much the majority vote smooths. **Total cost:** $${total.toFixed(2)}`,
    "",
    "## Per item (y = sound, n = unsound, ✗ = invalid)",
    "",
    ...perItem,
    "",
    "## Disagreements (read these)",
    "",
    misses.length ? misses.join("\n\n") : "None.",
  ].join("\n");
}

async function main() {
  if (process.argv[2] === "--rerender") {
    const dir = process.argv[3];
    const saved: Result[] = JSON.parse(readFileSync(`${dir}/results.json`, "utf8"));
    writeFileSync(`${dir}/report.md`, renderReport(saved) + "\n");
    console.info(`Re-rendered ${dir}/report.md`);
    return;
  }

  const client = new Anthropic();
  // Smoke test: one call per model to catch request errors before spending a full run.
  if (process.argv[2] === "--smoke") {
    for (const model of GRADE_MODELS) {
      const r = await runOne(client, { model, run: 0, item: items.items[0], warm: false });
      console.info(model, r.parsed.kind, r.stopReason, r.error ?? "", `$${r.costUsd.toFixed(4)}`);
    }
    return;
  }

  const results: Result[] = [];
  for (const model of GRADE_MODELS) {
    const jobs: Job[] = Array.from({ length: RUNS }, (_, r) => items.items.map((item) => ({ model, run: r + 1, item, warm: true }))).flat();
    // Each model's first call alone writes that model's cache (caches are per model); it's excluded from latency.
    const [first, ...rest] = jobs;
    results.push(await runOne(client, { ...first, warm: false }), ...(await pool(rest, CONCURRENCY, (j) => runOne(client, j))));
  }

  const dir = `evals/grade-runs/${new Date().toISOString().replace(/[:.]/g, "-")}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/results.json`, JSON.stringify(results, null, 2) + "\n");
  writeFileSync(`${dir}/report.md`, renderReport(results) + "\n");
  console.info(`Wrote ${dir}/report.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
