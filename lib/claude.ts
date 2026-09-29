import Anthropic from "@anthropic-ai/sdk";

// Round call. D51: Opus in production and in the M1 harness. D81: ROUND_MODEL may point dev at Haiku.
// M0 streams plain text; M1 adds the system prompt and the ROUND schema.
export const DEFAULT_ROUND_MODEL = "claude-opus-5-5";

// Model-coupled settings live in code (reviewed in diffs, tuned by the M1 harness); only the model is env.
// Thinking tokens count against max_tokens. Hitting it truncates the reply, so M1 should measure real usage.
const HAIKU = { max_tokens: 8000 }; // Haiku 4.5 rejects `effort` (400); no thinking → fast dev loop
const ROUND_PARAMS = {
  // Opus 5.5: thinking is always on; effort is the depth knob (API default "medium", set explicitly).
  "claude-opus-5-5": { max_tokens: 16000, output_config: { effort: "medium" } },
  "claude-haiku-4-5": HAIKU,
  "claude-haiku-4-5-20251001": HAIKU,
} satisfies Record<string, Partial<Anthropic.MessageStreamParams>>;

type RoundModel = keyof typeof ROUND_PARAMS;

// Rejects oversized requests before they cost anything (E2E checklist).
export const MAX_MESSAGE_CHARS = 4000;

// Model + its model-coupled settings, validated against the allow-list. Shared by the M0
// plain-text request and the M1 structured round request (lib/prompts/round.ts).
export function roundModelParams(model: string = process.env.ROUND_MODEL || DEFAULT_ROUND_MODEL) {
  if (!(model in ROUND_PARAMS)) {
    throw new Error(`ROUND_MODEL "${model}" is not one of: ${Object.keys(ROUND_PARAMS).join(", ")}`);
  }
  return { model, ...ROUND_PARAMS[model as RoundModel] } as Pick<
    Anthropic.MessageStreamParams,
    "model" | "max_tokens" | "output_config"
  >;
}

export function roundRequest(message: string, model?: string): Anthropic.MessageStreamParams {
  return { ...roundModelParams(model), messages: [{ role: "user", content: message }] };
}

type StreamEvent = Anthropic.MessageStreamEvent;
export type StopInfo = Pick<Anthropic.MessageDeltaEvent["delta"], "stop_reason" | "stop_details">;

// Keeps only the visible answer text. Thinking arrives as separate blocks (empty text by default), so it's skipped.
// onStop reports why the reply ended; a "refusal" leaves empty or partial text (D91: no fallbacks).
export async function* textChunks(
  events: AsyncIterable<StreamEvent>,
  onStop?: (stop: StopInfo) => void,
): AsyncGenerator<string> {
  for await (const event of events) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    } else if (event.type === "message_delta") {
      onStop?.({ stop_reason: event.delta.stop_reason, stop_details: event.delta.stop_details ?? null });
    }
  }
}

// Resolves once Anthropic has accepted the request (HTTP 200), so auth/rate-limit/overload
// errors throw here, before the route commits to a streaming 200. The SDK retries 429/5xx twice first.
// Stopping iteration early (browser left) aborts the upstream call via the SDK iterator's return().
export async function openRoundStream(message: string, signal: AbortSignal): Promise<AsyncGenerator<string>> {
  const client = new Anthropic(); // constructed per call: reads ANTHROPIC_API_KEY at request time, not build time
  const params = roundRequest(message);
  const stream = client.messages.stream(params, { signal });
  const { request_id } = await stream.withResponse();
  console.info("round stream opened", { model: params.model, request_id });
  // The 200 is already committed, so the browser handles empty or partial text (D91); this makes it visible in logs.
  return textChunks(stream, (stop) => {
    const log = stop.stop_reason === "end_turn" ? console.info : console.warn;
    log("round stream stopped", { request_id, ...stop });
  });
}
