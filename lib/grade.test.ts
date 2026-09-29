import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { describe, expect, it } from "vitest";
import { GradeSchema, parseGrade, type Grade } from "./grade";

function grade(overrides: Partial<Grade> = {}): string {
  const base: Grade = {
    assessment: "Cites -8.4% vs -8.3%; both on screen; same-month comparison is the right test.",
    answer_sound: true,
    why_sound: true,
    mistake: null,
    feedback: "You compared August to last August (-8.3% vs -8.4%), which separates the season from the trend.",
    gap: null,
    corrective_prompt: null,
  };
  return JSON.stringify({ ...base, ...overrides });
}

const ORDER = ["assessment", "answer_sound", "why_sound", "mistake", "feedback", "gap", "corrective_prompt"];

describe("GradeSchema", () => {
  it("keeps output order = reasoning order (D60, Phase 4 GRADE)", () => {
    expect(Object.keys(GradeSchema.shape)).toEqual(ORDER);
  });

  it("sends every field as required, in that order, to structured outputs (D59)", () => {
    const { schema } = zodOutputFormat(GradeSchema);
    const format = { schema: schema as { properties: object; required: string[] } };
    expect(Object.keys(format.schema.properties)).toEqual(ORDER);
    expect(format.schema.required).toEqual(ORDER);
  });
});

describe("parseGrade", () => {
  it("accepts a rung 2 grade with answer_sound set", () => {
    const r = parseGrade(grade(), 2);
    expect(r.kind).toBe("graded");
  });

  it("accepts a rung 1 grade with answer_sound null (code checks the pick)", () => {
    expect(parseGrade(grade({ answer_sound: null }), 1).kind).toBe("graded");
  });

  it("rejects answer_sound at rung 1 and a missing one at rungs 2–3", () => {
    expect(parseGrade(grade({ answer_sound: true }), 1)).toEqual({ kind: "invalid", reason: "answer_sound set at rung 1" });
    expect(parseGrade(grade({ answer_sound: null }), 3)).toEqual({ kind: "invalid", reason: "answer_sound missing at rung 3" });
  });

  it("rejects invalid JSON (e.g. truncated at max_tokens) and schema mismatches", () => {
    expect(parseGrade('{"assessment": "cut off', 2)).toEqual({ kind: "invalid", reason: "invalid JSON" });
    expect(parseGrade(JSON.stringify({ why_sound: "yes" }), 2)).toEqual({ kind: "invalid", reason: "schema mismatch" });
  });

  it("rejects empty feedback (the learner would see nothing)", () => {
    expect(parseGrade(grade({ feedback: "  " }), 2).kind).toBe("invalid");
  });
});
