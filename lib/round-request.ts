import { z } from "zod";
import type { Turn } from "./conversation";
import type { RoundInput } from "./prompts/round";
import { rungMap } from "./staircase";

// Browser ↔ /api/round. The server keeps nothing (D55), so every request carries the whole
// conversation. Past assistant turns are the raw text Claude streamed, verbatim (D110).

// E2E checklist: reject oversized payloads before they cost anything. A round is ~3–5 KB of
// raw JSON, so 200 KB fits ~40 rounds; worst case ≈ 50k input tokens ≈ $0.20 on Opus 5.5.
export const MAX_ROUND_BYTES = 200_000;
export const MAX_MESSAGE_CHARS = 4_000;
const MAX_REPLY_CHARS = 20_000; // a round's visible JSON is ~4–5k chars
const MAX_GOAL_CHARS = 500;

// Refine, not .trim(): trimming would transform the text, and assistant turns go back verbatim.
const nonBlank = (max: number) => z.string().max(max).refine((s) => s.trim() !== "", "blank");

export const RoundRequestSchema = z.object({
  conversation: z
    .array(
      z.discriminatedUnion("role", [
        z.object({ role: z.literal("user"), content: nonBlank(MAX_MESSAGE_CHARS) }),
        z.object({ role: z.literal("assistant"), content: nonBlank(MAX_REPLY_CHARS) }),
      ]),
    )
    // user, assistant, user, …, user: alternating, and it ends with the learner's latest message.
    .refine((c) => c.length % 2 === 1 && c.every((t, i) => t.role === (i % 2 === 0 ? "user" : "assistant")), "turn order"),
  attachData: z.boolean(),
  rungMap: z.record(z.string().max(64), z.literal([2, 3])).refine((m) => Object.keys(m).length <= 20, "too many concepts"),
  goal: z.string().max(MAX_GOAL_CHARS).nullable(),
}) satisfies z.ZodType<RoundInput>;

// Builds the request for a new question from the turns so far. A turn with no reply (the
// request failed, or it was stopped before any text) is dropped along with its question (D110).
// The rung map comes from the turns (D113); the goal stays null until goal edit lands (D40).
export function roundRequestBody(turns: Turn[], question: string, attached: boolean): RoundInput {
  const conversation: RoundInput["conversation"] = [];
  for (const turn of turns) {
    if (turn.reply.trim() === "") continue;
    conversation.push({ role: "user", content: turn.question }, { role: "assistant", content: turn.reply });
  }
  conversation.push({ role: "user", content: question });
  // Data rides on the first message, so the first turn decides (starters attach it, D37).
  return { conversation, attachData: turns[0]?.attached ?? attached, rungMap: rungMap(turns), goal: null };
}
