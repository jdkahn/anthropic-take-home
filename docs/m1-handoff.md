# M1 Handoff — Traps

_Completed Mon 2026-09-28 on branch `m1` (not yet merged to `main`, not pushed). Next: M2 (grader)._

## Exit test

> 3 starters × 3 runs on Opus: all blanks on the right concept, no trap fallen into (Justin reads all 9).

| Check | Result | Evidence |
|---|---|---|
| Blank on `seasonality_vs_trend` | ✅ 9/9 (code) | `evals/round-runs/2026-09-29T01-22-41-526Z/report.md` |
| Rung echo | ✅ 9/9 (code), closes open Q4 for this sample | same |
| Valid round, `end_turn` | ✅ 9/9 (code) | same |
| No trap fallen into | ✅ Claude read 9/9; Justin read a subset (D87) | same |

Baseline before D86: concept 5/9. "Summarize August" blanked the segment trap 3/3 (`2026-09-29T01-14-20-835Z`).

## What shipped

| Slice | Commit | What |
|---|---|---|
| M1.1 | `3196bfa` | `scripts/generate_tasklane.py` → `data/tasklane.json`, two CSVs, `expected.json`. Traps checked on the output (`require()`, not `assert`). Seed 2 (105/200 seeds pass at spec noise) |
| M1.2 | `8f15ca0` | `lib/round.ts`: `RoundSchema` (reasoning order) + `parseRound()` (4 options, 1 correct, concept in pack; fallback = full plain answer) |
| M1.3 | `df2ec3a` | `lib/prompts/round.ts`: `ROUND_SYSTEM` + `buildRoundParams()`. Guard tests: no trap terms or trap numbers in the prompt (D65, D69) |
| M1.4 | `93cb9ea`, `640e51e` | `evals/round-harness.ts` (`npm run eval:round`, `-- --rerender <dir>`), baseline + D86 rerun |

## Decisions (D80–D87, in `docs/decision-log.md`)

- **D80** Trend 2.5%/mo (spec's 3%/mo contradicted +35% YoY)
- **D81** UI shows the two CSV names; Claude gets `tasklane.json` (closes open Q8)
- **D82** Segment mechanism: the redesign shifts mobile signups to desktop
- **D83** Schema sent via the SDK's `zodOutputFormat()`; enums enforced by `parseRound()`
- **D84** Rung map + learner goal as a mid-conversation `role: "system"` message after the cache
- **D85** Harness runs the golden-path ladder (rungs 1 → 2 → 3)
- **D86** Blank the inference the question hinges on; unasked findings stay visible
- **D87** Exit test accepted on partial human review

## Measured (Opus 5.5, effort `medium`, D86 run)

| Metric | Value |
|---|---|
| TTFT | 13.7–24.1 s |
| Total | 25.4–39.7 s |
| Output tokens (incl. thinking) | 2,672–3,780 |
| Cached prefix | 10,917 tokens (system + data), read on every call after the first |
| Cost | ~$0.06–0.08/round warm, $0.11 cold; $0.63 per 9-run harness |

## Open questions

1. **Latency.** 14–24 s before the first token is slow for chat. Try effort `low` in a harness run before M3/M4 (the harness already records TTFT).
2. **D72 vs. per-model caches.** Caches are per model, so the grader only shares the round's cached data prefix if it is also Opus. Revisit when M2 picks a model. Haiku 4.5's minimum cacheable prefix is 4,096 tokens (the prefix here is ~10.9K, so it caches, just separately).
3. **`mistake` is free text,** not a concept ID. It's fine for the grader, but metrics (D13) can't count distractor types without mapping.
4. **The correct option can stand out by being shortest** (run 1.1). The prompt bans only "longest".
5. **Garbled sentence in run 1.2** ("9,416 → 9,416+ now 9,416"). One-off so far; watch for it.
6. **Aug 2026 week-4 retention** is reported for a cohort that couldn't have four weeks of data yet (realism nit; could be `null`).
7. **Invalid-JSON fallback shows raw text.** M3 should show a friendlier message.
8. **Data format:** compact JSON (~17K chars). Switch to CSV if arithmetic slips show up.
9. Carried over: Hobby-plan use (Phase 4 Q5), event-log retention (Q3), app name (Q9), Lee bounds (Q7).

## Principle check

Backward design ✅ (traps asserted on output; exit test kept as written after a miss) · Bloom's ✅ (rung formats verified at 1/2/3) · 4D ✅ (every distractor names a mistake; unasked findings surfaced) · PBL ✅ (D86: blank on the learner's real question) · Mastery ⚠️ (human trap-read was partial, D87) · ZPD ✅ (rung echo 9/9) · CLT ✅ (one blank; settings out of the prompt body)

## Next step

**M2, the grader:** schema (`assessment → answer_sound → why_sound → mistake → feedback → gap → corrective_prompt`) · prompt · 12 hand-labeled whys (not the prompt's a/b/c examples, D69) · Haiku/Sonnet/Opus × 3 runs · apply D71 as written. Start by drafting the 12 items from the D86 run's rounds.
