// Follow-up check: does the summer question, asked after August, give a round a learner can pass?
// D111 (first run) checked only the concept label, a proxy; run 3 passed it with a two-concept
// blank. D115 (this version) checks what the learner faces: M2's hand-labeled sound answers
// (g06, g08, single box as in D105) are graded by the real grader on every round.
// Only the history changes vs M1: round 1 is a fixed, real Opus reply (verbatim, D110), and
// the rung map is what the staircase sends after a correct August. One single-turn control
// (M1's setup) is reported beside the rule, not in it.
//
// Run: npx tsx --env-file=.env.local evals/followup-check.ts   (real API calls, ~$0.45)
// Writes evals/followup-runs/<timestamp>/{report.md, results.json}.

import Anthropic from "@anthropic-ai/sdk";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { DEFAULT_ROUND_MODEL, gradeModel } from "@/lib/claude";
import { parseGrade } from "@/lib/grade";
import { buildGradeParams } from "@/lib/prompts/grade";
import { buildRoundParams, type RoundTurn } from "@/lib/prompts/round";
import { parseRound, type ClozeRound } from "@/lib/round";
import { combineItem } from "./grade-metrics";

const MODEL = DEFAULT_ROUND_MODEL; // always Opus, whatever ROUND_MODEL says (D81)
const GRADER = gradeModel(); // Sonnet 5.5 unless GRADE_MODEL says otherwise (D97)
const RUNS = 3;
const CONCEPT = "seasonality_vs_trend";
const RUNG = 2;
const PASS_AT = 2; // D115: ≥ 2/3 rounds where both answers are graded sound, fixed before the run

const ROUND1_QUESTION = "Summarize August for the leadership update";
const ROUND1_REPLY = readFileSync("evals/followup-runs/august-round1.txt", "utf8");
const FOLLOWUP = "How does this summer compare to last summer?";

type Item = { id: string; rung: number; answer: string | null; why: string };
const ITEMS: Item[] = JSON.parse(readFileSync("evals/grader-items.json", "utf8")).items;
const LEARNERS = ["g06", "g08"].map((id) => combineItem(ITEMS.find((i) => i.id === id)!)); // both labeled sound + sound

// $/MTok (docs, 2026-09-25). Opus 5.5: 4 / 20, write 5, read 0.20. Sonnet 5.5: 2 / 10, write 2.5, read 0.20.
const PRICE = {
  round: { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
  grade: { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
};
const cost = (u: Anthropic.Usage, p: typeof PRICE.round) =>
  (u.input_tokens * p.input +
    u.output_tokens * p.output +
    (u.cache_creation_input_tokens ?? 0) * p.cacheWrite +
    (u.cache_read_input_tokens ?? 0) * p.cacheRead) /
  1e6;

async function gradeAll(client: Anthropic, round: ClozeRound) {
  const grades = [];
  for (const l of LEARNERS) {
    const message = await client.messages.create(buildGradeParams({ round, pick: null, answer: l.answer, why: l.why }, GRADER));
    const parsed = parseGrade(message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join(""), round.rung);
    const grade = parsed.kind === "graded" ? parsed.grade : null;
    const sound = grade?.answer_sound === true && grade.why_sound;
    grades.push({ id: l.id, sound, grade, costUsd: cost(message.usage, PRICE.grade) });
  }
  return grades;
}

async function runOne(client: Anthropic, label: string, conversation: RoundTurn[]) {
  const params = buildRoundParams({ conversation, attachData: true, rungMap: { [CONCEPT]: RUNG }, goal: null }, MODEL);
  const start = performance.now();
  const message = await client.messages.stream(params).finalMessage();
  const seconds = (performance.now() - start) / 1000;
  const raw = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
  const parsed = parseRound(raw);
  const round = parsed.kind === "cloze" ? parsed.round : null;
  const grades = round ? await gradeAll(client, round) : [];
  const pass = grades.length === LEARNERS.length && grades.every((g) => g.sound);
  const costUsd = cost(message.usage, PRICE.round) + grades.reduce((sum, g) => sum + g.costUsd, 0);
  const verdicts = grades.map((g) => `${g.id} ${g.sound ? "✅" : "❌"}`).join(" ");
  console.info(`${label}: ${round ? `${round.concept} rung ${round.rung}` : "plain"} · ${verdicts} → ${pass ? "PASS" : "FAIL"}`);
  return { label, pass, round, grades, stopReason: message.stop_reason, usage: message.usage, seconds, costUsd, raw };
}

type Result = Awaited<ReturnType<typeof runOne>>;

function renderReport(results: Result[], control: Result) {
  const passes = results.filter((r) => r.pass).length;
  const total = [...results, control].reduce((sum, r) => sum + r.costUsd, 0);
  const row = (r: Result) =>
    `| ${r.label} | ${r.round?.concept ?? "plain"} | ${r.round?.rung ?? "–"} | ${r.grades.map((g) => `${g.id} ${g.sound ? "✅" : "❌"}`).join(" · ")} | ${r.pass ? "✅" : "❌"} | ${r.round?.blank ?? ""} |`;
  const bodies = [...results, control].map(({ label, round, grades, raw }) => {
    if (!round) return `## ${label}: plain\n\n${raw}`;
    return [
      `## ${label}: ${round.concept} (rung ${round.rung})`,
      `**Goal:** ${round.goal}`,
      round.before + ` **[${round.blank}]** ` + round.after,
      "**Grades:**",
      ...grades.map((g) => `- ${g.id}: ${g.sound ? "sound" : "not sound"}. ${g.grade?.feedback ?? "(unparseable)"}`),
    ].join("\n\n");
  });
  return [
    "# D115 follow-up check: can a sound answer pass?",
    `Round 1: "${ROUND1_QUESTION}" (fixed real reply) → "${FOLLOWUP}" · rung map \`{${CONCEPT}: ${RUNG}}\` · rounds ${MODEL}, grades ${GRADER}`,
    `**Result: ${passes}/${results.length} rounds where g06 and g08 are both graded sound → ${passes >= PASS_AT ? "PASS" : "FAIL"}** (rule: ≥ ${PASS_AT}/${results.length}, D115) · control (single-turn): ${control.pass ? "✅" : "❌"} · cost $${total.toFixed(2)}`,
    "| Round | Concept | Rung | Grades | Pass | Blank |\n|---|---|---|---|---|---|\n" + [...results, control].map(row).join("\n"),
    ...bodies,
  ].join("\n\n");
}

async function main() {
  const client = new Anthropic();
  const followup: RoundTurn[] = [
    { role: "user", content: ROUND1_QUESTION },
    { role: "assistant", content: ROUND1_REPLY },
    { role: "user", content: FOLLOWUP },
  ];
  const results: Result[] = [];
  for (let run = 1; run <= RUNS; run++) results.push(await runOne(client, `follow-up ${run}`, followup)); // sequential: cache reads
  const control = await runOne(client, "control (single-turn)", [{ role: "user", content: FOLLOWUP }]);
  const dir = `evals/followup-runs/${new Date().toISOString().replace(/[:.]/g, "-")}`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/results.json`, JSON.stringify({ results, control }, null, 2) + "\n");
  writeFileSync(`${dir}/report.md`, renderReport(results, control) + "\n");
  console.info(`Wrote ${dir}/report.md`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
