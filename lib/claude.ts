import Anthropic from "@anthropic-ai/sdk";

// Round call. D51: Opus in production and in the M1 harness. D81: ROUND_MODEL may point dev at Haiku.
// Params are built by buildRoundParams() (lib/prompts/round.ts): system prompt, data, conversation, ROUND schema.
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

// Grader candidates, frozen by D92 before any eval run (D93 dropped Haiku; D96 re-added it with the
// config proposed in D92 before any results: no thinking). Each model's
// fastest config that fits D64 (reasoning lives in the `assessment` field, not in thinking).
// Same max_tokens for both. grade.test.ts pins these so they can't drift after results.
const GRADE_PARAMS = {
  "claude-sonnet-5-5": { max_tokens: 4000, thinking: { type: "between_tools" }, output_config: { effort: "low" } },
  "claude-opus-5-5": { max_tokens: 4000, output_config: { effort: "low" } }, // thinking can't be off
  "claude-haiku-4-5": { max_tokens: 4000 }, // no thinking; Haiku 4.5 rejects `effort`
} satisfies Record<string, Partial<Anthropic.MessageCreateParamsNonStreaming>>;

export type GradeModel = keyof typeof GRADE_PARAMS;
export const GRADE_MODELS = Object.keys(GRADE_PARAMS) as GradeModel[];

// D97: the M2 mini-eval picked Sonnet 5.5 by D71's rule. GRADE_MODEL can point dev elsewhere
// (like ROUND_MODEL, D81), but only at a candidate the eval measured.
export const DEFAULT_GRADE_MODEL: GradeModel = "claude-sonnet-5-5";

export function gradeModel(model: string = process.env.GRADE_MODEL || DEFAULT_GRADE_MODEL): GradeModel {
  if (!GRADE_MODELS.includes(model as GradeModel)) {
    throw new Error(`GRADE_MODEL "${model}" is not one of: ${GRADE_MODELS.join(", ")}`);
  }
  return model as GradeModel;
}

export function gradeModelParams(model: GradeModel) {
  return { model, ...GRADE_PARAMS[model] } as Pick<
    Anthropic.MessageCreateParamsNonStreaming,
    "model" | "max_tokens" | "thinking" | "output_config"
  >;
}

// Model + its model-coupled settings, validated against the allow-list. Used by buildRoundParams().
export function roundModelParams(model: string = process.env.ROUND_MODEL || DEFAULT_ROUND_MODEL) {
  if (!(model in ROUND_PARAMS)) {
    throw new Error(`ROUND_MODEL "${model}" is not one of: ${Object.keys(ROUND_PARAMS).join(", ")}`);
  }
  return { model, ...ROUND_PARAMS[model as RoundModel] } as Pick<
    Anthropic.MessageStreamParams,
    "model" | "max_tokens" | "output_config"
  >;
}

type StreamEvent = Anthropic.MessageStreamEvent;
export type StopInfo = Pick<Anthropic.MessageDeltaEvent["delta"], "stop_reason" | "stop_details">;

// Keeps only the visible answer text. Thinking arrives as separate blocks (empty text by default), so it's skipped.
// onStop reports why the reply ended; a "refusal" leaves empty or partial text (D91: no fallbacks).
// Its usage shows whether the cache hit (cache_read_input_tokens, D110).
export async function* textChunks(
  events: AsyncIterable<StreamEvent>,
  onStop?: (stop: StopInfo, usage: Anthropic.MessageDeltaUsage) => void,
): AsyncGenerator<string> {
  for await (const event of events) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    } else if (event.type === "message_delta") {
      onStop?.({ stop_reason: event.delta.stop_reason, stop_details: event.delta.stop_details ?? null }, event.usage);
    }
  }
}

// Resolves once Anthropic has accepted the request (HTTP 200), so auth/rate-limit/overload
// errors throw here, before the route commits to a streaming 200. The SDK retries 429/5xx twice first.
// Stopping iteration early (browser left) aborts the upstream call via the SDK iterator's return().
export async function openRoundStream(
  params: Anthropic.MessageStreamParams,
  signal: AbortSignal,
): Promise<AsyncGenerator<string>> {
  const client = new Anthropic(); // constructed per call: reads ANTHROPIC_API_KEY at request time, not build time
  const stream = client.messages.stream(params, { signal });
  const { request_id } = await stream.withResponse();
  console.info("round stream opened", { model: params.model, request_id });
  // The 200 is already committed, so the browser handles empty or partial text (D91); this makes it visible in logs.
  return textChunks(stream, (stop, usage) => {
    const log = stop.stop_reason === "end_turn" ? console.info : console.warn;
    const { input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens } = usage;
    log("round stream stopped", {
      request_id,
      ...stop,
      usage: { input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens },
    });
  });
}

// One grade, not streamed: the reply is ~300 tokens and the browser needs all of it to parse (D57).
// The browser's 20 s timeout (D103) aborts `signal`, which cancels the call. Errors throw for the
// route to map. Returns the raw text; an empty or partial reply fails parseGrade() in the browser.
export async function gradeReply(params: Anthropic.MessageCreateParamsNonStreaming, signal: AbortSignal): Promise<string> {
  const client = new Anthropic();
  const { data: message, request_id } = await client.messages.create(params, { signal }).withResponse();
  const { stop_reason, usage } = message;
  const { input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens } = usage;
  const log = stop_reason === "end_turn" ? console.info : console.warn;
  log("grade done", {
    model: params.model,
    request_id,
    stop_reason,
    usage: { input_tokens, cache_read_input_tokens, cache_creation_input_tokens, output_tokens },
  });
  return message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
}
