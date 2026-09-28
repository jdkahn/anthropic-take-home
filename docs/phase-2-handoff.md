# Phase 2 Handoff — Scoping, Refinement, Journey clarification

_Completed Sat 2026-09-26. Next: Phase 3 (PRD + UI/UX, lightweight)._

> **Note for Phase 5:** some items here were later revised: D18 → D20 (staircase), D19 → D70/D71 (a mini grader eval now runs), "non-analysis domains out of scope" → D34 (Experimental domain), "1–2 blanks" → one blank per response.

## Decision log

| # | Decision | Options considered | Why | Rests on |
|---|---|---|---|---|
| D10 | Build **A · Goal-driven Cloze** | A · C (Study Panel) | Meets the core need for every user, not just the motivated; strong evidence fit; clear gap vs. Learning mode (full answer given, user owns the key inference) | Skill Formation (engagement during work), Fluency Index (less evaluative on artifacts), PBL |
| D11 | Adaptivity = **rule-based ladder** for MVP; Claude-decided level parked as future. In-session state only | Rules · Claude decides · learner decides · hybrid | Covers core function; testable, explainable | ZPD, Mastery, "simple but thoughtful" |
| D12 | Keep A; docs name the **applicability boundary** + **unasked/asked cost split** | Keep A · switch to C · A in coding domain | Turns doubts about generality and token cost into explicit strengths | Backward design, "simple but thoughtful" |
| D13 | Learning validation = **stepped rollout + first-attempt learning curves per concept**; calibration probe cohort parked as extension | Stepped rollout · sampled direct probe · both | Unobtrusive, comparable across in-the-wild tasks, measures learning rather than behavior | Mastery, backward design; Skill Formation (unaided performance as outcome) |
| D14 | Analysis = per-arm engagement rate + engager-vs-engager at matched encounter + **Lee bounds** if rates differ | Bounds · propensity matching | Few assumptions; honest under differential missingness | Randomization / ITT logic |
| D15 | Learner = **junior-to-mid analyst** | Junior analyst · time-pressed manager | Most skill left to form; managers tend to delegate | ZPD, Skill Formation |
| D16 | "Why" grader = strong model + careful prompt for MVP | Tuned grader · strong model + prompt | Good enough for a prototype; perfecting it is product work | "Simple but thoughtful" |
| D17 | 5-concept taxonomy, expandable later | — | Covers common analytic errors; same taxonomy drives distractors, streaks, and measurement | Bloom's (Evaluate), 4D Discernment |
| D18 | Mastery threshold = 2 in a row with a sound "why" | — | Arbitrary but explainable | Mastery learning |
| D19 | No hand-labeled grader eval for now; revisit if time allows | ~15-label agreement check · none | Time budget | — (rationale should name the grader as unvalidated + describe the eval plan) |

## One-page scope

**Learner:** junior-to-mid analyst turning data into a business report (trends → recommendation).

**Problem:** AI help lowered skill formation ~17% with no real speedup (Shen & Tamkin); users evaluate less when AI produces artifacts (Fluency Index). Learning mode withholds answers; ours gives the full answer and makes the user own its key inference.

**Learning goals**
| Bloom's | The learner can… |
|---|---|
| Analyze | Find the load-bearing inference in an analysis and justify it |
| Evaluate | Catch common analytic errors in AI output: seasonality vs. trend · correlation ≠ causation · small-sample noise · missing denominator · averages hiding segments |
| Create | Draft the recommendation themselves and defend it against critique |

**Core interaction (one round):** editable/dismissable goal → full answer with 1–2 blanks on load-bearing inferences → pick + "why" → reasoning graded → a miss names the misconception + one isomorphic corrective item. Mastery: 2 in a row with sound "why" advances the per-concept rung (dropdown → freeform → draft the recommendation). In-session only.

**Learning validation**
- Product: stepped rollout (randomize *when* users get the feature); first-attempt (pre-feedback) cloze accuracy per concept at matched encounter numbers; per-arm engagement rates; Lee bounds for differential missingness. Repeat surface+inference = practice, not measurement.
- Prototype: event log (attempts, reveals, dismissals, rung changes). Grader eval described, not run (D19).

**Boundaries:** applies only when output has a gradable inference. Unasked cost = goal + blank spec; grading/corrective items run only when the user engages.

**Out of scope:** accounts / cross-session state · Claude-decided adaptivity · calibration probe cohort · discernment classifier · global toggle · non-analysis domains · file uploads (built-in demo dataset + paste only).

**Principle check:** Backward design ✅ · Bloom's ✅ · 4D ✅ · PBL ✅ · Mastery ✅ (depends on grader) · ZPD 🟡 in-session only · Cognitive load ✅ (1–2 blanks max)

## Open questions
1. Demo dataset: which data, and enough concept opportunities to climb 2–3 rungs in one sitting?
2. Significance gate: same call or a separate cheap call?
3. Streaming a full answer + structured blank spec (likely Phase 4's riskiest part).
4. Model choice (grader latency in-flow) and pricing — verify on docs.claude.com.
5. Parked learning item for Justin: differential missingness / Lee bounds.

## Next step
Phase 3: short PRD + wireframes of the core cloze round.
