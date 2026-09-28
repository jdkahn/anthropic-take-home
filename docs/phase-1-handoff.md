# Phase 1 Handoff — Ideation, Research, User Journey

_Completed Sat 2026-09-26. Next: Phase 2 (Scoping)._

## Decision log

| # | Decision | Options considered | Why | Rests on |
|---|---|---|---|---|
| D1 | Learner = professional preparing a business report (data → trends → recommended actions) | Student · developer learning a library · analyst/pro | Grounds ideation in a concrete job-to-be-done | Brief names "analysts"; silent errors in analysis make Discernment central (Fluency Index: less evaluative when producing artifacts) |
| D2 | Shortlist Challenge Mode (A) + Study Panel (C) | A, B (Predict-first), C, Grill, Brief, Duel | A hits the main principles, is lightweight and scales with use; Duel is a bigger A. C gives the deepest learning but is outside the work | Skill Formation (Generation-Then-Comprehension 86% vs AI Delegation 39%), PBL, ZPD |
| D3 | Never block the user's work; learning is non-blocking / opt-in | Hard gate · soft gate w/ logged skip · non-blocking | User may need results now and return later; gating replaces agency | Brief: "enhance rather than replace human agency" |
| D4 | Final candidates: A (in-chat Cloze) + C (Study Panel) | + Faded Worked Example, Split the Work, Flipped Panel | Others fit a dedicated learning experience better (possible future Panel modes) | PBL, Bloom's, agency |
| D5 | Keep A and C as separate concepts | Separate · combined (cloze → panel) | Simplicity; keeps a real Phase 2 choice | "Simple but thoughtful" |
| D6 | A infers a learning goal and selects which content to cloze toward it | Random blanks · goal-driven blanks | Blanks target what's worth learning, not trivia | Backward design, Bloom's |
| D7 | Learning goal is visible + editable | Hidden · visible · visible + editable | Agency; learner can correct a bad inference. A/B test parked as future work | 4D Description, agency, Fluency Index (~30% set terms) |
| D8 | Draft a goal only when the exchange is significant; infer from input + output; edit is the fallback | Always · gated on significance | No lesson plans for weather questions; also a cost/scaling lever | Cognitive load; scaling |
| D9 | Cloze opt-out = dismiss the goal (local, per conversation). No global toggle | No toggle · global toggle · dismiss goal | Local toggle protects agency without letting users switch learning off forever; dismissals are a signal of bad inference | Agency; Learning mode is prior art for a global toggle |

## Candidate concepts

### A · Goal-driven Cloze in chat
1. User pastes Q3 data, asks for top 3 findings, reasoning, Q4 actions.
2. Claude drafts a visible, editable learning goal (only if significant), e.g. "tell a seasonal dip from a real decline."
3. Full answer streams; 1–2 load-bearing inferences become dropdown blanks.
4. User picks + writes a one-line "why" — or clicks Reveal (logged).
5. Wrong pick → names the misconception + one corrective item on the same concept.
6. Over time: dropdown → freeform as accuracy climbs; top rung = user drafts the recommendation, Claude critiques.

Anti-guessing: pick + "why" (grade reasoning), confidence rating, new item on same concept instead of retry, logged skip.
Distractors should be common analytic errors (seasonality, correlation→causation) so wrong picks diagnose misconceptions.

### C · Study Panel
1. Same request → full answer, no blanks; main context untouched.
2. User highlights text → "Study this" (or a quiet chip: "Learn how I got this →").
3. Panel opens beside chat with read-only access to it; proposes a learning goal.
4. Ladder: worked example → user tries another slice → Claude critiques; advancing requires demonstrated mastery ("gate the learning path, not the work").
5. User can close anytime; resumes later.
6. Final rung: transfer check on a fresh mini-dataset.

## Open questions (for Phase 2)
1. **A or C?** First Phase 2 decision.
2. Self-selection risk: Delegation-pattern users may ignore the Panel / dismiss goals → open rate & dismissal rate as key metrics.
3. Distractor quality: can the LLM reliably generate plausible, misconception-based wrong answers?
4. How to judge "significant" for goal drafting (a small classifier + eval).
5. Which learner defaults: junior analyst growing into the role vs. time-pressed manager?
6. Built-in demo dataset — evaluators won't bring their own data.
7. Principle gaps to design for: Mastery (with no gating, where does it live?), ZPD (what fades, when?).

## Next step
Phase 2: pick one concept + one core interaction; define learning goals, learning-validation plan, out-of-scope list.
