import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { openRoundStream } from "@/lib/claude";
import { fixturesEnabled, replayFixture } from "@/lib/fixtures";
import { buildRoundParams } from "@/lib/prompts/round";
import { MAX_ROUND_BYTES, RoundRequestSchema } from "@/lib/round-request";

export async function POST(request: NextRequest) {
  // Defense in depth: proxy.ts already checks, but this route spends money, so check again.
  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // E2E checklist: reject oversized payloads before parsing them. The browser sends the
  // whole conversation every time (D55, D110), so this is the cap on what one round can cost.
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_ROUND_BYTES) {
    return NextResponse.json({ error: "payload too large" }, { status: 413 });
  }
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  const parsed = RoundRequestSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid round request" }, { status: 400 });
  const input = parsed.data;

  let chunks: AsyncGenerator<string>;
  try {
    chunks = fixturesEnabled()
      ? replayFixture(input.conversation.at(-1)!.content) // stub mode keys on the latest question
      : await openRoundStream(buildRoundParams(input), request.signal);
  } catch (err) {
    const status = err instanceof Anthropic.APIError ? err.status : undefined;
    console.error("round stream failed to open", { status, err });
    // 429 rate limit / 529 overloaded → "busy, retry"; anything else → upstream failure.
    const busy = status === 429 || status === 529;
    return NextResponse.json({ error: busy ? "busy" : "upstream" }, { status: busy ? 503 : 502 });
  }

  // Pull-based: we only read from Claude as fast as the browser reads from us.
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const { value, done } = await chunks.next();
        if (done) controller.close();
        else controller.enqueue(encoder.encode(value));
      } catch (err) {
        console.error("round stream broke mid-way", err);
        controller.error(err); // browser sees a truncated stream → plain-answer fallback (D57)
      }
    },
    async cancel() {
      await chunks.return(undefined); // browser disconnected → abort the Claude call
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
