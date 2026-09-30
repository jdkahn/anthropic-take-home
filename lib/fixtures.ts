import { setTimeout as sleep } from "node:timers/promises";
import august from "@/fixtures/rounds/august-rung1.json";
import december from "@/fixtures/rounds/december-rung3.json";
import plain from "@/fixtures/rounds/plain-synthetic.json";
import summer from "@/fixtures/rounds/summer-rung2.json";
import rung1Sound from "@/fixtures/grades/rung1-sound-synthetic.json";
import rung1WeakWhy from "@/fixtures/grades/rung1-weak-why-synthetic.json";
import rung1WrongPick from "@/fixtures/grades/rung1-wrong-pick-synthetic.json";
import rung2Miss from "@/fixtures/grades/rung2-miss.json";
import rung2Sound from "@/fixtures/grades/rung2-sound.json";
import rung3Miss from "@/fixtures/grades/rung3-miss.json";
import rung3Sound from "@/fixtures/grades/rung3-sound.json";
import type { GradeInput } from "./prompts/grade";

// Stub mode (D51): USE_FIXTURES=1 makes /api/round replay a recorded Opus round instead of
// calling Claude. Rounds are M1 harness runs 1.2, 2.2, 3.1 (the ones Justin read, D90). Opus
// writes compact JSON, so JSON.stringify gives back the exact bytes it streamed.
// Never on the production deployment, even if the env var leaks there.
export function fixturesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.USE_FIXTURES === "1" && env.VERCEL_ENV !== "production";
}

const STARTERS: Record<string, unknown> = {
  "Summarize August for the leadership update": august,
  "How does this summer compare to last summer?": summer,
  "We're setting Q4 targets. What should we expect for December?": december,
};

// Starter questions get their round; dev commands exercise the fallbacks (D8, D91);
// anything else gets the August round so free typing still reaches a cloze.
export function fixtureText(message: string): string {
  const augustText = JSON.stringify(august);
  switch (message) {
    case "/plain":
      return JSON.stringify(plain); // significant: false
    case "/truncated":
      return augustText.slice(0, Math.floor(augustText.length * 0.6)); // stream broke mid-way
    case "/empty":
      return ""; // e.g. a refusal before any text
    default:
      return JSON.stringify(STARTERS[message] ?? august);
  }
}

// Uneven, deterministic chunk sizes, so chunk boundaries land mid-key and mid-escape the way
// real text deltas do.
const CHUNK_SIZES = [4, 11, 7, 16, 3, 9];

export function chunkText(text: string): string[] {
  const chunks: string[] = [];
  for (let i = 0, n = 0; i < text.length; n++) {
    const size = CHUNK_SIZES[n % CHUNK_SIZES.length];
    chunks.push(text.slice(i, i + size));
    i += size;
  }
  return chunks;
}

// Faster than Opus (14–24 s to first token, ~3.6 ms per character) so clicking through stays quick,
// but slow enough to watch the loading state and the text streaming in.
export const REPLAY_PACE = { firstTokenMs: 1500, msPerChar: 1 };

// Same shape as openRoundStream(), so the route streams it the same way. No abort signal:
// when the browser leaves, the route's cancel() calls return() and the replay stops.
export async function* replayFixture(message: string, pace = REPLAY_PACE): AsyncGenerator<string> {
  await sleep(pace.firstTokenMs);
  for (const chunk of chunkText(fixtureText(message))) {
    yield chunk;
    await sleep(chunk.length * pace.msPerChar);
  }
}

// Grades for stub mode. Rungs 2–3 are real Sonnet 5.5 grades from the M2 run (items g06, g07,
// g11, g12, whose rounds match the summer and December fixtures). Rung 1 grades are synthetic:
// the M2 rung-1 items used a different round, so their feedback wouldn't match August.
// Rung 1: code decides the pick (Phase 4), so a wrong pick gets the miss. "/miss" anywhere in
// the learner's text forces the miss path (rung 1 with a right pick: the weak-why grade).
export const GRADE_DELAY_MS = 2000; // Sonnet's warm p50 is ~4.8 s (D97); shorter keeps clicking quick

export function fixtureGrade({ round, pick, answer, why }: GradeInput): string {
  const forceMiss = [answer, why].some((t) => t?.includes("/miss"));
  if (round.rung === 1) {
    const correct = round.options.find((o) => o.mistake === null)?.text;
    if (pick !== null && pick !== correct) return JSON.stringify(rung1WrongPick);
    return JSON.stringify(forceMiss ? rung1WeakWhy : rung1Sound);
  }
  if (round.rung === 2) return JSON.stringify(forceMiss ? rung2Miss : rung2Sound);
  return JSON.stringify(forceMiss ? rung3Miss : rung3Sound);
}
