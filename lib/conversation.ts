import { outcome } from "./grading";
import { initialRound, roundReducer, type RoundAction, type RoundState } from "./round-reducer";
import type { FirstAttempt } from "./staircase";

// The chat: a list of turns, one round each (D77: useReducer + one context).
// Only the latest turn is live. Send is blocked while it streams or grades (D103), and
// older rounds are read-only, so at most one round ever has async work in flight.

// reply: the raw text Claude streamed, kept when streaming ends; it goes back to Claude verbatim
// as this turn's history (D110). "" while streaming, or when no text arrived.
// firstAttempt: the attempt-1 result, recorded once; the staircase reads only this (D108, D113).
export type Turn = {
  id: number;
  question: string;
  attached: boolean;
  reply: string;
  firstAttempt: FirstAttempt | null;
  round: RoundState;
};
export type Conversation = { turns: Turn[] };

export type ConversationAction =
  | { type: "send"; question: string; attached: boolean }
  | { type: "round"; action: RoundAction } // always the latest turn
  | { type: "reset" };

export const emptyConversation: Conversation = { turns: [] };

export function conversationReducer(state: Conversation, action: ConversationAction): Conversation {
  switch (action.type) {
    case "send": {
      if (isBusy(state)) return state;
      // D117: moving on from an unanswered round shows its answer, recorded as a skip.
      const moved = applyToLatest(state, { type: "skip" });
      return {
        turns: [
          ...moved.turns,
          { id: state.turns.length, question: action.question, attached: action.attached, reply: "", firstAttempt: null, round: initialRound },
        ],
      };
    }
    case "round":
      return applyToLatest(state, action.action);
    case "reset":
      return emptyConversation;
  }
}

// Round actions always go to the latest turn; older turns are read-only (D103).
function applyToLatest(state: Conversation, action: RoundAction): Conversation {
  const last = state.turns.at(-1);
  if (!last) return state;
  const round = roundReducer(last.round, action);
  if (round === last.round) return state;
  // The round reducer drops the raw text once it parses it; keep it here for the history.
  const reply = last.round.status === "streaming" && round.status !== "streaming" ? last.round.raw : last.reply;
  // Recorded once: a rung-3 revision's later grades replace `grade` and `lastGrade` (D108, D113).
  const firstAttempt = last.firstAttempt ?? firstAttemptOf(round);
  return { turns: [...state.turns.slice(0, -1), { ...last, reply, firstAttempt, round }] };
}

function firstAttemptOf(round: RoundState): FirstAttempt | null {
  if (round.status === "graded" && round.attempt === 1) return outcome(round);
  if (round.status === "revealed" && round.attempt === 1) return round.skipped ? "skipped" : "revealed"; // D50, D117
  return null;
}

// D103: Send is disabled while the latest round streams or grades.
export function isBusy(state: Conversation): boolean {
  const status = state.turns.at(-1)?.round.status;
  return status === "streaming" || status === "grading";
}
