import { initialRound, roundReducer, type RoundAction, type RoundState } from "./round-reducer";

// The chat: a list of turns, one round each (D77: useReducer + one context).
// Only the latest turn is live. Send is blocked while it streams or grades (D103), and
// older rounds are read-only, so at most one round ever has async work in flight.

// reply: the raw text Claude streamed, kept when streaming ends; it goes back to Claude verbatim
// as this turn's history (D110). "" while streaming, or when no text arrived.
export type Turn = { id: number; question: string; attached: boolean; reply: string; round: RoundState };
export type Conversation = { turns: Turn[] };

export type ConversationAction =
  | { type: "send"; question: string; attached: boolean }
  | { type: "round"; action: RoundAction } // always the latest turn
  | { type: "reset" };

export const emptyConversation: Conversation = { turns: [] };

export function conversationReducer(state: Conversation, action: ConversationAction): Conversation {
  switch (action.type) {
    case "send":
      if (isBusy(state)) return state;
      return {
        turns: [
          ...state.turns,
          { id: state.turns.length, question: action.question, attached: action.attached, reply: "", round: initialRound },
        ],
      };
    case "round": {
      const last = state.turns.at(-1);
      if (!last) return state;
      const round = roundReducer(last.round, action.action);
      if (round === last.round) return state;
      // The round reducer drops the raw text once it parses it; keep it here for the history.
      const reply = last.round.status === "streaming" && round.status !== "streaming" ? last.round.raw : last.reply;
      return { turns: [...state.turns.slice(0, -1), { ...last, reply, round }] };
    }
    case "reset":
      return emptyConversation;
  }
}

// D103: Send is disabled while the latest round streams or grades.
export function isBusy(state: Conversation): boolean {
  const status = state.turns.at(-1)?.round.status;
  return status === "streaming" || status === "grading";
}
