import type { Turn } from "./conversation";

// D36: the golden path is ladder, then breadth. The three starters walk one concept up the
// rungs (they match the M1 harness exactly, so stub mode maps each to its fixture); after the
// top rung, "Keep going" offers the other traps.
export const STARTERS = [
  "Summarize August for the leadership update",
  "How does this summer compare to last summer?",
  "We're setting Q4 targets. What should we expect for December?",
] as const;

// Breadth questions (retention, May). No artboard has this copy: proposed in M4.5, worded so the
// question doesn't give away the finding.
export const BREADTH = ["How is retention holding up?", "Did the May launch work?"] as const;

const NEXT: Record<string, readonly string[]> = {
  [STARTERS[0]]: [STARTERS[1]],
  [STARTERS[1]]: [STARTERS[2]],
  [STARTERS[2]]: BREADTH,
  [BREADTH[0]]: [BREADTH[1]],
  [BREADTH[1]]: [BREADTH[0]],
};

// Chips under the latest turn once it's finished (graded, revealed, or a plain reply), never
// while it's streaming, answering, or grading. Only along the golden path; nothing already asked.
export function keepGoing(turns: Turn[]): string[] {
  const last = turns.at(-1);
  if (!last || !["graded", "revealed", "plain"].includes(last.round.status)) return [];
  const asked = new Set(turns.map((t) => t.question));
  return (NEXT[last.question] ?? []).filter((q) => !asked.has(q));
}
