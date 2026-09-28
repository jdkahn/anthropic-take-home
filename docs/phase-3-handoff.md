# Phase 3 Handoff — PRD + UI/UX Design

_Completed Mon 2026-09-28. Next: Phase 4 (Implementation Plan, lightweight)._

## Exit artifacts
- **Wireframes:** Cloze Wireframes canvas (12 artboards) — https://claude.ai/artifact/9Ug5YTbPuqLJK6zUgJpGQi
- **PRD:** Goal-driven Cloze: PRD — https://claude.ai/code/artifact/da3f1f88-c6f2-44de-ab99-717b68eff0ef

## Decision log

| # | Decision | Options considered | Why | Rests on |
|---|---|---|---|---|
| D20 | Rung ladder = adaptive staircase: up 1 after a correct answer with a sound "why", down 1 after a miss; per concept. *Revises D18* | 2 in a row · 1 correct · staircase · shared rung | Knowledgeable users advance faster; lucky promotions self-correct; fading visible in a short demo (expertise reversal effect) | ZPD, Mastery, CLT |
| D21 | Reject one rung shared across concepts | Per concept · shared | Would fade scaffolding on unshown concepts | Mastery, ZPD |
| D22 | Generated dataset via Python script with planted traps | UCI Online Retail II · Olist · generated | Guarantees the traps exist for the demo | Backward design |
| D23 | Plant 3 strong traps; taxonomy stays at 5 | 3 · all 5 | More realistic; enough to demo; other 2 still appear as distractors | CLT, simplicity |
| D24 | Demo domain = web-app product metrics (learner unchanged) | Retail + crash course · frontend coding · product metrics | Content Justin can author and judge (grader unvalidated, D19) | D19 risk |
| D25 | Traps = seasonality · averages hiding segments · correlation ≠ causation | vs. small-sample noise | A trap on the recommendation makes the Create rung meaningful | Bloom's |
| D26 | Demo company = Tasklane, a B2B team task app | B2B · consumer | Cleanest seasonality trap | Simplicity |
| D27 | Mobile-web retention collapse lives in retention only, not in active users | Contained · compound | Clean first cloze; compound inferences for higher rungs | CLT, Bloom's |
| D28 | Rung sets input format AND the Bloom's level of the blanked sentence (interpretation → recommendation) | — | Climbing means harder thinking, not just a harder input | Bloom's, ZPD |
| D29 | Layout = chat thread with inline clozes | Chat + drawer · split · report canvas | Scoped concept; mobile-friendly | D4, PBL |
| D30 | No data tab | Drawer · none | User already has their own data | CLT |
| D31 | Staircase state hidden | Header indicator · hidden | Nothing the user can do with it | CLT |
| D32 | Blur everything after the blank until answered or revealed | Blur · prompt not to restate · blank last | Only reliable leak fix; Reveal keeps it non-blocking | D3, Mastery |
| D33 | Rung change = one-line note in the goal chip | Toast · header · note | Explains why the UI changed | CLT |
| D34 | General mechanic + curated concept packs; analysis is the only curated pack; other domains = Experimental, excluded from measurement. *Reverses Phase 2 "non-analysis domains" boundary* | Narrow · fully open · packs | Demo depth + handles general tasks; real scaling story | Mastery/D13, scaling |
| D35 | Demo data attached to first message; else paste | Drawer · attachment | Matches the mental model | D30 |
| D36 | Golden path = ladder then breadth: 3 seasonality starters, then retention/May as follow-up chips | Ladder · breadth · both | Shows the fade and the other traps | ZPD, PBL |
| D37 | Nothing attached by default; starter chips attach Tasklane; attach button is a stub menu ("Use sample data" / "Upload: coming soon") | Always attached · on demand | Keeps general tasks (Python) clean | D34 |
| D38 | Goal chip muted green; cloze box grey → green (correct) / red (miss) | Clay · neutral | Red read as an error; clay blurred Claude vs. learner | CLT |
| D39 | Options always visible (no dropdown); "why" unlocks after a pick; 5th "own words" option; mobile inline for MVP | Dropdown · inline | No content jumping | CLT, agency |
| D40 | Editing the goal keeps the current cloze; next cloze uses the new goal | Regenerate · keep | Doesn't yank work in progress | Agency |
| D41 | Miss: answer stated in the feedback header; corrective item only if the data supports one; Skip available | Always · conditional | Less redundancy, no forced items | Mastery |
| D42 | Tooltip on the Experimental chip | Line · tooltip | Reviewers see what it means | D34 |
| D43 | Accepted additions: Skip, single freeform box, "Compare with Claude's version", rung-3 goal shift, start-screen expectation line | — | Liked in review | D3, 4D, Bloom's |
| D44 | Own-words answers graded like freeform; move the rung only if correct | Counts · no rung · cut | Harder than picking | Mastery, agency |
| D45 | Blank fills only after grading, not on selection | — | Avoids implying the pick was right | CLT |
| D46 | Two loading states: response (streaming + skeleton options) and grading ("Checking your reasoning…") | — | Separates Claude writing from Claude grading | Agency, E2E latency |
| D47 | Goal chip shows a ghost loader until it arrives | — | Chip may render after the answer | CLT |
| D48 | One shared username + password; prepaid credits as spend cap; rate limits always on (Claude calls + login), set by env vars: lower in dev | Login · cap only · access link | Private reviewer access; protects credits | E2E checklist |
| D49 | One call: task in → goal, then answer with blank, then options (goal first); significance check in the same call | Goal first · after | Goal must exist to choose the blank | D6, backward design |
| D50 | Reveal counts as a miss on the staircase; logged separately in metrics | Miss · no change | Signals not ready for that rung | Mastery, ZPD |
| D51 | API stubbed with fixtures → Haiku 4.5 for UI/UX testing → Opus 5.5 to validate responses | — | Cheap UI iteration; pay for quality when it matters | Simplicity, cost |

## Dataset spec (for the generator script)
- Tasklane, 24 months (Sep 2024 → Aug 2026), monthly grain.
- `metrics`: month × device (desktop, mobile_web) × plan (free, team) = 96 rows; active_users, new_signups, wk4_retention.
- `events`: ~6 release/marketing rows.
- Traps: seasonality (Aug −~10%, Dec −~18% on ~3%/mo trend; YoY ~+35%) · segments (Mar 2026 mobile-web redesign; retention 38% → 24% while desktop share grows; blended flat ~41–42%) · causation (May 2026: AI Summaries + Product Hunt + email; spike is free-plan signups, fades by July).
- Noise ±3–5%. Script must **assert** each trap numerically (e.g. Aug 2026 dip within ±2 pts of Aug 2025).

## Open questions (Phase 4)
1. Stream with a server-side filter, or buffer the whole reply?
2. Response schema for goal + answer + blank spec (doubles as the stub fixture contract).
3. Verify model IDs and pricing on docs.claude.com; grader latency.
4. Prompt: avoid Claude falling into the planted traps (riskiest part).
5. Parked learning item for Justin: differential missingness / Lee bounds.

## Phase 4 backlog (from design)
- Tooltips/popovers overlay, never push content.
- `box-decoration-break: clone` on wrapped filled blanks.
- Auth: hashed password in env, httpOnly session cookie (🧠 learn moment).
- Rate-limit-hit message (Phase 6 graceful errors).
- Mobile bottom sheet for options (parked).
- E2E checklist wording: "credentials sent with the submission; one sign-in step."
- Justin's open check item: write a seasonality distractor for the retention blank.

## Principle check
Backward design ✅ · Bloom's ✅ (rung = Bloom's level) · 4D ✅ (distractors, Compare with Claude) · PBL ✅ · Mastery ✅ (grader still unvalidated) · ZPD ✅ in-session staircase · Cognitive load ✅ (one blank, hidden state, inline options)

## Next step
Phase 4: stack, architecture, prompt/system design, and a milestone plan — riskiest first (likely: response schema + prompt that doesn't fall into the traps, validated against the generated dataset).