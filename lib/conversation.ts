import { initialRound, roundReducer, type RoundAction, type RoundState } from "./round-reducer";

// The chat: a list of turns, one round each (D77: useReducer + one context).
// Only the latest turn is live. Send is blocked while it streams or grades (D103), and
// older rounds are read-only, so at most one round ever has async work in flight.

export type Turn = { id: number; question: string; attached: boolean; round: RoundState };
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
          { id: state.turns.length, question: action.question, attached: action.attached, round: initialRound },
        ],
      };
    case "round": {
      const last = state.turns.at(-1);
      if (!last) return state;
      const round = roundReducer(last.round, action.action);
      if (round === last.round) return state;
      return { turns: [...state.turns.slice(0, -1), { ...last, round }] };
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
