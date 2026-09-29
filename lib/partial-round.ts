import type { RawRound } from "./round";

// Display-only view of a round that is still streaming (D76). parseRound() on the finished
// text stays the single source of truth (D57); nothing here drives state transitions.
//
// Repair-and-parse: scan the buffer, close whatever is open, JSON.parse. Returns null when
// no suffix gives a correct partial value (dangling key, after ":" or ",", half a literal);
// the caller keeps its last good snapshot, which costs one stale chunk and is never wrong.
export function parsePartialRound(buffer: string): Partial<RawRound> | null {
  const repaired = repairJson(buffer);
  if (repaired === null) return null;
  try {
    const value: unknown = JSON.parse(repaired);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
    return value as Partial<RawRound>;
  } catch {
    return null;
  }
}

// Exported for tests. Only three pieces of state: brackets inside a string are text, the
// character after a backslash is never structure, and the stack says what to close.
export function repairJson(buffer: string): string | null {
  const closers: string[] = [];
  let inString = false;
  let escaped = false;
  let escapeAt = -1; // index of the last backslash that started an escape

  for (let i = 0; i < buffer.length; i++) {
    const c = buffer[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") {
        escaped = true;
        escapeAt = i;
      } else if (c === '"') inString = false;
    } else if (c === '"') inString = true;
    else if (c === "{") closers.push("}");
    else if (c === "[") closers.push("]");
    else if (c === "}" || c === "]") closers.pop();
  }

  let text = buffer;
  if (inString) {
    // An incomplete escape (`\` or `\u00`) becomes part of whatever we append, so drop it.
    if (escaped || /^u[0-9a-fA-F]{0,3}$/.test(buffer.slice(escapeAt + 1))) {
      text = buffer.slice(0, escapeAt);
    }
    text += '"';
  }
  if (text.trim() === "") return null;
  return text + closers.reverse().join("");
}
