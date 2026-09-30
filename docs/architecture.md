# Architecture

_Living map of the app as built. Updated Tue 2026-09-29, mid-M3 (after M3.5a: `/api/grade` stub + Correct/Miss). Updated in the same commit as any change to what's built (CLAUDE.md)._

Status legend: ✅ built and tested · 🧪 stub mode only (`USE_FIXTURES=1`) · 🛠 built, used only by the eval harnesses · ⏳ not built yet (milestone noted)

---

## 1. At a glance

```
                         OFFLINE (Justin's laptop, output committed)
  scripts/generate_tasklane.py ──▶ data/tasklane.json + 2 CSVs + expected.json      ✅ M1
  evals/round-harness.ts  ──▶ evals/round-runs/…  (prompt quality, Opus)            ✅ M1
  evals/grade-harness.ts  ──▶ evals/grade-runs/…  (D71 picks the grader)            ✅ M2
                          --combined: rung 2–3 single-box re-check (D105 → D106) ✅
                                   │ 3 reviewed runs + 4 Sonnet grades copied to
                                   ▼
                              fixtures/rounds/*.json, fixtures/grades/*.json        ✅ M3.2, M3.5a

 BROWSER (Next.js client)                   VERCEL (Next.js server, stateless D55)
┌──────────────────────────────────┐      ┌──────────────────────────────────────────┐
│ app/page.tsx  Chat               │      │ proxy.ts  cookie check on every path     │ ✅
│  fetch + ReadableStream (D76)    │ POST │ /api/login   scrypt → signed cookie      │ ✅
│  conversationReducer ─┐          │─────▶│ /api/logout                              │ ✅
│   roundReducer ◀──────┘          │      │ /api/round   ─┬─ fixtures replay 🧪      │
│    parsePartialRound (preview)   │◀─────│   raw text    └─ Claude Opus 5.5 ───────────▶ Anthropic API
│    parseRound (final, D57)       │stream│                  (M0 plain request ⚠️)   │
│  shuffledOrder (D100)            │      │ /api/grade   🧪 fixture grade · 501      │
│  gradeInput → parseGrade         │      │              ⏳ M4 Sonnet 5.5            │
└──────────────────────────────────┘      └──────────────────────────────────────────┘
                                            WAF: 20 POST /api/* per 60 s per IP (D82)
                                            Spend cap: prepaid credits (D58)
```

⚠️ **The live `/api/round` still sends the M0 plain-text request.** The real round prompt and schema (`buildRoundParams`) run only in the M1 harness until **M4** wires them in. Until then, the UI's cloze path is exercised by stub mode.

---

## 2. One round, end to end

```
Learner          Browser                         Server /api/round            Claude
  │ Send ──────▶ dispatch send  (Send disabled, D103)
  │              fetch POST {message} ──────────▶ session re-check
  │                                               size check (4,000 chars)
  │                                               fixtures? replay : stream ──▶ Opus 5.5
  │              ◀──── raw JSON text, chunk by chunk ─────────────────────────── (14–24 s thinking,
  │              each chunk: roundReducer "chunk"                                  then ~11–17 s writing)
  │                 raw += text
  │                 preview = parsePartialRound(raw) ?? last preview   (display only, D99)
  │ sees: ghost chip → goal → before streaming → "Your turn" + skeleton options
  │              stream done: roundReducer "streamEnd" { order: shuffledOrder(4) }
  │                 parseRound(raw) → cloze → answering  |  plain → plain (terminal)
  │ picks, writes why ─▶ "pick" / "editWhy"      (rungs 2–3: one box → "editAnswer", D43)
  │ Check ─────▶ "check" → grading ─▶ POST /api/grade {round, pick|answer, why} (D56), 20 s timeout (D103)
  │                                      stub: recorded grade after 2 s · M4: Sonnet 5.5 (D97)
  │              raw text → parseGrade(raw, rung) → outcome(): correct | weakWhy | wrong
  │              "gradeDone" → graded  |  "gradeFailed" → answering (draft kept)
  │ Reveal ────▶ "reveal" → revealed   (only while answering, D101)
```

---

## 3. Server

### Routes

| Route | What it does | Status |
|---|---|---|
| `proxy.ts` | Next 16's renamed middleware. Every path except `/login` and `/api/login` needs a valid session: pages redirect, APIs get 401 | ✅ M0 |
| `POST /api/login` | Checks username + scrypt password hash (env), sets a signed httpOnly cookie, 7 days (D48, D78) | ✅ M0 |
| `POST /api/logout` | Clears the cookie | ✅ M0 |
| `POST /api/round` | Re-checks the session (it spends money), caps message size, then streams raw text. 429/529 from Anthropic → 503 `busy`; other failures → 502. Browser disconnect aborts the Claude call | ✅ M0 plain · 🧪 fixtures · ⏳ M4 real prompt |
| `POST /api/grade` | Re-checks the session, rejects > 32 KB (413) and invalid requests (400, `GradeRequestSchema`), returns the grader's raw JSON as text. Stub mode: a fixture grade after 2 s; otherwise 501 | 🧪 M3.5a · ⏳ M4 Sonnet |

### `lib/` modules the server uses

| Module | Holds | Status |
|---|---|---|
| `lib/auth.ts` | Cookie = `expiry.HMAC(SESSION_SECRET, expiry)`; scrypt password check; timing-safe compares | ✅ |
| `lib/claude.ts` | Model allow-lists and per-model params (round: Opus, `ROUND_MODEL` for dev, D81; grader candidates frozen by D92). `openRoundStream()` and `textChunks()` (keeps text, logs `stop_reason`, D91) | ✅ |
| `lib/prompts/round.ts` | `ROUND_SYSTEM` + `buildRoundParams()`: cached system prompt → cached `<data>` block → conversation → per-request settings as a mid-conversation `system` message (D87) | 🛠 M1 |
| `lib/prompts/grade.ts` | `GRADE_SYSTEM` + `buildGradeParams()` + `GradeInput` | 🛠 M2 |
| `lib/fixtures.ts` | Stub mode: starter question → recorded round; `/plain`, `/truncated`, `/empty`; uneven chunks. `fixtureGrade()`: rung 1 by the pick (code decides), `/miss` in the learner's text forces a miss; rungs 2–3 use real Sonnet grades from M2, rung 1 synthetic. Never on production | 🧪 M3.2, M3.5a |
| `lib/grading.ts` | Shared by route and browser: `GradeRequestSchema` (size caps), `gradeInput()` (state → request; rungs 2–3 send the box as both fields, D105), `outcome()`, `gradeFailureMessage()` | ✅ M3.5a |

---

## 4. Contracts (one Zod schema per call, D59)

Every field required, absent = `null`, key order = reasoning order (D60).

```
ROUND  significant → goal → domain → concept → rung → before → blank → after → options[{text, mistake}]
         lib/round.ts: RoundSchema, parseRound()  → { kind: "cloze", round } | { kind: "plain", text, reason }
         checks: 4 options · exactly one mistake: null · concept in the pack when domain = analysis

GRADE  assessment → answer_sound → why_sound → mistake → feedback → gap → corrective_prompt
         lib/grade.ts: GradeSchema, parseGrade(raw, rung) → { kind: "graded", grade } | { kind: "invalid" }

GRADE INPUT (browser → /api/grade, D56)   lib/prompts/grade.ts: GradeInput
         round (incl. correct option) · pick (rung 1) | answer (rungs 2–3) · why
         rungs 2–3: the single box's text goes in both answer and why (D105; verified 7/8 = separate form, D106)
```

`before + blank + after` is Claude's whole answer. At rung 1, `before` ends with the lead-in ("…is most likely ") and `after` starts with the closing punctuation.

---

## 5. Browser

### Component tree

```
app/layout.tsx           fonts (Plex Sans / Source Serif 4 / Plex Mono), tokens in globals.css
└─ app/page.tsx  Chat    useReducer(conversationReducer), fetch/stream, Stop, New chat, check() → /api/grade
   ├─ header             app name (placeholder, Q9) · New chat
   ├─ StartScreen        heading · expectation line · Composer("start") · 3 starter chips   (Main)
   └─ turns
      ├─ TurnView        file chips (starters, D84) + user bubble
      └─ AssistantTurn   "Thinking…" → "Writing…" (D104), then by round.status:
          ├─ streaming   GhostGoalChip | GoalChip · Markdown(before) · YourTurn + OptionSkeletons  (Loading)
          ├─ plain       Markdown(text) + plainNotice()                                           (M1 Q7)
          └─ Cloze       answering · grading · revealed · graded                    (Cloze, Checking, Mobile)
              ├─ GoalChip · Markdown(body)
              ├─ answering/grading  YourTurn: lead-in + blank · 4 options + "own words" (rung 1)
              │                     or one box (rungs 2–3) · Why? (unlocks on pick) · Check · Reveal
              ├─ revealed           YourTurn "Revealed": blank filled (no artboard)
              ├─ graded             Graded: green "Correct…" | red "Not quite." (pick struck) | red "Right answer, but the why…" (no artboard)
              │                     + Your why + grader feedback                    (Correct, Miss)
              └─ After              blurred + capped until revealed or graded (D32/D54)
   └─ Composer("docked") Send ↔ Stop; Send disabled while busy (D103)
app/login/page.tsx       functional only ⏳ M3.6 styling + 429 copy
```

Components live in `app/_components/` (the underscore keeps them out of routing): `assistant-turn.tsx` (status switch, streaming, plain), `cloze.tsx` (answering → revealed), `parts.tsx` (goal chip, Your-turn panel, skeletons), `composer.tsx`, `start-screen.tsx`, `markdown.tsx`, `icons.tsx`. Only the latest turn gets `actions`; older turns render read-only (D103).

### Three layers of state, all pure and tested

| Layer | File | Job |
|---|---|---|
| Conversation | `lib/conversation.ts` | List of turns. Only the latest is live; `isBusy()` blocks Send while it streams or grades (D103) |
| Round | `lib/round-reducer.ts` | One round's state machine (D77, D101). Wrong-state actions are no-ops (same object back). Randomness and I/O arrive as actions (D100) |
| View | `lib/stream-view.ts` | `isComplete()` (a field is final once the next one starts), `splitLeadIn()`, `closeOpenFence()`, `plainNotice()` copy |

Parsing sits under the round layer: `lib/partial-round.ts` (streaming preview, D99) and `lib/round.ts` (final truth, D57).

### Round state machine

```
             ┌──▶ plain (terminal: normal plain answer, cut off, stopped, request failed)
streaming ───┤
             └──▶ answering ──check──▶ grading ──gradeDone──▶ graded
                     │   ▲                 │
                  reveal └──gradeFailed────┘
                     ▼
                  revealed
```

| Action | From | Carries |
|---|---|---|
| `chunk` | streaming | text |
| `streamEnd` | streaming | `order` (shuffled at the dispatch site), `stopped?` |
| `requestFailed` | streaming | `busy` · `rate_limited` · `upstream` · `network` |
| `pick` / `editAnswer` / `editWhy` | answering | index or `"own"` / text |
| `check` | answering | nothing; ignored unless `canCheck()` |
| `gradeDone` / `gradeFailed` | grading | grade / message |
| `reveal` | answering | nothing |

### What renders while streaming (spoiler rules)

| Field | Shown while streaming? | Why |
|---|---|---|
| `goal` | Ghost chip, then the chip once final | D47 |
| `before` | Yes, live markdown | The point of streaming (D76) |
| `blank` | **Never** until graded or revealed | The exercise |
| `after` | Skeleton lines while streaming; then blurred, `aria-hidden`, `inert`, capped at ~190 px until revealed or graded. Still in the DOM (honest-learner threat model) | D32/D54 |
| `options` | **Skeletons** until `streamEnd` | Claude's writing order could leak the correct one before the shuffle (D99) |

---

## 6. Where each non-negotiable lives

| Rule | Enforced in |
|---|---|
| Stateless backend (D55) | No store anywhere; the correct option lives in browser memory (D56) |
| API key server-side only | `new Anthropic()` in `lib/claude.ts`, server routes only |
| Structured outputs, one schema per call (D59, D60) | `lib/round.ts`, `lib/grade.ts`; the key-order test in `round.test.ts` |
| Browser parses the stream; failure → plain answer (D57, D8) | `roundReducer` `streamEnd` → `parseRound()`; cut-off shows streamed text, never raw JSON |
| Claude gets the method, never the answers (D65) | Guard tests in `lib/prompts/*.test.ts` keep trap terms and numbers out of prompts |
| Grader chosen by the rule (D71) | `evals/grade-metrics.ts` `decide()` → Sonnet 5.5 (D97) |
| Prompt examples ≠ eval items (D69, D95) | Grader examples use a made-up café |

---

## 7. Tests (Vitest, D79)

| Area | Files |
|---|---|
| Auth + routing | `lib/auth.test.ts`, `proxy.test.ts`, `app/api/login/route.test.ts`, `app/api/round/route.test.ts`, `app/api/grade/route.test.ts` |
| Contracts | `lib/round.test.ts`, `lib/grade.test.ts`, `lib/claude.test.ts`, `lib/prompts/*.test.ts` |
| Streaming | `lib/partial-round.test.ts` (every prefix of 9 real Opus rounds), `lib/fixtures.test.ts` |
| Browser state | `lib/round-reducer.test.ts` (incl. exhaustive Fisher–Yates), `lib/conversation.test.ts`, `lib/stream-view.test.ts`, `lib/grading.test.ts` |
| Data + evals | `data/tasklane.test.ts`, `evals/grade-metrics.test.ts` |

UI is checked by hand (Phase 6). Claude is never called in unit tests.

---

## 8. Not built yet

| Slice | Adds |
|---|---|
| M3.5b | Rung 3 draft + critique (`gap`) + Compare with Claude's version; rung 2–3 graded layout polish. **Open:** own words at rung 1 (see below) |
| M3.6 | Login styling + 429 copy |
| M4 | Real round prompt in `/api/round`, real `/api/grade` (`GRADE_MODEL`, Sonnet default), staircase + rung map, goal chip, keep-going chips, event log |

### Known gaps

- **Own words at rung 1 (D44) can't be graded correctly yet.** `gradeRequestText()` sends only the pick at rung 1, and `parseGrade()` rejects `answer_sound` at rung 1, so an own-words answer always lands as `wrong`. Needs a decision before M4.
