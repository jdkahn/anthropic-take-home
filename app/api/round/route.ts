import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, isValidSession } from "@/lib/auth";
import { MAX_MESSAGE_CHARS, openRoundStream } from "@/lib/claude";
import { fixturesEnabled, replayFixture } from "@/lib/fixtures";

export async function POST(request: NextRequest) {
  // Defense in depth: proxy.ts already checks, but this route spends money, so check again.
  if (!isValidSession(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "empty message" }, { status: 400 });
  if (message.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json({ error: "message too long" }, { status: 413 });
  }

  let chunks: AsyncGenerator<string>;
  try {
    chunks = fixturesEnabled() ? replayFixture(message) : await openRoundStream(message, request.signal);
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
