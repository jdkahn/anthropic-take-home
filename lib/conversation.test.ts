import { describe, expect, it } from "vitest";
import august from "@/fixtures/rounds/august-rung1.json";
import rung1Sound from "@/fixtures/grades/rung1-sound-synthetic.json";
import rung3Miss from "@/fixtures/grades/rung3-miss.json";
import rung3Sound from "@/fixtures/grades/rung3-sound.json";
import { conversationReducer, emptyConversation, isBusy, type Conversation } from "./conversation";
import { fixtureText } from "./fixtures";
import type { Grade } from "./grade";
import type { RoundAction } from "./round-reducer";
import { roundRequestBody } from "./round-request";

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

  it("keeps the raw reply once streaming ends, after the round has parsed it (D110)", () => {
    const raw = fixtureText("Summarize August for the leadership update");
    let s = send(emptyConversation);
    s = round(s, { type: "chunk", text: raw });
    expect(s.turns[0].reply).toBe(""); // not yet: still streaming
    s = round(s, { type: "streamEnd", order: [0, 1, 2, 3] });
    expect(s.turns[0].round.status).toBe("answering");
    expect(s.turns[0].reply).toBe(raw);
    s = round(s, { type: "reveal" });
    expect(s.turns[0].reply).toBe(raw); // later transitions keep it
  });

  it("keeps a stopped reply's partial text, and no reply when the request failed", () => {
    let s = round(send(emptyConversation), { type: "chunk", text: '{"significant": tr' });
    s = round(s, { type: "streamEnd", order: [0, 1, 2, 3], stopped: true });
    expect(s.turns[0].reply).toBe('{"significant": tr');
    const failed = round(send(emptyConversation), { type: "requestFailed", reason: "network" });
    expect(failed.turns[0].reply).toBe("");
  });

  it("ignores round actions with no turns, and resets", () => {
    expect(round(emptyConversation, { type: "reveal" })).toBe(emptyConversation);
    expect(conversationReducer(send(emptyConversation), { type: "reset" })).toEqual(emptyConversation);
  });

  describe("attempt-1 result for the staircase (D108, D113)", () => {
    const AUGUST = "Summarize August for the leadership update";
    const DECEMBER = "We're setting Q4 targets. What should we expect for December?";
    const run = (s: Conversation, ...actions: RoundAction[]) => actions.reduce(round, s);
    const streamed = (question: string) =>
      run(send(emptyConversation, question), { type: "chunk", text: fixtureText(question) }, { type: "streamEnd", order: [0, 1, 2, 3] });

    it("records a correct first answer, and the next request climbs the concept to rung 2", () => {
      const correct = august.options.findIndex((o) => o.mistake === null);
      const s = run(
        streamed(AUGUST),
        { type: "pick", pick: correct },
        { type: "editWhy", text: "Last August fell about the same." },
        { type: "check" },
        { type: "gradeDone", grade: rung1Sound as Grade },
      );
      expect(s.turns[0].firstAttempt).toBe("correct");
      expect(roundRequestBody(s.turns, "How does this summer compare to last summer?", false).rungMap).toEqual({
        seasonality_vs_trend: 2,
      });
    });

    it("records a Reveal as a miss (D50)", () => {
      expect(run(streamed(AUGUST), { type: "reveal" }).turns[0].firstAttempt).toBe("revealed");
    });

    it("keeps attempt 1's miss after a rung-3 revision is graded sound", () => {
      let s = run(streamed(DECEMBER), { type: "editAnswer", text: "Plan for a dip." }, { type: "check" }, { type: "gradeDone", grade: rung3Miss as Grade });
      const first = s.turns[0].firstAttempt;
      expect(first).not.toBe("correct");
      s = run(s, { type: "revise" }, { type: "editAnswer", text: "Better draft." }, { type: "check" }, { type: "gradeDone", grade: rung3Sound as Grade });
      expect(s.turns[0].round).toMatchObject({ status: "graded", attempt: 2 });
      expect(s.turns[0].firstAttempt).toBe(first);
    });

    it("sending while the latest round is unanswered skips it: answer shown, staircase unchanged (D117)", () => {
      const s = send(streamed(AUGUST), "What's wk4 retention?");
      expect(s.turns[0].round).toMatchObject({ status: "revealed", skipped: true });
      expect(s.turns[0].firstAttempt).toBe("skipped");
      expect(s.turns[1].round.status).toBe("streaming");
      expect(roundRequestBody(s.turns.slice(0, 1), "next", false).rungMap).toEqual({});
    });

    it("sending after a graded round leaves it as it was", () => {
      const correct = august.options.findIndex((o) => o.mistake === null);
      const graded = run(streamed(AUGUST), { type: "pick", pick: correct }, { type: "editWhy", text: "w" }, { type: "check" }, { type: "gradeDone", grade: rung1Sound as Grade });
      const s = send(graded, "next");
      expect(s.turns[0]).toBe(graded.turns[0]);
    });

    it("records nothing while answering or after a failed grade", () => {
      const s = run(streamed(AUGUST), { type: "pick", pick: 0 }, { type: "editWhy", text: "why" }, { type: "check" }, { type: "gradeFailed", message: "x" });
      expect(s.turns[0].firstAttempt).toBeNull();
    });
  });
});
