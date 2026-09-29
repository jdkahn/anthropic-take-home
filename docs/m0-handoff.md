# M0 Handoff: Walking skeleton

_Completed Mon 2026-09-28. Next: M1 (traps: generator, round schema, round prompt, harness)._

## Exit test ✅

A fresh private window logs in on the production domain (`https://anthropic-take-home-lake.vercel.app`) and sees an Opus 5.5 reply stream in. Verified by Justin in the browser; the curl checks below were run against production.

| Check (production) | Result |
|---|---|
| `/` without a cookie | 307 → `/login` |
| `/api/round` without a cookie, or with a forged cookie | 401 (also proves `SESSION_SECRET` is set) |
| Wrong password, dev password | 401 (proves `APP_USERNAME` / `APP_PASSWORD_HASH` are set and well-formed) |
| 21st `POST /api/*` within 60 s from one IP | 429 (WAF, D82) |
| Deployment and preview URLs | 302 → Vercel SSO (Standard Protection) |

## What exists

| Slice | Commit | What |
|---|---|---|
| 1 | `4c612fa` | Next.js 16.3.6, App Router, TS, Tailwind v4, ESLint |
| 2 | `3a1211b` | Shared login: scrypt hash in env, HMAC-signed stateless httpOnly cookie, `proxy.ts` guard |
| 3 | `e97476f`, `9a0c254` | `/api/round` streams plain text; `ROUND_MODEL` env switch (dev = Haiku) |
| 4 | `1c40a73`, `1046c6d` | Node 24.x pin, Vercel via GitHub, WAF rule, README ops notes |

29 Vitest tests (auth, login route, proxy, round route, stream helpers); Claude is mocked.

## Decisions (D78–D82, in `decision-log.md`)

| # | Decision |
|---|---|
| D78 | Keep D48: own login, password in a Vercel env var. Rejected Supabase (free tier pauses after 1 week idle) and Vercel Password Protection (not on Hobby) |
| D79 | Slice done = tested + committed; Vitest covers pure functions, route handlers, and `proxy.ts`; Claude mocked |
| D80 | Deploy via Vercel GitHub integration |
| D81 | `ROUND_MODEL` env var; Haiku in dev only. M1 harness and production stay on Opus |
| D82 | One WAF rate-limit rule (Hobby allows one): `POST /api/*`, 20 / 60 s per IP. Revises D58 |

## Facts learned (verified on docs or live)

- Next 16 renamed `middleware.ts` → `proxy.ts` (Node runtime by default). Closes Phase 4 open question #6.
- Next's `.env` loader expands `$VARS`, so the hash format uses `:` separators.
- Opus 5.5: thinking can't be disabled; effort defaults to `medium`. **Time to first text ≈ 4.9 s** at medium. Haiku 4.5 ≈ 0.9 s and rejects `effort`.
- `MessageStream.withResponse()` surfaces HTTP errors before we commit to a 200; the iterator's `return()` aborts the upstream call.
- `anthropic-take-home.vercel.app` belongs to someone else; our production domain is `anthropic-take-home-lake.vercel.app`.

## Open questions

1. ✅ **Closed by D91: no fallbacks; refusals are logged, and M3 shows a friendly message.** ~~**Refusal fallbacks (decide in M1).**~~ The Claude API guidance defaults to server-side `fallbacks` on Opus 5.5. After a mid-stream fallback, a different model continues the partial text, which could stitch one JSON document from two models. Decide alongside the ROUND schema.
2. **`effort` and `max_tokens` for the round call.** Placeholders (`medium`, 16000). The M1 harness should log time to first token, thinking/output tokens, and `stop_reason`.
3. **"Sensitive" env vars in Vercel.** Not confirmed whether production vars were marked Sensitive.
4. **Parallel worktree.** `.claude/worktrees/m1` (branch `m1`, created at `e97476f`) exists; it predates D81. Merge `main` before building on it. Now ignored by git, tsc, ESLint, and Vitest.
5. Carried from Phase 4: #3 event log without a store, #5 Hobby non-commercial terms, #8 attached file names, #9 app name.

## Backlog (not M0 scope)

- M3: a 429 currently reads as "username and password don't match" on login and as a generic error in chat. Give rate limiting its own copy.
- M3: login page styling per `Login.dc.html` (currently functional only).

## 🅿️ Parked check questions (skipped today for time; revisit before M1's 🧠 moments)

1. Without a store, how does the server tell a cookie it issued from a forged one?
2. What does a signed cookie protect against that a cookie holding the password doesn't?
3. Why does `/api/round` wait for `withResponse()` before returning its 200?

## Principle check

Backward design ✅ (M1 exit test kept on Opus, D81) · Mastery ⚠️ **gap: 3 check questions parked**, so mastery isn't verified for auth or streaming yet · ZPD ✅ (fast Haiku dev loop) · CLT ✅ (one route, one flow) · 4D ✅ (every polished piece shipped with a "where it's thin" list) · Bloom's and PBL: not exercised in M0 (plumbing only).

## Next step

M1, starting with the Python generator (🧠 learn moment, scaffold heavily): seed + asserts → `tasklane.json` + `expected.json`.
