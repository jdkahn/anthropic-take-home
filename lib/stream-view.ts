import { RoundSchema, type RawRound } from "./round";

// Pure helpers that turn a streaming (partial) round into what the screen shows.

const KEYS = Object.keys(RoundSchema.shape) as (keyof RawRound)[];

// Output order = schema order (D60), so a field is final once the next field has started.
// The last field (options) is only final at streamEnd, which the reducer handles.
export function isComplete(preview: Partial<RawRound> | null, key: keyof RawRound): boolean {
  const next = KEYS[KEYS.indexOf(key) + 1];
  return preview !== null && next !== undefined && next in preview;
}

// The round prompt ends `before` with the blank's lead-in (M1 prompt §5): usually a heading
// ("What this means") and, at rung 1, the start of the sentence the blank completes. The
// "Your turn" panel shows them; the body above keeps the rest.
export type LeadIn = { body: string; label: string | null; leadIn: string };

const HEADING = /^#{1,6}\s+(.*?)\s*#*\s*$/;

export function splitLeadIn(before: string): LeadIn {
  const lines = before.replace(/\s+$/, "").split("\n");
  let label: string | null = null;
  let leadIn = "";

  const last = lines.at(-1) ?? "";
  const heading = HEADING.exec(last);
  if (heading) {
    label = heading[1];
    lines.pop();
  } else if (last.trim() !== "") {
    leadIn = last.trim();
    lines.pop();
    while (lines.length > 0 && lines.at(-1)!.trim() === "") lines.pop();
    const above = HEADING.exec(lines.at(-1) ?? "");
    if (above) {
      label = above[1];
      lines.pop();
    }
  }
  return { body: lines.join("\n").replace(/\s+$/, ""), label, leadIn };
}

// A half-streamed code fence would render the rest of the answer as code; close it for display.
export function closeOpenFence(markdown: string): string {
  const fences = markdown.split("\n").filter((line) => /^\s*(```|~~~)/.test(line)).length;
  return fences % 2 === 1 ? `${markdown}\n\`\`\`` : markdown;
}

// Reasons a round ended as plain text that the learner should hear about (M1 Q7, D91).
// Other reasons (cloze validation failures) degrade silently to a plain answer (D8).
export function plainNotice(reason: string | null, hasText: boolean): string | null {
  switch (reason) {
    case "stopped":
      return "You stopped this reply.";
    case "invalid JSON":
    case "schema mismatch":
      return hasText
        ? "This reply was cut off. Ask again to get the full answer."
        : "Claude couldn't answer that one. Try asking again, or rephrase it.";
    case "busy":
      return "Claude is busy right now. Try again in a moment.";
    case "rate_limited":
      return "You're sending messages faster than this prototype allows. Wait a minute, then try again.";
    case "upstream":
    case "network":
      return "Something went wrong reaching Claude. Try again.";
    default:
      return null;
  }
}
