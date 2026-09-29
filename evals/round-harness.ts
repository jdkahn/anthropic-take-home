// M1 exit test: 3 starters × 3 runs on Opus. Code checks the structure; Justin reads all 9
// for the two things code can't judge: blank on the right concept, no trap fallen into.
//
// Run: npm run eval:round   (real API calls, roughly $1)
// Writes evals/round-runs/<timestamp>/{report.md, results.json}. Re-render: -- --rerender <dir>

import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import expected from "@/data/expected.json";
import { DEFAULT_ROUND_MODEL } from "@/lib/claude";
import { buildRoundParams } from "@/lib/prompts/round";
import { parseRound, type ParsedRound } from "@/lib/round";

// Always Opus, whatever ROUND_MODEL says in .env.local: the exit test runs on the real model (D81).
const MODEL = DEFAULT_ROUND_MODEL;
const CONCEPT = "seasonality_vs_trend";
const RUNS = 3;
const CONCURRENCY = 4;

// Golden-path ladder (D36, D88). Copy is from docs/wireframes/Main.dc.html.
const STARTERS = [
  { question: "Summarize August for the leadership update", rung: 1 },
  { question: "How does this summer compare to last summer?", rung: 2 },
  { question: "We're setting Q4 targets. What should we expect for December?", rung: 3 },
] as const;

// Opus 5.5, $/MTok (docs, 2026-09-25): input 4, output 20, 5-minute cache write 1.25×, cache read 0.20.
const PRICE = { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 };

type Job = { starter: number; run: number; question: string; rung: 1 | 2 | 3 };
type Result = Job & {
  raw: string;
  parsed: ParsedRound;
  stopReason: string | null;
  usage: Anthropic.Usage;
  ttftMs: number | null;
  totalMs: number;
  costUsd: number;
};

async function runOne(client: Anthropic, job: Job): Promise<Result> {
  const params = buildRoundParams({
    conversation: [{ role: "user", content: job.question }],
    attachData: true,
    rungMap: job.rung > 1 ? { [CONCEPT]: job.rung as 2 | 3 } : {},
    goal: null,
  }, MODEL);

  const start = performance.now();
  let ttftMs: number | null = null;
  const stream = client.messages.stream(params);
  stream.on("text", () => {
    ttftMs ??= performance.now() - start;
  });
  const message = await stream.finalMessage();
  const totalMs = performance.now() - start;

  const raw = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  const u = message.usage;
  const costUsd =
    (u.input_tokens * PRICE.input +
      (u.cache_creation_input_tokens ?? 0) * PRICE.cacheWrite +
      (u.cache_read_input_tokens ?? 0) * PRICE.cacheRead +
      u.output_tokens * PRICE.output) /
    1e6;

  console.info(`starter ${job.starter} run ${job.run}: ${(totalMs / 1000).toFixed(1)} s, ${message.stop_reason}`);
  return { ...job, raw, parsed: parseRound(raw), stopReason: message.stop_reason, usage: u, ttftMs, totalMs, costUsd };
}

async function pool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: size }, worker));
  return results;
}

// --- Report -------------------------------------------------------------------------

const ok = (pass: boolean) => (pass ? "✅" : "❌");
const secs = (ms: number | null) => (ms === null ? "—" : `${(ms / 1000).toFixed(1)} s`);

function autoChecks(r: Result) {
  const cloze = r.parsed.kind === "cloze" ? r.parsed.round : null;
  // The rung map only lists CONCEPT; any other concept Claude picks should echo rung 1 (D66, D67).
  const mappedRung = cloze?.concept === CONCEPT ? r.rung : 1;
  return {
    cloze: cloze !== null,
    concept: cloze?.concept === CONCEPT,
    rungEcho: cloze?.rung === mappedRung,
  };
}

function renderRun(r: Result): string {
  const c = autoChecks(r);
  const head = [
    `## Starter ${r.starter} · rung ${r.rung} · run ${r.run}`,
    `> ${r.question}`,
    "",
    `**Auto:** cloze ${ok(c.cloze)} · concept ${ok(c.concept)} · rung echo ${ok(c.rungEcho)} · ` +
      `TTFT ${secs(r.ttftMs)} · total ${secs(r.totalMs)} · ${r.usage.output_tokens} out tokens · $${r.costUsd.toFixed(3)}`,
    "",
  ];

  if (r.parsed.kind === "plain") {
    return [...head, `**Fell back to plain** (${r.parsed.reason ?? "not significant"}):`, "", r.parsed.text].join("\n");
  }

  const round = r.parsed.round;
  return [
    ...head,
    `**Goal:** ${round.goal} · **concept:** \`${round.concept}\` · **rung echo:** ${round.rung}`,
    "",
    "**Answer** (blank in ⟦ ⟧):",
    "",
    `${round.before}⟦${round.blank}⟧${round.after}`,
    "",
    "**Options:**",
    ...round.options.map((o) => (o.mistake === null ? `- ✅ ${o.text}` : `- ❌ ${o.text} — _${o.mistake}_`)),
    "",
    "**Your read:** ☐ blank on the right concept · ☐ no trap fallen into · ☐ blank derivable from what's on screen · ☐ wrong options are real mistakes",
  ].join("\n");
}

function renderReport(results: Result[]): string {
  const rows = results.map((r) => {
    const c = autoChecks(r);
    const concept = r.parsed.kind === "cloze" ? r.parsed.round.concept : `plain: ${r.parsed.reason}`;
    return `| ${r.starter}.${r.run} | ${r.rung} | ${concept} | ${ok(c.cloze && c.concept)} | ${ok(c.rungEcho)} | ${secs(r.ttftMs)} | ${secs(r.totalMs)} | ${r.usage.output_tokens} | ${r.usage.cache_read_input_tokens ?? 0} | $${r.costUsd.toFixed(3)} |`;
  });
  const total = results.reduce((sum, r) => sum + r.costUsd, 0);
  const mismatches = results.filter((r) => !autoChecks(r).rungEcho).length;

  const table = [
    "| Run | Rung | Concept | Concept ✓ | Rung echo | TTFT | Total | Out tokens | Cache read | Cost |",
    "|---|---|---|---|---|---|---|---|---|---|",
    ...rows,
  ].join("\n");

  return [
    `# Round harness · ${new Date().toISOString()}`,
    `Exit test (M1): every blank on \`${CONCEPT}\`, no trap fallen into. Justin reads all ${results.length}.`,
    table,
    `**Total cost:** $${total.toFixed(2)} · **rung-echo mismatches:** ${mismatches}/${results.length} (open Q4)`,
    "<details><summary>Reading key: trap facts from expected.json (never in a prompt, D65)</summary>",
    "",
    ["```json", JSON.stringify(expected, null, 2), "```"].join("\n"),
    "</details>",
    ...results.map(renderRun),
  ].join("\n\n");
}

async function main() {
  // Re-render a saved run without new API calls: npm run eval:round -- --rerender <dir>
  if (process.argv[2] === "--rerender") {
    const dir = process.argv[3];
    const saved: Result[] = JSON.parse(readFileSync(`${dir}/results.json`, "utf8"));
    writeFileSync(`${dir}/report.md`, renderReport(saved) + "\n");
    console.info(`Re-rendered ${dir}/report.md`);
    return;
  }

  const client = new Anthropic();
  const jobs: Job[] = STARTERS.flatMap((s, i) =>
    Array.from({ length: RUNS }, (_, run) => ({ starter: i + 1, run: run + 1, question: s.question, rung: s.rung })),
  );

  // First call alone writes the cache; the rest can read it.
  const [first, ...rest] = jobs;
  const results = [await runOne(client, first), ...(await pool(rest, CONCURRENCY, (j) => runOne(client, j)))];

  const dir = `evals/round-runs/${new Date().toISOString().replace(/[:.]/g, "-")}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/results.json`, JSON.stringify(results, null, 2) + "\n");
  writeFileSync(`${dir}/report.md`, renderReport(results) + "\n");
  console.info(`Wrote ${dir}/report.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
