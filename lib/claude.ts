import Anthropic from "@anthropic-ai/sdk";

// Round call (D51: Opus). M0 streams plain text; M1 adds the system prompt and the ROUND schema.
export const ROUND_MODEL = "claude-opus-5-5";
// Opus 5.5: thinking is always on (can't be disabled); effort is the depth knob, default "medium".
// Set explicitly so the M1 harness can tune it on purpose.
export const ROUND_EFFORT = "medium";
// Thinking tokens count against this too. Hitting it truncates the reply, so M1 should measure real usage.
export const ROUND_MAX_TOKENS = 16000;
// Rejects oversized requests before they cost anything (E2E checklist).
export const MAX_MESSAGE_CHARS = 4000;

type StreamEvent = Anthropic.MessageStreamEvent;

// Keeps only the visible answer text. Thinking arrives as separate blocks (empty text by default), so it's skipped.
export async function* textChunks(events: AsyncIterable<StreamEvent>): AsyncGenerator<string> {
  for await (const event of events) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      yield event.delta.text;
    }
  }
}

// Resolves once Anthropic has accepted the request (HTTP 200), so auth/rate-limit/overload
// errors throw here, before the route commits to a streaming 200. The SDK retries 429/5xx twice first.
// Stopping iteration early (browser left) aborts the upstream call via the SDK iterator's return().
export async function openRoundStream(message: string, signal: AbortSignal): Promise<AsyncGenerator<string>> {
  const client = new Anthropic(); // constructed per call: reads ANTHROPIC_API_KEY at request time, not build time
  const stream = client.messages.stream(
    {
      model: ROUND_MODEL,
      max_tokens: ROUND_MAX_TOKENS,
      output_config: { effort: ROUND_EFFORT },
      messages: [{ role: "user", content: message }],
    },
    { signal },
  );
  const { request_id } = await stream.withResponse();
  console.info("round stream opened", { request_id });
  return textChunks(stream);
}
