// Pure scoring for the M2 mini-eval. Definitions are pre-registered in D92; the decision
// rule is D71 as written. Tested in grade-metrics.test.ts.

export type Label = { answer_sound: boolean | null; why_sound: boolean };
// One grader run on one item; null = the run produced no valid grade (counts against it).
export type Vote = { answer_sound: boolean | null; why_sound: boolean } | null;

// Fields the grader judges: why_sound always, answer_sound only at rungs 2–3 (D92).
const judged = (label: Label) =>
  (label.answer_sound === null ? ["why_sound"] : ["answer_sound", "why_sound"]) as (keyof Label)[];

// The value at least 2 of 3 runs agree on; null when no value reaches a majority.
export function majority(values: (boolean | null | undefined)[]): boolean | null {
  const t = values.filter((v) => v === true).length;
  const f = values.filter((v) => v === false).length;
  const need = Math.floor(values.length / 2) + 1;
  return t >= need ? true : f >= need ? false : null;
}

// D92: every judged boolean's majority matches the label. Invalid runs cast no vote.
export function itemAgrees(label: Label, votes: Vote[]): boolean {
  return judged(label).every((field) => majority(votes.map((v) => v?.[field])) === label[field]);
}

// Diagnostic only (not D71): what a learner gets from the single run production makes.
export function runAgrees(label: Label, vote: Vote): boolean {
  return vote !== null && judged(label).every((field) => vote[field] === label[field]);
}

// Diagnostic only: the runs didn't all give the same verdicts (or one was invalid).
export function flipped(label: Label, votes: Vote[]): boolean {
  const key = (v: Vote) => (v === null ? "invalid" : judged(label).map((f) => v[f]).join(","));
  return new Set(votes.map(key)).size > 1;
}

export function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const i = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[i];
}

export type ModelScore = { model: string; agreement: number; p50Ms: number };
export type Decision = { pick: string | null; reason: string };

// D71, as written before any run: fastest model with ≥ 10/12 agreement, within 1 item of the
// best, warm p50 ≤ 3 s. None pass quality → fix the rubric. None pass speed → fastest that passes quality.
export function decide(scores: ModelScore[], { minAgreement = 10, maxGap = 1, maxP50Ms = 3000 } = {}): Decision {
  const best = Math.max(...scores.map((s) => s.agreement));
  const quality = scores.filter((s) => s.agreement >= minAgreement && s.agreement >= best - maxGap);
  if (quality.length === 0) return { pick: null, reason: "No model passes quality: fix the rubric (D71)." };

  const fastest = (list: ModelScore[]) => list.reduce((a, b) => (b.p50Ms < a.p50Ms ? b : a));
  const speed = quality.filter((s) => s.p50Ms <= maxP50Ms);
  if (speed.length > 0) {
    return { pick: fastest(speed).model, reason: "Fastest model that passes quality and warm p50 ≤ 3 s (D71)." };
  }
  return { pick: fastest(quality).model, reason: "No model meets p50 ≤ 3 s: fastest that passes quality (D71)." };
}

// --- D105 re-verification (rule fixed before the run) ------------------------------------

// Rungs 2–3 have one box (D43). The learner would write conclusion and reasoning together, so
// the box text is the item's answer + why, sent to the grader as both fields.
export function combineItem<T extends { rung: number; answer: string | null; why: string }>(item: T): T {
  const box = [item.answer, item.why].filter(Boolean).join(" ");
  return { ...item, answer: box, why: box };
}

// Pass = at least 6 of the 8 rung 2–3 items agree (majority of 3): within 1 item of Sonnet's
// separate-form 7/8, D71's noise allowance.
export const D105_PASS = 6;
export const D105_ITEMS = 8;
