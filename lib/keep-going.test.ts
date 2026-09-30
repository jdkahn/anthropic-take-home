import { describe, expect, it } from "vitest";
import type { Turn } from "./conversation";
import { BREADTH, keepGoing, STARTERS } from "./keep-going";
import { initialRound, type RoundState } from "./round-reducer";

const [AUGUST, SUMMER, DECEMBER] = STARTERS;
const [RETENTION, MAY] = BREADTH;

// Only the status matters to keepGoing, so the cloze fields are left out.
const turn = (question: string, status: RoundState["status"] = "graded"): Turn =>
  ({ id: 0, question, attached: false, reply: "", firstAttempt: null, round: status === "streaming" ? initialRound : { status } }) as Turn;

describe("keepGoing (D36)", () => {
  it("walks the ladder: August → summer → December", () => {
    expect(keepGoing([turn(AUGUST)])).toEqual([SUMMER]);
    expect(keepGoing([turn(AUGUST), turn(SUMMER)])).toEqual([DECEMBER]);
  });

  it("offers breadth after the top rung: retention and May", () => {
    expect(keepGoing([turn(AUGUST), turn(SUMMER), turn(DECEMBER)])).toEqual([RETENTION, MAY]);
  });

  it("leaves out what's already been asked, then runs out", () => {
    expect(keepGoing([turn(DECEMBER), turn(RETENTION)])).toEqual([MAY]);
    expect(keepGoing([turn(RETENTION), turn(MAY)])).toEqual([]);
  });

  it("waits until the latest turn is finished (graded, revealed, or plain)", () => {
    for (const status of ["streaming", "answering", "grading"] as const) expect(keepGoing([turn(AUGUST, status)])).toEqual([]);
    for (const status of ["graded", "revealed", "plain"] as const) expect(keepGoing([turn(AUGUST, status)])).toEqual([SUMMER]);
  });

  it("offers nothing off the golden path or in an empty chat", () => {
    expect(keepGoing([turn("Write me a Python function")])).toEqual([]);
    expect(keepGoing([])).toEqual([]);
  });
});
