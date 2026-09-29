# anthropic-take-home

Goal-driven Cloze: Anthropic Education Labs take-home (Option B). Full write-up comes in Phase 7; design docs live in `docs/`.

## Run locally

```bash
npm install
cp .env.example .env.local   # fill in values; see comments in the file
npm run dev                  # http://localhost:3000
npm test                     # Vitest (Claude is mocked; no API spend)
```

## Deployment (Vercel, Hobby)

- **Deploys:** Vercel GitHub integration; every push to `main` ships to production (D80). Node 24.x (`package.json` engines).
- **Reviewers use the production domain only.** Preview and deployment URLs sit behind Vercel's Standard Protection (they redirect to Vercel SSO).
- **Env vars** (Vercel → Settings → Environment Variables): `APP_USERNAME`, `APP_PASSWORD_HASH`, `SESSION_SECRET`, `ANTHROPIC_API_KEY`. Leave `ROUND_MODEL` unset in production (runs Opus 5.5; D51, D81).

## Access, cost, and abuse controls

| Control | How |
|---|---|
| Access | One shared login. The password is stored only as a scrypt hash; the session is a stateless HMAC-signed, httpOnly cookie (D48, D78). Pages redirect to `/login`, APIs return 401 (`proxy.ts`), and API routes that call Claude re-check the session themselves |
| Spend cap | Prepaid API credits (hard cap) |
| Rate limit | Vercel WAF, one rule (Hobby allows one rate-limit rule per project; D82): **`POST` to paths starting with `/api/` → 20 requests / 60 s per IP → 429.** Counters are per region |
| Payload size | `/api/round` rejects messages over 4,000 characters (413) before calling Claude |
