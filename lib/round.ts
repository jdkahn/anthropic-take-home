import { z } from "zod";

// The curated analysis pack (D17). Other domains use concepts Claude names itself (D34).
export const ANALYSIS_CONCEPTS = [
  "seasonality_vs_trend",
  "correlation_vs_causation",
  "small_sample_noise",
  "missing_denominator",
  "averages_hiding_segments",
] as const;

// mistake: null marks the correct option (D61).
const RoundOption = z.object({
  text: z.string(),
  mistake: z.string().nullable(),
});

// Key order is output order is reasoning order (D60): decide significance, commit to a
// goal, then pick the concept and rung, and only then write the answer around the blank.
// Every field is required; absent = null. Structured outputs can't express
// "exactly 4 options", so parseRound() checks that.
export const RoundSchema = z.object({
  significant: z.boolean(),
  goal: z.string().nullable(),
  domain: z.enum(["analysis", "other"]).nullable(),
  concept: z.string().nullable(),
  rung: z.literal([1, 2, 3]).nullable(),
  before: z.string(),
  blank: z.string().nullable(),
  after: z.string().nullable(),
  options: z.array(RoundOption).nullable(),
});

export type RawRound = z.infer<typeof RoundSchema>;

export type ClozeRound = {
  goal: string;
  domain: "analysis" | "other";
  concept: string;
  rung: 1 | 2 | 3;
  before: string;
  blank: string;
  after: string;
  options: { text: string; mistake: string | null }[];
};

export type ParsedRound =
  | { kind: "cloze"; round: ClozeRound }
  | { kind: "plain"; text: string; reason: string | null };

// Browser-side parse of the finished stream (D57). Anything invalid degrades to a
// plain answer, never a blank screen (D8).
export function parseRound(raw: string): ParsedRound {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { kind: "plain", text: raw, reason: "invalid JSON" };
  }

  const parsed = RoundSchema.safeParse(json);
  if (!parsed.success) {
    return { kind: "plain", text: raw, reason: "schema mismatch" };
  }

  const r = parsed.data;
  if (!r.significant) return { kind: "plain", text: r.before, reason: null };

  const problem = clozeProblem(r);
  if (problem) {
    // Keep the whole answer: put Claude's wording of the inference back in place.
    const text = [r.before, r.blank, r.after].filter(Boolean).join("");
    return { kind: "plain", text, reason: problem };
  }

  return { kind: "cloze", round: r as ClozeRound };
}

function clozeProblem(r: RawRound): string | null {
  const { goal, domain, concept, rung, blank, after, options } = r;
  if (goal === null || domain === null || concept === null || rung === null) {
    return "significant round missing goal, domain, concept, or rung";
  }
  if (blank === null || after === null) return "significant round missing blank or after";
  if (options === null || options.length !== 4) return "expected exactly 4 options";

  const correct = options.filter((o) => o.mistake === null);
  if (correct.length !== 1) return "expected exactly one correct option";
  if (options.some((o) => o.mistake !== null && o.mistake.trim() === "")) {
    return "wrong option with an empty mistake";
  }

  if (domain === "analysis" && !(ANALYSIS_CONCEPTS as readonly string[]).includes(concept)) {
    return `concept "${concept}" is not in the analysis pack`;
  }
  return null;
}
