# Architecture decisions (MVP)

Decided so the product can ship without waiting on later choices.

1. **Framework:** Next.js 15 App Router, TypeScript, Tailwind CSS.
2. **Hosting:** Vercel. Production hostname `apphole.pro` (and `www.apphole.pro` redirect).
3. **Database:** Local default is a JSON file (`data/store.json`). Production cannot use that: Vercel serverless `/tmp` is per-instance, so a POST that writes a scan and a GET that reads it often hit different files and return "Scan not found." Production uses a durable KV document store, in this order if env is set: Postgres (`DATABASE_URL`), Upstash/Vercel KV (`KV_REST_API_URL` + `KV_REST_API_TOKEN`), or a private Vercel Blob store (`BLOB_READ_WRITE_TOKEN` / `BLOB_STORE_ID`). Scan records are stored per id so `/scan/[id]` can load from any instance. Plug-quote leads use the same store. Read local leads with `node -e "console.log(JSON.parse(require('fs').readFileSync('data/store.json','utf8')).plugLeads)"`. In production set `PLUG_LEAD_NOTIFY_EMAIL` plus `RESEND_API_KEY` (or `PLUG_LEAD_WEBHOOK_URL`) so a quote request still reaches the inbox. A plug quote is a manual follow-up, not a Stripe charge.
4. **Authentication:** Email + password, HMAC session cookie (`jose`). Optional. Free URL checks work without an account.
5. **Job runner:** `after()` on Vercel so the HTTP response can return a scan id. Local Node runs the crawl in-process immediately. No extra worker vendor yet.
6. **Browser automation:** Public HTTP crawler is the default (Cheerio + fetch). Playwright is optional (`APPHOLE_PLAYWRIGHT=1`) and not required for a useful Free report. Runtime console and screenshots stay **couldn't verify** until a browser worker is enabled.
7. **Evidence storage:** HTTP status, headers, URLs, extracted text snippets, and finding objects on the scan record. No full page HTML retained after analysis.
8. **Stripe:** Checkout + Customer Portal + webhooks. AppHole Pro is $29/month. The Stripe price id is `STRIPE_PRO_PRICE_ID`. Production `apphole.pro` uses live-mode keys.
9. **Scan quotas:** Free 3 / rolling 31 days, 8 pages. Pro 40 / 31 days, 24 pages. Cookie anonymous id + optional user id.
10. **Retention:** Scans kept in the store (capped at 400 records). Deletion via hello@apphole.pro until a self-serve delete button exists.
11. **Public vs authenticated scanning:** v1 is public GET-only. No passwords collected. Authenticated flows are Pro later.
12. **Findings vs AI:** Deterministic checks create findings from evidence. Optional LLM rewrite requires `APPHOLE_AI_PLUGS=1` plus a model key. It cannot add holes. Ambient API keys are ignored unless that flag is set.

SSRF: private hosts, localhost, metadata IPs, CGNAT, and IPv4-mapped IPv6 are rejected after DNS lookup. Scan fetches do not follow redirects onto those addresses.
