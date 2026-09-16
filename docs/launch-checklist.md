# AppHole.pro launch checklist

The app is wired. These steps need account access that is not in this repo.

## 1. GitHub

Remote is `https://github.com/aurelius-in/apphole` (it was empty when this MVP was created).

```bash
cd C:\local\AppHole
gh auth switch --user aurelius-in
git push -u origin main
```

Do not force-push.

## 2. Vercel

1. Install CLI if needed: `npm i -g vercel`
2. `npx vercel login`
3. From `C:\local\AppHole`: `npx vercel` (preview), then `npx vercel --prod`
4. In the Vercel project: Settings, Domains, add `apphole.pro` and `www.apphole.pro`
5. Copy the exact DNS records Vercel shows. Do not guess.

Set environment variables in Vercel (Production and Preview):

```
NEXT_PUBLIC_SITE_URL=https://apphole.pro
AUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
BLOB_READ_WRITE_TOKEN=
BLOB_STORE_ID=
```

`AUTH_SECRET` is required in production (16+ characters). Without it, signup and login return 503 and sessions are not minted. Do not reuse the local fallback.

Scans must persist across serverless instances. Do not rely on `data/store.json` on Vercel. This project is connected to a private Vercel Blob store (`apphole-data`) which sets `BLOB_READ_WRITE_TOKEN` and `BLOB_STORE_ID`. You can instead set `DATABASE_URL` (preferred for users, leads, and scans in one durable database) or Upstash `KV_REST_API_URL` + `KV_REST_API_TOKEN`. Rate limits today are per serverless instance; a Redis/Postgres limiter would be stricter.

Optional notify for plug quotes: `PLUG_LEAD_NOTIFY_EMAIL` plus `RESEND_API_KEY`, or `PLUG_LEAD_WEBHOOK_URL`.

Optional: `OPENAI_API_KEY` plus `APPHOLE_AI_PLUGS=1` for plug wording only.

## 3. GoDaddy DNS for AppHole.pro

Registrar: GoDaddy. Domain: AppHole.pro.

1. Log in to GoDaddy and open DNS for `apphole.pro`
2. Apply the records Vercel currently lists. Typical shape (verify in Vercel first):
   - Apex `A` to Vercel anycast IPv4 (often `76.76.21.21`, confirm)
   - `www` `CNAME` to `cname.vercel-dns.com` (confirm)
3. Remove GoDaddy parking or sales page records that conflict
4. Wait for TLS on both hosts
5. Prefer `https://apphole.pro` as canonical and redirect `www`

If you would rather have GoDaddy support do it, send them the records from Vercel and say you need `apphole.pro` pointed at that Vercel project.

No GoDaddy API key was present on this machine, so DNS cannot be changed from here.

## 4. Stripe

No Stripe CLI and no AppHole Stripe keys were found. Do not reuse keys from other products.

In Stripe test mode first:

1. Create product `AppHole Pro` with a monthly recurring price
2. Copy the price id into `STRIPE_PRO_PRICE_ID`
3. Put test secret and publishable keys in `.env.local` and Vercel
4. Webhook endpoint: `https://apphole.pro/api/stripe/webhook`
   Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
5. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`
6. Test subscribe, failed payment, cancel, billing portal
7. Confirm Free users stay Free and Pro users can retest
8. Only then switch to live-mode keys and a live price id

Local webhook forwarding once Stripe CLI is installed:

```bash
stripe listen --forward-to localhost:3333/api/stripe/webhook
```

## 5. Email (later)

After DNS: `hello@apphole.pro` and `reports@apphole.pro` on Resend or Postmark. Not required for scans.

Plug-quote leads are stored in `data/store.json` (`plugLeads`). To email the team when someone submits the form, set in Vercel:

```
PLUG_LEAD_NOTIFY_EMAIL=hello@apphole.pro
PLUG_LEAD_FROM_EMAIL=AppHole <hello@apphole.pro>
RESEND_API_KEY=
```

Optional: `PLUG_LEAD_WEBHOOK_URL` to POST the lead JSON to Slack or your own inbox worker. Quote follow-up is manual. Do not create a Stripe charge for quotes.

## 6. Verify production

- `https://apphole.pro` and `https://www.apphole.pro`
- HTTPS, no parking page
- Wordmark and logo in the header
- Submit an authorized public URL and get a real report
- OG image loads
- Stripe success/cancel URLs use `https://apphole.pro`
