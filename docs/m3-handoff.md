# M3 Handoff: Round UI on fixtures

_Completed Wed 2026-09-30. Next: M4 (wire-up). The living map of what's built is `docs/architecture.md`._

## Exit test ✅

> Golden path clicks through on stubs.

Justin clicked through it with `USE_FIXTURES=1`: sign-in → August (rung 1) → summer (rung 2) → December (rung 3, with Compare and Revise). One round of fixes came out of it (D109); the re-run passed. Two gaps outside the golden path went to the backlog (see Open questions).

## What shipped

| Slice | Commit | What |
|---|---|---|
| M3.1 | `41d6310` | `lib/partial-round.ts`: hand-rolled repair-and-parse; tested on every prefix of 9 real Opus rounds (D99) |
| M3.2 | `1d721ae` | Stub mode: `/api/round` replays recorded rounds in uneven chunks; `/plain`, `/truncated`, `/empty` |
| M3.3 | `a6fc16f` | `lib/round-reducer.ts` state machine (D101) + Fisher–Yates at the dispatch site (D100) |
| M3.4a | `a9289e9`, `b864785` | Chat shell, fonts and tokens, streaming view (ghost chip, live markdown, skeleton options), Stop, friendly notices for cut-off / stopped / empty / failed replies (M1 Q7), "Thinking…" → "Writing…" (D104) |
| M3.4b | `57c5e0c` | Interactive rung 1: options + own words, why unlocks on pick, Check, Reveal, blurred after-text |
| M3.5 | `8514c8d` | D105 re-verified: single box at rungs 2–3 grades 7/8, same as separate form (D106) |
| M3.5a | `f46333a`, `ff7c624` | `/api/grade` (session, 32 KB cap, schema check; fixture grade in stub mode, else 501), 20 s timeout, Correct / Miss / weak-why panels; own words graded as rung 2 (D107) |
| M3.5b | `37d72c0`, `d2a29a3` | Rung 3: critique (what works, one gap), Revise, Compare with Claude's version (D108); revision fixes (D109) |
| M3.6 | `6cbea69` | Login page per `Login.dc.html`; 429 gets its own copy (M0 backlog closed) |
| Docs | `9523419`, `8652986` | `docs/architecture.md`, kept current with every change (new CLAUDE.md rule) |

206 Vitest tests. UI checked in a real browser (Playwright screenshots, desktop and 390 px) at every slice, then by Justin.

## Decisions (D99–D109)

| # | Decision |
|---|---|
| D99 | Hand-rolled partial-JSON parser confirms D76. Display only; `parseRound()` stays the truth. Options render as skeletons while streaming (writing order could leak the answer) |
| D100 | Shuffle order travels in the `streamEnd` action; the reducer stays pure |
| D101 | States: `streaming → plain` or `answering → grading → graded`, `answering → revealed`. Reveal only while answering. Revises the Phase 4 diagram |
| D102 | Keep `useReducer` (D77). Reopen if rung 3 needs > 2 new states or a real async-ordering bug appears. **Not triggered** (D108 added 0 states) |
| D103 | Send disabled while streaming or grading; 20 s grade timeout. One round in flight, so state checks alone prevent stale results. Revises D102's mechanism |
| D104 | "Thinking…" until the first chunk, then "Writing…". Changes `Loading.dc.html` copy |
| D105 | Rungs 2–3 keep D43's single box; the text goes to the grader as both answer and why |
| D106 | D105 verified before building on it: 7/8 combined = 7/8 separate, no flips, $0.27 |
| D107 | Own words at rung 1 are graded as a rung-2 request. Implements D44, which M2's grader path had missed |
| D108 | Rung 3 Revise = one transition `graded → answering`; rounds carry `attempt`. **M4's staircase counts attempt 1 only** |
| D109 | Revision UI: no Reveal after attempt 1, critique stays while revising, read-only text looks read-only. Deviates from `Rung3.dc.html` |

## Findings

1. **Streaming is worth it.** Buffering would hide the 11–17 s writing phase behind a loader. The parser is never wrong on ~35,000 prefixes and is stale for ≤ 17 characters.
2. **Checking decisions against implementations catches what tests don't.** Two cracks between phases: D43's single box vs M2's separate answer + why (D105/D106), and D44's own words vs M2's pick-only rung-1 path (D107). Each side was correct on its own.
3. **Opus content bug in fixture 1.2** (one of the runs Justin read for D90): garbled "9,416 → 9,416+ now 9,416" in the visible answer. Opus corrected itself in the after-text, which the learner only sees after answering. The M1 checks don't read prose quality.
4. **The rung-3 rubric gap (g10) reappeared** in the D106 re-run, unchanged by the format. Still untuned, as planned.
5. **Stub fixtures are only partly real.** Rung 2–3 grades are real Sonnet output but critique a fixed answer; rung 1 grades are synthetic (M2's rung-1 items used a different round).

## Open questions

1. **Backlog from the exit test:** no Sign out control (dropped in M3.4a; `/api/logout` exists), and `/login` doesn't redirect a signed-in user (`proxy.ts`). Both small; do early in M4.
2. **Latency is untested live.** Stub pace is ~10× faster than Opus to first token. Phase 6 must feel the real 14–24 s wait (M2 open Q2: try effort `low`).
3. **The `/api/round` live path is still M0 plain text.** M4 wires `buildRoundParams()` (real prompt, schema, data, rung map).
4. Carried over: rung-3 rubric gap (verify on a new item), `GRADE_MODEL` env var (M4), Hobby-plan use, event-log retention, app name, M1 Q3/Q4.
5. Minor UI: the lead-in jumps into the panel when `before` completes; auto-scroll only on send; the grader is told options were hidden for own-words answers (D107); a disabled radio loses its clay color while grading.

## Mastery

- Partial-JSON check: 2/4 first try; the "brackets inside strings" misconception was fixed and pinned as a test case. The follow-up (what to return when no suffix is correct) led to the `null` + last-good-snapshot design.
- Number-truncation check ✅ (one nuance: `0.` returns `null`, it doesn't fail the test).
- Reducer check (plain round is terminal) ✅. It surfaced that "Reveal any time" was never literally true (D101).
- Stale-grade check: answered by changing the design (D103) instead of adding ids. The reasoning (why state checks alone can't tell rounds apart) was walked through afterward.
- Fisher–Yates: explained, then pinned by an exhaustive 24-path test.

## Principle check

Backward design ✅ (D105 rule fixed before the run; tests before building on assumptions) · Bloom's ✅ (rung 3 Create: draft → critique → revise) · 4D ✅ (Compare with Claude's version; options can't leak by position; D107/D106 found by checking claims against code) · PBL ✅ · Mastery ✅ (first-attempt counting, D108) · ZPD ✅ (rung formats render by Claude's rung) · CLT ✅ (one blank, blur capped, critique stays in view while revising, honest "Thinking…").

## Next step

**M4, wire-up:** first the two backlog fixes, then real Opus rounds in `/api/round` (`buildRoundParams`, rung map, conversation) and real Sonnet grades in `/api/grade` (`GRADE_MODEL`, Sonnet default), then the staircase (attempt 1 only), goal chip, keep-going chips, and event log. Exit test: 3 starters show the fade, live.
