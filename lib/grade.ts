import { z } from "zod";

// Key order is output order is reasoning order (D60): reason first in the hidden
// `assessment` (D64), then commit to verdicts, and only then write learner-facing text.
// Every field is required; absent = null (D59).
export const GradeSchema = z.object({
  // Hidden, logged: check the cited evidence against the data before judging (D64).
  assessment: z.string(),
  // Rungs 2–3 only (own-words answer). Null at rung 1, where code checks the pick (Phase 4).
  answer_sound: z.boolean().nullable(),
  // D69: cites on-screen evidence AND that evidence supports the conclusion via the right concept.
  // Can't be true when answer_sound is false (D94).
  why_sound: z.boolean(),
  // The named mistake behind a miss; null when sound.
  mistake: z.string().nullable(),
  // Learner-facing, ≤ 2 sentences. Miss: state the answer and name the mistake. Sound: name their evidence.
  feedback: z.string(),
  // One gap worth fixing, even in a sound answer (rung 3 critique, PRD); null if none.
  gap: z.string().nullable(),
  // One corrective item on the same concept, only when the data supports one (D41); else null.
  corrective_prompt: z.string().nullable(),
});

export type Grade = z.infer<typeof GradeSchema>;

export type ParsedGrade = { kind: "graded"; grade: Grade } | { kind: "invalid"; reason: string };

// A grade we can't trust moves no rung: callers treat "invalid" as "couldn't grade".
export function parseGrade(raw: string, rung: 1 | 2 | 3): ParsedGrade {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { kind: "invalid", reason: "invalid JSON" };
  }

  const parsed = GradeSchema.safeParse(json);
  if (!parsed.success) return { kind: "invalid", reason: "schema mismatch" };

  const g = parsed.data;
  if (rung === 1 && g.answer_sound !== null) return { kind: "invalid", reason: "answer_sound set at rung 1" };
  if (rung !== 1 && g.answer_sound === null) return { kind: "invalid", reason: `answer_sound missing at rung ${rung}` };
  if (g.feedback.trim() === "") return { kind: "invalid", reason: "empty feedback" };

  return { kind: "graded", grade: g };
}
