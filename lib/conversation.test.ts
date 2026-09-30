import { describe, expect, it } from "vitest";
import { conversationReducer, emptyConversation, isBusy, type Conversation } from "./conversation";
import { fixtureText } from "./fixtures";
import type { RoundAction } from "./round-reducer";

describe("conversationReducer", () => {
  const send = (s: Conversation, question = "Summarize August for the leadership update") =>
    conversationReducer(s, { type: "send", question, attached: true });
  const round = (s: Conversation, action: RoundAction) => conversationReducer(s, { type: "round", action });

  it("blocks a second send while the latest round streams (D103)", () => {
    const one = send(emptyConversation);
    expect(isBusy(one)).toBe(true);
    expect(send(one, "again")).toBe(one);
  });

  it("routes round actions to the latest turn only, and unblocks when it ends", () => {
    let s = send(emptyConversation);
    s = round(s, { type: "chunk", text: fixtureText("/plain") });
    s = round(s, { type: "streamEnd", order: [0, 1, 2, 3] });
    expect(isBusy(s)).toBe(false);
    s = send(s, "next");
    expect(s.turns.map((t) => t.round.status)).toEqual(["plain", "streaming"]);
    expect(s.turns.map((t) => t.id)).toEqual([0, 1]);
  });

  it("ignores round actions with no turns, and resets", () => {
    expect(round(emptyConversation, { type: "reveal" })).toBe(emptyConversation);
    expect(conversationReducer(send(emptyConversation), { type: "reset" })).toEqual(emptyConversation);
  });
});
