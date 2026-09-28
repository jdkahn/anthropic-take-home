# Goal-driven Cloze: PRD

Sep 28, 2026 · @Justin · Phase 3 · Anthropic Education Labs take-home (Option B)

> **Note for Phase 5:** where this PRD and the Phase 4 handoff disagree, **Phase 4 wins**. Known revisions: D32 → D54 (after-text is streamed and hidden, not withheld); D48 → D58 (rate limits via Vercel WAF, not env vars); D19 → D70/D71 (a mini grader eval now runs); the streaming open question is closed by D57/D76.

## Summary

Goal-driven Cloze answers a real task in full. From the task, it infers a learning goal, shown as an editable chip, and uses that goal to choose which load-bearing inference to blank. The learner supplies that inference and says why, and Claude grades both.

AI help lowered skill formation by about 17%, with no significant speedup (Shen & Tamkin, 2026). People also evaluate AI output less when it builds artifacts for them (AI Fluency Index). Learning mode responds by withholding the answer. This feature gives the whole answer and holds back only the key inference, which one click reveals, so the work never stops.

Wireframes: `docs/wireframes/` (source), or the [Cloze Wireframes](https://claude.ai/artifact/9Ug5YTbPuqLJK6zUgJpGQi) canvas, 12 artboards from sign-in to mobile.

## Learner and job

The primary learner is a junior-to-mid analyst turning product data into a leadership update: trend, then breakdown, then recommendation. They have the most skill left to form, and they're less likely than managers to delegate the whole job (D15).

- **Demo scenario:** Tasklane, a fictional B2B team task app. A Python script generates 24 months of metrics with 3 planted traps (D22, D26).
- **Other tasks:** anything else, like a Python function, runs the same mechanic, labeled Experimental (D34).
- **Who can use it:** invited reviewers only, through one shared login (D48).

## Learning goals

The feature aims at Analyze, Evaluate and Create, not recall.

| Bloom's level | The learner can… | Where it shows up |
| --- | --- | --- |
| Analyze | Find the load-bearing inference in an analysis and justify it | Rungs 1 and 2: the blanked interpretation |
| Evaluate | Catch common analytic errors in AI output | Wrong options built from the concept list |
| Create | Draft the recommendation and defend it against critique | Rung 3 |

**Concepts (the curated analysis pack, D17):** seasonality vs. trend · correlation ≠ causation · small-sample noise · missing denominator · averages hiding segments. The demo data plants 3 of them: seasonality, averages hiding segments, and causation (D23, D25). The other 2 still appear as wrong options.

## Core experience

Each round gives a full answer with one blank, grades the learner's pick and why, and moves that concept's rung up or down.

Reveal is always one click away, so the learner's work never blocks. A miss names the mistake before any practice.

| Rung | The learner… | Bloom's level |
| --- | --- | --- |
| 1 | Picks from 4 options (or answers in own words) and adds a why | Analyze: recognize |
| 2 | Writes the interpretation and reasoning in one box | Analyze: produce |
| 3 | Drafts the recommendation, then reads Claude's critique | Create |

The rung goes up after one correct answer with a sound why and down after a miss, tracked separately for each concept (D20).

## Functional requirements

Each requirement cites the decision it comes from.

### Start

- Three starter chips walk one concept up the ladder: "Summarize August", "summer vs. last summer", "December targets" (D36).
- A starter chip attaches the Tasklane files. Nothing is attached by default (D37).
- The attach button is a stub: "Use sample data" works, "Upload a file" shows as coming soon (D37).
- Pasted data or code works for any task.

### One round

- One Claude call returns the answer, the blank (inference, options, correct option, concept) and the learning goal. When the exchange isn't significant, it returns a plain answer with no goal or blank (D8).
- At most one blank per response. Follow-up questions and corrective items make the sequence.
- The blank sits on a load-bearing inference that can be worked out from what's on screen. It covers the interpretation, not the facts, and its wrong options are real mistakes.
- ~~The blanked text never reaches the browser before the answer is submitted or revealed.~~ **Revised by D54:** the blank and the text after it are streamed but stay hidden until the answer is graded or revealed. Text after the blank stays blurred until then (D32).
- Options are always visible, plus a fifth "answer in my own words" option. The why box unlocks once an option is picked (D39).
- On submit, a grading call judges the pick and the why. A miss is a wrong pick or an unsound why. Own-words answers are graded like freeform (D44).
- The blank fills in only after grading (D45). Correct turns the box green; a miss turns it red, and the header states the answer and names the mistake (D41).
- After a miss, one corrective item on the same concept appears, only when the data supports one. Skip is always available (D41).
- Reveal shows the answer at any time. It's logged and counts as a miss on the staircase (D3, D50).

### Learning goal

Claude infers the goal from the task and decides the blank from it, so the blank targets what's worth learning, not trivia (D6, D8).

- The goal chip is visible, editable and dismissable (D7, D9).
- An edited goal applies from the next round. The current blank stays (D40).
- Dismissing the goal turns off blanks for that conversation (D9).

### Staircase

- Tracked per concept, in-session only: up one rung after a correct answer with a sound why, down one after a miss (D20, D21).
- The rung sets both the format and the Bloom's level (D28). See Core experience.
- Rungs stay hidden. A one-line note in the goal chip explains a change of format (D31, D33).
- Rung 3: the learner drafts the recommendation, Claude critiques it (what works, one gap), and "Compare with Claude's version" is offered (D43).

### Domains and next steps

- Data analysis uses the curated concept pack. Other domains use concepts Claude names itself, show an Experimental chip with a tooltip, and are left out of measurement (D34, D42).
- "Keep going" chips suggest the next ladder question. After rung 3 they offer the retention and May questions (D36).

## Non-functional requirements

| Area | Requirement |
| --- | --- |
| Access and cost | One shared login, with credentials sent alongside the submission. The API key stays server-side. Prepaid credits cap total spend (D48) |
| Rate limits | Always on, for Claude calls and login attempts. ~~The limits come from environment variables~~ **Revised by D58:** Vercel WAF rules, documented in the README |
| Latency | The response streams in. The goal chip and the options show ghost loaders until they're ready. Grading shows "Checking your reasoning…" (D46, D47) |
| Errors | API failure, timeout, or a hit rate limit shows a plain message and a retry, never a blank screen |
| Inputs | Empty, very long and off-topic inputs are handled |
| Devices | Major browsers and a 390 px phone width. Options stay inline on mobile (D39) |
| Accessibility | Real form controls, 44 px touch targets. Results always pair color with an icon and words |
| Logging | Attempts, first-attempt correctness per concept, reveals, skips, goal edits and dismissals, rung changes (D13) |

## Out of scope

- Personal accounts and state that carries across sessions. Progress is in-session only (D11)
- Adaptivity decided by Claude. The MVP uses the rule-based staircase (D11)
- Curated concept packs beyond data analysis, and measuring experimental domains (D34)
- Real file upload. The attach button is a stub (D37)
- A calibration probe cohort, a discernment classifier, a global on/off toggle
- ~~A hand-labeled grader eval: the plan is described, not run (D19)~~ **Revised by D70/D71:** a 12-item mini-eval runs in M2

**Parked for later:** options in a bottom sheet on mobile · rungs kept across chats in the browser · A/B testing the goal display

## Success metrics

Success means rising first-attempt accuracy on each concept across new tasks, not engagement.

**At scale (D13, D14):** a stepped rollout randomizes *when* each user gets the feature. We compare first-attempt (pre-feedback) accuracy per concept at matched encounter numbers. If the two groups engage at different rates, Lee bounds keep the comparison honest. Repeating the same question counts as practice, not measurement.

| Metric | Kind | Why it matters |
| --- | --- | --- |
| First-attempt accuracy per concept, by encounter number | Learning (primary) | Growth on new material, not recall of old items |
| Highest rung reached per concept | Learning | A quick read of how far the scaffold has faded |
| Engagement rate (answered ÷ shown) | Behavior | Needed to read the learning metrics fairly |
| Reveal, skip and goal-dismiss rates | Behavior | High dismissal flags a poorly inferred goal |
| Grader agreement with human labels | Quality | Mini-eval in M2 (D70, D71) |

**In the prototype:** the event log only. An evaluator on the starter path sees the format fade within three questions.

## Risks and open questions

The biggest risk is Claude falling into the very trap it is supposed to test.

| Risk | Mitigation |
| --- | --- |
| Claude misreads the data (for example, calls August a decline) | Method checklist in the prompt (D65), plus the M1 harness against the 3 planted traps with known answers |
| The grader misjudges, so the rung moves the wrong way | The staircase corrects itself after the next item. Rubric (D69) + mini-eval (D70, D71) |
| Streaming the answer while keeping the blank hidden | Closed: browser parses and hides (D54, D57, D76) |
| Grading is slow and breaks the flow | Grader model chosen with a warm p50 ≤ 3 s rule (D71). Loading state already designed |
