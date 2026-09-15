# AppHole

Pre-customer app readiness. Find the holes before your customers do.

> Don't expose your AppHole in public.

Repo: `C:\local\AppHole` (GitHub: [aurelius-in/apphole](https://github.com/aurelius-in/apphole))  
Product domain: `https://apphole.pro`

## Run locally

```bash
cd C:\local\AppHole
copy .env.example .env.local
npm install
npm run optimize:assets
npm run dev
```

Open [http://localhost:3333](http://localhost:3333).

Free checks do not need Stripe. Add Stripe keys to `.env.local` when you want Checkout for AppHole Pro.

```bash
npm run test
npm run typecheck
npm run build
```

## What it does

1. You paste a public app URL and confirm you are authorized to test it.
2. AppHole fetches the homepage and a limited set of public same-origin routes.
3. It turns observations into findings with dispositions: **FIX BEFORE SELLING**, **TEST BEFORE BUILDING**, **NOT BLOCKING A SALE**, **COULDN'T VERIFY**, or **PASS**.
4. You get a readiness verdict. Not a vanity score.

## Routes

| Path | Purpose |
| --- | --- |
| `/` | Marketing + URL check |
| `/check` | Scan intake |
| `/scan/[id]` | Live progress and report |
| `/example` | Example report |
| `/pricing` | Free vs Pro |
| `/methodology` | What is and is not checked |
| `/dashboard` | Saved scans |
| `/login` `/signup` | Optional accounts |
| `/privacy` `/terms` `/contact` | Legal and contact |
| `/api/scans` | Start a check |
| `/api/stripe/checkout` | Stripe Checkout for Pro |
| `/api/stripe/webhook` | Subscription sync |
| `/api/stripe/portal` | Billing portal |

## Brand

Glossy 3D apple-with-a-hole mark (`public/ah-logo.png`) and wordmark (`public/ah-title.png`). Palette: electric blue `#008CFF`, apple red `#E31B23`, leaf green `#21D14A`, charcoal, white. UI stays mostly clean SaaS; color is for logo, badges, and buttons.

## Deploy

Vercel is the intended host. See `docs/launch-checklist.md` for Stripe, GoDaddy DNS for `AppHole.pro`, and remaining account steps.

Architecture decisions: `docs/architecture.md`.  
Product spec: `docs/apphole_full_context_goals_instructions.md`.
