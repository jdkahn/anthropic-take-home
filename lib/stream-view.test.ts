import { describe, expect, it } from "vitest";
import august from "@/fixtures/rounds/august-rung1.json";
import december from "@/fixtures/rounds/december-rung3.json";
import summer from "@/fixtures/rounds/summer-rung2.json";
import { chunkText, fixtureText } from "./fixtures";
import { initialRound, roundReducer } from "./round-reducer";
import { closeOpenFence, isComplete, plainNotice, splitLeadIn } from "./stream-view";

describe("isComplete", () => {
  it("marks a field final once the next field has started (D60)", () => {
    expect(isComplete({ significant: true, goal: "Tell a dip" }, "goal")).toBe(false);
    expect(isComplete({ significant: true, goal: "Tell a dip", domain: null }, "goal")).toBe(true);
    expect(isComplete({ before: "x", blank: "" }, "before")).toBe(true);
    expect(isComplete(null, "goal")).toBe(false);
  });

  it("never marks options final: only streamEnd does", () => {
    expect(isComplete({ options: [] }, "options")).toBe(false);
  });
});

describe("splitLeadIn", () => {
  it("rung 1: heading becomes the label, the last line the sentence the blank completes", () => {
    const { body, label, leadIn } = splitLeadIn(august.before);
    expect(label).toBe("What this means");
    expect(leadIn).toBe("August's month-over-month drop is most likely");
    expect(body).not.toContain("What this means");
    expect(august.before.startsWith(body)).toBe(true);
  });

  it.each([
    ["summer (rung 2)", summer.before, "What this means"],
    ["december (rung 3)", december.before, "Recommendation"],
  ])("%s: a trailing heading is the label, with no lead-in", (_name, before, label) => {
    expect(splitLeadIn(before)).toMatchObject({ label, leadIn: "" });
  });

  it("handles a lead-in with no heading, and an empty before", () => {
    expect(splitLeadIn("Numbers.\n\nSo it is most likely ")).toEqual({ body: "Numbers.", label: null, leadIn: "So it is most likely" });
    expect(splitLeadIn("")).toEqual({ body: "", label: null, leadIn: "" });
  });
});

describe("closeOpenFence", () => {
  it("closes a half-streamed code fence and leaves closed ones alone", () => {
    expect(closeOpenFence("Try:\n```python\nx = 1")).toBe("Try:\n```python\nx = 1\n```");
    expect(closeOpenFence("```\nx\n```")).toBe("```\nx\n```");
  });
});

describe("plainNotice", () => {
  it("explains cut-off, stopped, and failed replies; stays silent on a normal plain answer (D8)", () => {
    expect(plainNotice(null, true)).toBeNull();
    expect(plainNotice("expected exactly 4 options", true)).toBeNull();
    expect(plainNotice("invalid JSON", true)).toMatch(/cut off/);
    expect(plainNotice("invalid JSON", false)).toMatch(/couldn't answer/);
    expect(plainNotice("stopped", true)).toMatch(/stopped/);
    expect(plainNotice("rate_limited", false)).toMatch(/Wait a minute/);
  });
});

describe("roundReducer: how a stream ends", () => {
  const streamTo = (text: string) =>
    chunkText(text).reduce((s, t) => roundReducer(s, { type: "chunk", text: t }), initialRound);

  it("shows the streamed answer, not raw JSON, when the reply is cut off", () => {
    const s = roundReducer(streamTo(fixtureText("/truncated")), { type: "streamEnd", order: [0, 1, 2, 3] });
    expect(s.status).toBe("plain");
    if (s.status !== "plain") return;
    expect(s.reason).toBe("invalid JSON");
    expect(august.before.startsWith(s.text)).toBe(true);
    expect(s.text).not.toContain('"significant"');
  });

  it("reports a stop as 'stopped'", () => {
    const s = roundReducer(streamTo(fixtureText("/truncated")), { type: "streamEnd", order: [0, 1, 2, 3], stopped: true });
    expect(s).toMatchObject({ status: "plain", reason: "stopped" });
  });

  it("ends in plain with no text when the request itself fails", () => {
    expect(roundReducer(initialRound, { type: "requestFailed", reason: "busy" })).toEqual({
      status: "plain",
      text: "",
      reason: "busy",
    });
  });
});
