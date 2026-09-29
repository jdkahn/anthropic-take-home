# M2 Handoff: Grader

_Completed Tue 2026-09-29. Next: M3 (round UI on fixtures)._

## Exit test ✅

> D71 picks a model.

**Grader = Sonnet 5.5** (`thinking: between_tools`, effort `low`), chosen by D71's fallback clause (D97). Evidence: `evals/grade-runs/2026-09-29T07-31-56-343Z/report.md`.

| Model | Agreement (majority of 3) | Single run | Flipped | Warm p50 | Warm p90 | Cost (36 calls) |
|---|---|---|---|---|---|---|
| **Sonnet 5.5** | **11/12** | 11.0 | none | **4.8 s** | 5.4 s | $0.35 |
| Haiku 4.5 | 11/12 | 11.0 | g10 | 5.6 s | 8.8 s | $0.14 |
| Opus 5.5 | 11/12 | 11.0 | none | 6.1 s | 7.1 s | $0.61 |

All three pass quality; none meets p50 ≤ 3 s → "fastest that passes quality" → Sonnet. Total eval cost $1.10.

## What shipped

| Slice | Commit | What |
|---|---|---|
| M2.1 | `df9bd56` | Pre-registration (D92): item, label, agreement, latency, frozen configs |
| M2.2 | `df9bd56`, `d6920b0` | 12 items (Claude-drafted responses), Justin's blind labels (D94) |
| M2.3 | `8660de9` | `lib/grade.ts`: `GradeSchema` (reasoning order) + `parseGrade()` |
| M2.4 | `0d362f1` | `lib/prompts/grade.ts`: `GRADE_SYSTEM` + `buildGradeParams()`; guards for D65/D69, configs pinned to D92 |
| M2.5 | `d12445a` → `ab22c72` | `evals/grade-harness.ts` + pure `grade-metrics.ts` (D71 `decide()` in code); run + Haiku add |

`npm run eval:grade` (`-- --smoke [model]`, `-- --add <dir> <model>`, `-- --rerender <dir>`). 104 Vitest tests.

## Decisions (D92–D97)

| # | Decision |
|---|---|
| D92 | Eval pre-registered: agreement = every grader-judged boolean matches, majority of 3; latency = wall-clock to a complete grade, first call dropped; configs frozen |
| D93 | Sonnet + Opus only (revises D70). **Reversed by D96** |
| D94 | Labels final; g01 relabeled to keep D69 strict; g03 → g13 so rung 1 has unsound cases; rule: a why can't be sound if its answer isn't |
| D95 | Prompt examples from a made-up café, concepts the eval doesn't use (D65 + D69) |
| D96 | Re-add Haiku with its pre-results config after neither model met 3 s |
| D97 | Grader = Sonnet 5.5; D72's "shared cache" is moot (different prefix and model) |

## Findings

1. **The one miss (g10) is a rubric gap, not grader error.** All models call a quarterly target "defensible". The rubric never says a rung-3 answer must **answer the question asked** ("What should we expect for December?"). Deliberately not tuned against g10: that would fit the eval.
2. **The item set can't separate the models on quality.** All three are identical on 11 items with zero flips for Sonnet and Opus. 11/12 means "reliably good on these case types", not a precise accuracy.
3. **Haiku was not the fast option.** 15.9 ms per output token vs Sonnet's 11.0, all calls cache hits. Caveat: Haiku ran ~10 min after the others, not interleaved.
4. **Hidden `assessment` arithmetic slips.** Opus summed last Q4 as 31,893 in one run (actual 29,893); verdict unaffected.
5. **Haiku broke the D94 rule** (answer unsound, why sound) in 2 of 3 g10 runs; Sonnet and Opus never did.

## Open questions

1. **Grading latency ≈ 5 s** (laptop; Vercel region may differ) against a 3 s target. M3/M4: the Checking state has to carry it. Option: stream the grade and show `feedback` as it arrives (it comes after `assessment`, so the gain is limited). Measure from Vercel in M4.
2. **Round latency is the bigger problem:** M1 measured 14–24 s to first token on Opus at effort `medium` (M1 open Q1). Try effort `low` before M4.
3. **Rung-3 rubric gap** ("answers the question asked"): add it later and verify on a **new** item, not g10.
4. **`GRADE_MODEL` env var** (D70 "env-switchable"): wire in M4 with Sonnet as the default.
5. ✅ **Closed by D98:** the attached data counts as "on screen" (Justin confirmed; the learner has access to their data).
6. Carried over: M1 Q3 (`mistake` is free text), Q4 (shortest option can stand out), Q7 (friendly message on empty/unparseable reply), Hobby-plan use, event-log retention, app name.

## Mastery

- M0's 3 parked check questions **done**: #2 solid, #1 and #4 partial (filled in), #3 a misconception (status can't change after a 200), re-checked and closed with one nuance (the 502 vs 401 mapping).
- Grader-design check (why the grader must know what was hidden): ✅.

## Principle check

Backward design ✅ (rule, definitions, and configs fixed before any run; `decide()` in code; configs pinned by a test) · Mastery ✅ (blind human labels; parked checks cleared) · 4D ✅ (disagreement read, not tuned away; arithmetic slip flagged) · Bloom's ✅ (rung-3 "defensible, need not match" tested) · ZPD ✅ · CLT ✅ (≤ 2-sentence feedback) · PBL ✅.

## Next step

**M3, round UI on fixtures:** partial-JSON streaming spike first (fallback: buffer the JSON) · blank · shuffled options · why · reveal · blur. Exit test: the golden path clicks through on stubs. Include the M0 backlog (429 copy, login styling) and M1 Q7 (friendly message on empty/unparseable reply).
