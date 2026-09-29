# Decision log (Phase 5 onward)

D1–D77 live in the phase handoffs. New decisions start at D78.

| # | Decision | Options considered | Why | Rests on |
|---|---|---|---|---|
| D78 | Keep D48: shared password in a Vercel Sensitive env var (`.env.local` in dev, git-ignored), app-issued signed httpOnly cookie; no Supabase, no Vercel Password Protection | Own login (D48) · Supabase Auth free · Supabase Auth Pro ($25/mo) · Vercel Password Protection (not on Hobby; Pro + $20/mo/project) · Vercel Auth + shareable link (1 per Hobby account, prod-domain behavior unclear) | Simplest and fastest; zero new dependencies; Supabase free projects pause after 1 week idle, so reviewers could hit a dead login | D55 (every dependency is a failure mode), simplicity, Learn track (auth + cookies) |
| D79 | Each slice ends tested and committed: Vitest for pure functions, route handlers, and `proxy.ts` (called directly, Claude SDK mocked); test + lint + build green before commit; commit per slice without asking. **Extends Phase 4 "Tests" row** (was pure functions only) | Pure functions only (Phase 4) · + handlers and proxy · + browser E2E | Auth is security-critical and cheap to test directly; per-slice commits keep history reviewable. E2E stays manual (Phase 6) for the one-day budget | Mastery (verify before building on it), E2E, simplicity |
