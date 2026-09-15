# Architecture decisions (MVP)

Decided so the product can ship without waiting on later choices.

1. **Framework:** Next.js 15 App Router, TypeScript, Tailwind CSS.
2. **Hosting:** Vercel. Production hostname `apphole.pro` (and `www.apphole.pro` redirect).
3. **Database:** JSON file store (`data/store.json` locally, `/tmp/apphole` on Vercel). Swap to Postgres via `DATABASE_URL` later without changing finding logic.
4. **Authentication:** Email + password, HMAC session cookie (`jose`). Optional. Free URL checks work without an account.
5. **Job runner:** `after()` on Vercel so the HTTP response can return a scan id. Local Node runs the crawl in-process immediately. No extra worker vendor yet.
6. **Browser automation:** Public HTTP crawler is the default (Cheerio + fetch). Playwright is optional (`APPHOLE_PLAYWRIGHT=1`) and not required for a useful Free report. Runtime console and screenshots stay **couldn't verify** until a browser worker is enabled.
7. **Evidence storage:** HTTP status, headers, URLs, extracted text snippets, and finding objects on the scan record. No full page HTML retained after analysis.
8. **Stripe:** Checkout + Customer Portal + webhooks. AppHole Pro is $29/month. The Stripe price id is `STRIPE_PRO_PRICE_ID`. Production `apphole.pro` uses live-mode keys.
9. **Scan quotas:** Free 3 / rolling 31 days, 8 pages. Pro 40 / 31 days, 24 pages. Cookie anonymous id + optional user id.
10. **Retention:** Scans kept in the store (capped at 400 records). Deletion via hello@apphole.pro until a self-serve delete button exists.
11. **Public vs authenticated scanning:** v1 is public GET-only. No passwords collected. Authenticated flows are Pro later.
12. **Findings vs AI:** Deterministic checks create findings from evidence. Optional LLM rewrite requires `APPHOLE_AI_PLUGS=1` plus a model key. It cannot add holes. Ambient API keys are ignored unless that flag is set.

SSRF: private hosts, localhost, and metadata IPs are rejected after DNS lookup.
