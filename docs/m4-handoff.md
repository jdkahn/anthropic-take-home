# M4 Handoff: Wire-up

_Completed Wed 2026-09-30. Next: Phase 6 (E2E validation). The living map of what's built is `docs/architecture.md`._

## Exit test ✅ (D118)

> 3 starters show the fade, live.

Protocol fixed before the run (D114): one live run by Justin, diagnose before any rerun. The **first run failed at rung 2**: sound answers to the summer question were graded wrong. Diagnosed without a rerun (D115), fixed in the round prompt, re-checked against a rule fixed first (D116: 3/3), then **the rerun passed**: August at rung 1 → summer at rung 2 → December at rung 3 (drafted, graded, revised).

## What shipped

| Slice | Commit | What |
|---|---|---|
| M4.1 | `9111240` | M3 backlog: Sign out; a signed-in `/login` redirects to `/` |
| M4.2 | `cc0dfbf`, `66c4cab` | Real Opus rounds: the browser sends the whole conversation; past replies go back verbatim; cache marker on the latest user message (D110). Follow-up concept check (D111, D112) |
| M4.3 | `96286ae` | Real Sonnet grader, `GRADE_MODEL` limited to M2-evaluated models (D97) |
| M4.4a | `d4e019e` | Staircase: rung map derived from the turns; attempt-1 result recorded once per turn (D113) |
| M4.4b | `fec958e` | Rung-change note in the goal chip (D33) |
| M4.4c | `7f230e7` | Round prompt: one concept per blank; follow-ups practice the rung-map concept (D115, D116) |
| M4.4d–e | `b67ddcc`, `c192728` | Composer: the textarea fills the box; composer and rung 2–3 box grow with their text |
| M4.4f | `6f6bda5` | Sending while a round is unanswered = skip: answer shown, staircase unchanged (D117) |
| M4.5 | `c0277a3` | Keep-going chips along the golden path; breadth copy approved (D120) |
| M4.6 | `5630dc3` | Experimental badge + tooltip for `domain: "other"` (D34, D42) |
| Docs | `2068d5c` | Event log cut (D121) |

263 Vitest tests. UI checked in a real browser (desktop + 390 px) at every UI slice; live checks cost ~$3 in total.

## Decisions (D110–D121)

| # | Decision |
|---|---|
| D110 | Past assistant turns go back as the raw streamed text. Caching doesn't decide the format: any byte-stable history caches |
| D111 | Follow-up concept check, rule fixed before the run |
| D112 | 2/3 PASS on the concept label. **Corrected by D115:** the label was a proxy |
| D113 | Rung map derived from the turns; attempt-1 result recorded on the turn; base = the rung the learner saw |
| D114 | Exit-test protocol: 1 run, diagnose before any rerun |
| D115 | Exit test failed at rung 2: compound follow-up blanks. Fix: round prompt; new assessment = "does a sound answer pass?" |
| D116 | Re-check 3/3 PASS; control ✅ |
| D117 | Send while unanswered = skip (no staircase change); explicit Reveal stays −1 |
| D118 | Exit test PASS on the rerun |
| D119 | Remaining scope: chips, Experimental badge, event log; cut goal edit, corrective chip, goal dismiss |
| D120 | Keep-going chips = fixed golden-path script; breadth copy approved |
| D121 | Event log cut; revises the PRD's Logging row. The README must say so |

## Findings

1. **A proxy passed while the product failed.** D111 checked the concept label; the exit test failed on what the learner actually faces. The fix changed the assessment, not only the prompt: grade M2's hand-labeled sound answers on each new round (`evals/followup-check.ts`).
2. **Multi-turn changes Opus's behavior.** Single-turn M1 rounds were clean; as follow-ups, Opus folded the segment finding into the seasonal blank. Only live multi-turn runs showed it.
3. **Caching works as designed.** Each round reads the history (10.9k + the new turn) and writes only the new part; the grader caches separately (10.5k). The 5-minute TTL did lapse between checks (D112), so a long rung-3 draft will pay a cache rewrite.
4. **Live checks caught two UI bugs tests couldn't:** the answer box was 3 px short (border-box vs `scrollHeight`), and the Experimental tooltip covered a wrapped goal on mobile.
5. **Process slips (mine):** twice a commit went out without its architecture.md update (fixed by amending, then `&&`-chained), and one live check ran against a stale server.

## Open questions

1. **Retention and May as follow-ups have never run.** Only the three starters have been checked multi-turn. Phase 6.
2. **December as a follow-up** has one live data point (the passing rerun).
3. **Rung-2 blanks run 3 sentences** where the prompt asks for 1–2; one of 3 re-check blanks still mentions the segment finding as an aside.
4. **Latency live:** 24–47 s per round (thinking + writing). Phase 6 should judge it on the deployed app (M2 Q2: effort `low`?). No bytes are sent during thinking; HTTP/1.1 proxies may close idle connections.
5. **Abort on the grade path** (`request.signal` on client disconnect) is untested.
6. **`STARTERS` is duplicated** in `lib/fixtures.ts` (its own keys) and `lib/keep-going.ts`.
7. **Code tasks land inconsistently** (after M4, D122): a SQL query came back `significant: false`, a Python dedupe got a cloze. The prompt's "significant" test is written for analysis; D34 wants the same mechanic for other domains. Address later, with an eval.
8. Carried over: rung-3 rubric gap (g10), Hobby-plan use, app name (Q9), M1 Q3/Q4.

## Mastery

- Prompt caching: "why is the marker on the latest user message, not the settings?" ✅. The `JSON.stringify` check was half right; it surfaced the rule *a cache breaks when the bytes sent change, not when they differ from what the model wrote*, and corrected my own claim.
- AbortSignal: mostly right; refined to "two signals linked by the connection closing".
- Single-run evidence: 4/9 ✅, which led to D114's diagnose-first protocol.
- Staircase fold ✅ (after "fold" = `reduce` was explained).

## Principle check

Backward design ✅ (rules fixed before every check; D115 moved the assessment to what the learner faces) · Bloom's ✅ (rung 1 → 3 live) · 4D ✅ (a proxy caught and named; every pass read by hand) · PBL ✅ · Mastery ✅ (first-attempt only, D113) · ZPD ✅ (derived staircase; skips don't demote, D117) · CLT ✅ (rung-change note, no stuck blurred rounds, auto-growing inputs).
⚠️ **Gap:** with the event log cut (D121), in-product *measurement* of mastery is gone; the evidence is the visible fade plus the eval harnesses. Name it in the README.

## Next step

**Phase 6, E2E validation:** deploy (push needs Justin's go), run the golden path on the deployed app, including the chips (retention, May) and a non-analysis question, and judge the live latency.
