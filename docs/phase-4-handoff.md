# Phase 4 Handoff — Implementation Plan

_Completed Mon 2026-09-28. Next: Phase 5 (Implementation), starting with M0._

Wireframes (visual + copy spec, 12 artboards): `docs/wireframes/` — see its README for tokens and known drift.

## Architecture

```
Browser (Next.js)                          Vercel (Hobby, Fluid compute, 300 s default)
┌─────────────────────────────┐   ┌─────────────────────────────────┐
│ parseRound()  ◀── raw stream ┼───│ /api/round ─▶ Claude Opus 5.5    │
│ React state: rung map,       │   │ /api/grade ─▶ grader (M2 decides)│
│  correct option, after-text  │──▶│ /api/login  (httpOnly cookie)    │
└─────────────────────────────┘   │ WAF: 2 rate-limit rules          │
                                   └─────────────────────────────────┘
Prepaid credits = hard spend cap · no store · tasklane.json is static
Python generator runs locally only; its output is committed.
```

- Threat model: honest learner avoiding accidental spoilers, not an adversary. Answers reach the browser but stay hidden until graded or revealed. At scale: move answers server-side to protect first-attempt metrics.
- Reviewers must use the **production** URL (preview URLs return 401 under Deployment Protection).

## Frontend stack

| Area | Choice | Reason |
|---|---|---|
| Framework | Next.js App Router + TypeScript | D52 |
| CSS | Tailwind | Fast to match the wireframes |
| Components | Hand-rolled; a headless tooltip if needed | Few primitives |
| Validation | Zod | Schema source (D59) |
| Server → Claude | Anthropic TypeScript SDK (streaming) | D75 |
| Client fetching | Plain `fetch` + `ReadableStream` reader + a small partial-JSON parser (spike in M3) | D76 |
| State | `useReducer` + one context: round state machine, rung map, event log | D77 |
| Markdown | `react-markdown` for `before` / `after` | Answers include tables and numbers |
| Tests | Vitest for pure functions: `parseRound()`, staircase, reducer | Cheap; UI checked by hand in Phase 6 |
| Fixtures | JSON files + `USE_FIXTURES=1` | D51 stub mode |

**Round state machine**

```
streaming → awaiting pick → awaiting why → grading → graded
     └──────────── Reveal (any time) ───────────────▶ revealed
```

**Routes**

```
Pages   /login            /            (the chat)
API     /api/login   /api/logout   /api/round   /api/grade
Guard   cookie check on everything except /login and /api/login
```

Verify at M0: the current Next.js file convention for request-intercepting middleware (it may have been renamed).

## Schemas (JSON structured outputs via `output_config.format`, one Zod schema each)

Every field required; absent = `null`; output order = reasoning order.

```
ROUND  significant → goal → domain → concept → rung → before → blank → after → options
       options: [{ text, mistake }]  — mistake: null marks the correct option
GRADE  assessment → answer_sound → why_sound → mistake → feedback → gap → corrective_prompt
```

- `parseRound()` validates: exactly 4 options, exactly one `mistake: null`, concept in pack when `domain = analysis`. Failure → plain answer, no blank (D8 path).
- Browser shuffles options. Rung echo mismatch → render by Claude's rung, log it.
- Code decides option-pick correctness; grader judges `answer_sound` (own words, rungs 2–3) and `why_sound`. A plain function applies the staircase: sound answer + sound why → +1, else −1; Reveal → −1.

## Prompt skeletons

**Round (system, cacheable):** job (full answer, hold back one inference) · significance · goal (Analyze+, committed before blank) · blank rules (load-bearing, derivable on screen, interpretation not fact) · rung formats · option rules (each wrong option = named real mistake; parallel length/tone/hedging) · method checklist (concept pack, run silently, mention only if it changes the conclusion) · domains.
**Round (per request):** conversation + data (first turn) · goal edit · sparse rung map (only concepts above rung 1).

**Grader (system, cacheable):** job · D69 rubric + "not required" list · answer rules (rung 2 = same inference in substance; rung 3 = defensible, need not match Claude) · labeled examples a/b/c with criteria · feedback rules (miss → state answer + name mistake, ≤ 2 sentences; sound → name their evidence, no generic praise) · corrective only if data supports · learner text in `<learner_answer>`/`<learner_why>` treated as data · leniency guard (effort and confidence don't count).
**Grader (per request):** goal · concept · rung · before/blank/after · options + mistakes · pick · why · the task data (D72).

## Models (verified on docs, 2026-09-28)

| Model | API ID | In / out per MTok | Latency | Thinking |
|---|---|---|---|---|
| Haiku 4.5 | claude-haiku-4-5-20251001 | $1 / $5 | Fastest | Extended |
| Sonnet 5.5 | claude-sonnet-5-5 | $2 / $10 | Fast | Adaptive |
| Opus 5.5 | claude-opus-5-5 | $4 / $20 | Moderate | Adaptive, always on |

Round = Opus 5.5 (D51). Grader = decided by the M2 mini-eval (D70, D71).

## Milestones (riskiest first)

| # | Milestone | Exit test | Est. |
|---|---|---|---|
| M0 | Walking skeleton: Next.js on Vercel, shared login, `/api/round` streams one reply | Fresh browser logs in on production URL, sees text stream | 45 m |
| M1 | Traps: Python generator (seed + asserts) → `tasklane.json` (dashboard view + detail rows) + `expected.json` · round schema · round prompt · harness | 3 starters × 3 runs on Opus: all blanks on the right concept, no trap fallen into (Justin reads all 9) | 1.5 h |
| M2 | Grader: schema · prompt · 12 hand-labeled whys (not a/b/c) · Haiku/Sonnet/Opus × 3 runs | D71 picks a model | 1 h |
| M3 | Round UI on fixtures: partial-JSON streaming spike first (fallback: buffer JSON) · blank · shuffled options · why · reveal · blur | Golden path clicks through on stubs | 1.5 h |
| M4 | Wire-up: real calls · staircase + rung echo · goal chip · keep-going chips · event log | 3 starters show the fade, live | 1.5 h |

**Cut line if running long (D74):** drop goal edit (#2) and the corrective chip (#3). Keep the Experimental chip and "Compare with Claude's version".

## Decision log

| # | Decision | Options considered | Why | Rests on |
|---|---|---|---|---|
| D52 | All Next.js on Vercel: Route Handlers in TS, one deploy | All Next.js · Next.js + FastAPI · Python functions on Vercel | Backend concepts are language-agnostic; one deploy avoids cold-start and CORS risk | E2E, simplicity |
| D53 | Keep D22's Python generator, run locally; commit output. Nothing Python deployed | Python · TS generator | Python practice in a contained offline job; zero deploy cost | Learn track, simplicity |
| D54 | Stream the after-text; hide it client-side until graded or revealed. **Revises D32** ("never reaches the browser" → "hidden until answered") | Withhold + fetch · stream | Instant Reveal; honest-learner threat model | Agency (D3), CLT |
| D55 | No cache or DB for the MVP; backend stateless | Upstash · Postgres · sealed token · none | Every dependency is a failure mode (e.g. free-tier idle archiving) | Simplicity, E2E |
| D56 | Correct option lives in browser memory; grading call receives it from the client | Server store · sealed token · client | Consistent with D54/D55 | Simplicity |
| D57 | Browser parses the stream; server is a thin proxy. Parse failure → plain answer. *Parked: server-side parsing if time allows* | Server · browser | Less backend; fallback reuses D8; one testable parser | Simplicity, CLT |
| D58 | Rate limits via Vercel WAF (Claude routes + login), documented in README. **Revises D48** | WAF · in-memory · both | Counts across instances, zero code; Hobby allows 3 custom rules | E2E |
| D59 | JSON structured outputs for both calls; one Zod schema = types, fixtures, validation | Tagged text · JSON · tool call | Guaranteed shape; single contract (D51) | Simplicity |
| D60 | All fields required, absent = `null`, `significant` first | Optional · sentinel · required + nullable | Output order is reasoning order; goal before blank | D49, backward design |
| D61 | Option = `{text, mistake}`; `mistake: null` = correct; browser shuffles; validate 4 options / 1 correct | Index · per-option flag | One source of truth; mistake tags force real distractors and feed metrics | 4D, Mastery, D13 |
| D62 | `why_sound` binary | Binary · 3-level | Simple; staircase self-corrects | Simplicity, ZPD |
| D63 | `answer_correct` → `answer_sound` | Two conventions · one | Rung 2–3 answers have no single key | Bloom's, clarity |
| D64 | Grader keeps a short hidden `assessment` field, logged | Field · extended thinking · drop | Verdict computed from reasoning; predictable length; debuggable | D19, Mastery |
| D65 | Claude gets the method, not the answers: concept pack doubles as a silent checklist; data ships as dashboard view + detail rows | Answer key · checklist · checklist + format | Generalizes; keeps rationale honest; less mental math; realistic trap placement | Backward design, 4D, scaling |
| D66 | Sparse rung map in the request; Claude looks up the rung for the concept it picks | Full map · sparse · fixed concept | Browser can't know the concept in advance | ZPD, D20–21 |
| D67 | `rung` echo field after `concept`; render by Claude's rung, log mismatches | Echo · trust browser | Commits format before blank; mismatches visible | ZPD |
| D68 | Park the correction call. Ladder: measure → fix prompt → correction call last | Build · park | Unknown frequency; latency and complexity | Simplicity, evidence first |
| D69 | Sound why = (1) cites on-screen evidence and (2) that evidence supports this conclusion via the right concept. Prompt examples ≠ eval items | Looser · two criteria | Gradeable, labelable; rewards checking claims against data over priors | Mastery, 4D, D19 |
| D70 | Grader chosen by a mini-eval of Haiku 4.5, Sonnet 5.5, Opus 5.5; env-var switchable | Default · 2-model · 3-model | Made the Haiku quality concern testable | Mastery, D19 |
| D71 | Rule set before running: fastest model with ≥ 10/12 agreement (majority of 3 runs), within 1 item of best, warm p50 ≤ 3 s. None pass quality → fix rubric; none pass speed → fastest that passes quality | Rule after · rule first | Prevents fitting the rule to a favorite; 1-item gap = noise | Backward design, small-sample noise |
| D72 | Grader receives the task data in a cached prefix shared with the round call | Data · text only · dashboard only | Verifies citations; segment trap lives in detail rows | Mastery, D69 |
| D73 | M0 walking skeleton before M1 | M0 · M1 first | Retire deployment risk first | E2E, ZPD |
| D74 | Cut line if long: drop goal edit and corrective chip; keep Experimental chip and Compare with Claude | Any of four | Compare is nearly free and is the golden path's payoff | Simplicity, Bloom's, 4D |
| D75 | Anthropic TypeScript SDK on the server | SDK · raw fetch | Parses SSE, types the stream, retries; no hand-rolled SSE in a weak area | Simplicity, ZPD |
| D76 | Hand-rolled client streaming: fetch + ReadableStream + small partial-JSON parser; M3 spike decides | Hand-rolled · Vercel AI SDK | Transparent and explainable; "built on the Claude API" without caveats | Learn track, clarity |
| D77 | `useReducer` + one context; each round is an explicit state machine | Context · Zustand · Redux · XState | One screen, one flow; reducer is a pure, testable function | Simplicity, CLT |

## Open questions (Phase 5)

1. Prompt caching minimums and pricing — check docs before M1.
2. Partial-JSON parser library — spike at the start of M3.
3. Event log with no store: how long Vercel Hobby keeps runtime logs, or a "download session log" button — decide in M4.
4. Rung-echo mismatch rate — measured by the M1 harness.
5. Hobby plan is personal / non-commercial use — confirm a take-home demo fits.
6. Next.js middleware file convention — verify at M0.
7. Parked learning item: differential missingness / Lee bounds.
8. Attached file name(s) shown in the UI (wireframes show two CSVs; generator ships `tasklane.json`) — decide in M1.
9. App name (still `[App name]` in the wireframes).

## E2E checklist additions
- Reviewers get the production URL (preview URLs are 401).
- Oversized grading payloads rejected server-side.
- WAF rules documented in the README.
- First structured-output call per schema is slower (grammar compile) — warm up before demos.

## Principle check
Backward design ✅ (method over answer key; eval rule set before results) · Bloom's ✅ (rung echo; rung 3 graded as defensible, not matching) · 4D ✅ (mistake-tagged distractors; rubric rewards evidence over priors) · PBL ✅ (unchanged: real task) · Mastery ✅ (grader rubric + mini-eval now actually run) · ZPD ✅ (sparse rung map + echo) · CLT ✅ (silent checklist; ≤ 2-sentence feedback; one state machine)

## Next step
Phase 5, M0: scaffold Next.js, shared login with an httpOnly cookie (🧠 learn moment), `/api/round` streaming one Claude reply, deployed to the production URL.
