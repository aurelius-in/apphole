# AppHole — Full Context, Goals, Product Instructions, Build Plan, and Decision Log

**Working domain:** `AppHole.pro`  
**Primary brand:** AppHole  
**Planned plans:** Free and Pro  
**Purpose of this document:** Give Cursor, another coding agent, or a human developer enough context to build AppHole from the current concept into a credible MVP and then extend it without losing the product idea, brand voice, or prioritization philosophy.

---

# 1. Executive Summary

AppHole is a pre-customer-readiness product for people who have built an app, often with AI, and need to know whether the app is actually ready to put in front of customers.

The metaphor is simple:

> **Your app has holes. AppHole finds them before your customers do.**

AppHole should inspect an app for the things that can:

- break the experience
- confuse a new user
- prevent signup or login
- block activation
- prevent payment
- create trust problems
- expose embarrassing production mistakes
- create support problems
- create obvious security or permissions problems
- make the product look unfinished
- contradict the product's pricing or promise
- make a customer leave before experiencing value

The key differentiator is that AppHole must **not** become another giant automated checklist that tells builders to fix everything.

Every finding should be placed into one of four dispositions:

1. **FIX BEFORE SELLING**
2. **TEST BEFORE BUILDING**
3. **NOT BLOCKING A SALE**
4. **COULDN'T VERIFY**

The product's real value is not "we found 47 issues."

The value is:

> **These are the few holes worth delaying a customer encounter for. These other things can wait.**

AppHole sits conceptually before Make it RAIN:

> **BUILD → APPHOLE → MAKE IT RAIN → BUYER**

AppHole answers:

> **Is this app ready to survive contact with a customer?**

Make it RAIN answers downstream commercial questions such as:

- who is the likely buyer?
- what problem are we selling?
- how should we test demand?
- what should we charge?
- how do we reach prospects?
- what happens when we ask someone to pay?

Do not blur those products.

---

# 2. Why AppHole Exists

AI coding tools have dramatically reduced the effort required to build apps.

That creates a new problem:

A builder can get an app to "basically works on my machine" very quickly and then assume it is ready to sell.

Common examples:

- checkout fails on mobile
- signup succeeds but the user lands on an empty screen
- password reset is broken
- pricing says one thing on the landing page and another in checkout
- paid features do not unlock
- the user cannot find support
- the app contains debug output or staging URLs
- the core workflow works, but the customer never knows what to do first
- the app has no actual purchase moment
- the builder is about to spend two more weeks building a feature no buyer has asked for

AppHole should catch both kinds of failure:

## A. Real blockers

Problems that can prevent a customer from successfully using or paying for the product.

## B. Builder procrastination disguised as product improvement

Problems that are real imperfections but not rational reasons to postpone selling.

AppHole is therefore both:

- a readiness scanner
- a prioritization system

---

# 3. Brand Context

## Brand name

**AppHole**

The name intentionally works as a double meaning.

It means a "hole in an app," but it also sounds like "asshole."

The humor is intentional. The product should be willing to acknowledge the joke without making the entire product juvenile.

The desired visitor reaction is:

> "That's funny."

followed immediately by:

> "Actually, I need this."

The joke gets attention. The product earns trust.

---

# 4. Domain

The domain **AppHole.pro** has been purchased from GoDaddy.

The `.com` is currently being held for approximately $10,000, which is not worth paying.

The `.pro` extension is not merely a fallback. It can be integrated into the brand:

- AppHole.pro — the site
- AppHole Pro — paid plan
- become an AppHole Pro
- have an AppHole pro check it
- make your app AppHole-proof
- AppHole-proof your app

Do **not** rename the entire brand to "AppHole Pro."

Preferred hierarchy:

- **Brand:** AppHole
- **Domain:** AppHole.pro
- **Free plan:** AppHole Free
- **Paid plan:** AppHole Pro
- **Assessment:** AppHole Check
- **Output:** AppHole Report
- **Desired state:** AppHole-proof

---

# 5. Visual Identity and Existing Assets

Two key graphics have already been created.

Use the following filenames in the project:

```text
/public/ah-logo.png
/public/ah-title.png
```

## ah-logo.png

This is the standalone emblem.

Visual characteristics:

- red apple
- large circular hole through the center
- subtle folded/wrinkled shape around the center hole
- center is physically open, not just a black dot
- black/dark stem
- blue arc/swoosh on the left
- green arc/swoosh on the right
- glossy/high-contrast visual treatment
- playful, slightly provocative, but not explicit

## ah-title.png

This is the AppHole wordmark.

Visual characteristics:

- `App` in glossy blue
- `H`, `l`, and `e` in glossy green
- `o` represented by the red AppHole apple
- black stem
- modern technical rounded lettering
- white background in the source image

## Visual design direction

Use the logo as inspiration, but do **not** make the entire UI glossy or cartoonish.

The app should feel like:

- developer tooling
- modern SaaS
- polished QA/readiness product
- technically credible
- slightly irreverent

Recommended palette:

- bright blue
- vivid green
- strong red
- charcoal / black
- white
- very light gray

Avoid unrelated brand colors.

Use the colorful identity mainly for:

- logo
- status accents
- buttons
- small brand flourishes

Most screens should remain clean and neutral.

---

# 6. Core Brand Language

## Strongest primary lines

These are approved or strongly preferred.

### Hero candidate

> **Don't expose your AppHole in public.**

### Serious supporting line

> **Find the holes before your customers do.**

### Outcome language

> **Make your app AppHole-proof.**

### CTA

> **Check my AppHole**

### Alternative CTA

> **Find my AppHoles**

---

# 7. Humor and Slogan Bank

The rule for AppHole humor is important:

A line should still work grammatically if the word "AppHole" were replaced with "asshole."

That is what makes the joke land.

Useful lines developed so far:

- Everybody has an AppHole. Smart builders check theirs before launch.
- Your AppHole may be bigger than you think.
- One bad AppHole can ruin the whole experience.
- If your AppHole is causing problems, we should look at it.
- We inspect AppHoles so your customers don't have to.
- Don't ship with your AppHole wide open.
- Fix your AppHole before somebody complains about it.
- Your AppHole is nobody else's responsibility.
- A neglected AppHole eventually becomes a customer problem.
- Before customers touch it, check your AppHole.
- We've seen worse AppHoles. Probably.
- Find the AppHole or BE the AppHole.
- Bobbing for AppHoles.
- Don't expose your AppHole in public.
- Check your AppHole before you show it to customers.
- Nobody wants to discover your AppHole after launch.
- Take care of your AppHole before it becomes someone else's problem.
- Your AppHole shouldn't be the first thing customers notice.
- No customer wants to deal with an AppHole.
- We plug your app hole. AppHole.

Do not put all of these on one page.

The humor must be used as a hook, not as a substitute for explaining the product.

---

# 8. Landing Page Strategy

The landing page should create this sequence in the visitor's mind:

1. That's funny.
2. I immediately understand the basic concept.
3. Those are exactly the things I worry I may have missed.
4. Interesting, it won't tell me to fix everything.
5. I can see what the report actually looks like.
6. This appears to be a legitimate technical product.
7. Fine. Check my AppHole.

## Recommended hero

Eyebrow:

> PRE-CUSTOMER APP READINESS

Headline:

> **Don't expose your AppHole in public.**

Supporting copy:

> AppHole checks your app for the things that can break, confuse, embarrass, or stop a customer from buying, then tells you what actually deserves fixing before you sell.

Primary CTA:

> **Check my AppHole**

Secondary CTA:

> **See an example report**

Microcopy:

> No giant generic checklist. No excuse to disappear into another month of coding.

---

# 9. Landing Page Accordion Concept

A useful section can use the slogan bank as accordion headings.

Recommended section:

## APPHOLE ANATOMY

Headline:

> **Everybody has an AppHole.**

Supporting line:

> The trick is knowing which ones matter before a customer finds them for you.

Recommended accordion items:

### Everybody has an AppHole. Smart builders check theirs before launch.

Explain that every shipped app has imperfections, but the relevant question is whether those imperfections can stop signup, understanding, trust, usage, payment, or recovery.

### Your AppHole may be bigger than you think.

Explain that not all holes are software bugs. A technically functioning product can still have:

- no purchase moment
- contradictory pricing
- unclear onboarding
- no support path
- no clear first action
- promises the product does not deliver

### One bad AppHole can ruin the whole experience.

Explain the customer sequence:

> Homepage → Signup → Verification → First Use → Value → Payment → Support

One critical failure can make the whole product feel broken.

### We inspect AppHoles so your customers don't have to.

Explain that customers generally do not file useful bug reports; they leave.

### Don't ship with your AppHole wide open.

Use this for production hygiene and obvious security/permissions problems.

### Fix your AppHole before somebody complains about it.

Use this to explain dispositions and prioritization.

### A neglected AppHole eventually becomes a customer problem.

Use this to explain how small UX/production mistakes become support, refund, and churn problems.

### Before customers touch it, check your AppHole.

Use this to explain the simple scan workflow.

### We've seen worse AppHoles. Probably.

Use as the lighter final item.

Explain that AppHole is not looking for perfection. The goal is:

> **READY TO FACE CUSTOMERS**

---

# 10. "Bobbing for AppHoles" Section

A large check-category section can use:

> **Bobbing for AppHoles.**

Subhead:

> We look in the places customers are most likely to fall into one.

This can show the main check categories as clean cards.

---

# 11. Core Product Output

The product output should resemble:

## 7 holes between this app and sellable

Example:

```text
🔴 Checkout fails on mobile
FIX BEFORE SELLING

🔴 Password reset link is broken
FIX BEFORE SELLING

🔴 New users land on an empty dashboard
FIX BEFORE SELLING

🟠 No clear paid action exists
TEST BEFORE BUILDING

🟠 Pricing contradicts the product
TEST BEFORE BUILDING

🟡 Privacy language is incomplete
NOT BLOCKING A SALE

✅ Core workflow works
PASS
```

At the bottom:

> **Verdict: Plug 3 AppHoles before putting this in front of buyers.**

This type of summary is central to the product.

---

# 12. Dispositions

Every meaningful finding must receive one of these dispositions.

## FIX BEFORE SELLING

Definition:

A problem serious enough that it can plausibly prevent a reasonable customer from successfully using, trusting, or paying for the product.

Examples:

- checkout broken
- signup impossible
- core workflow crashes
- severe mobile failure
- user data exposed
- paid feature never unlocks
- broken password reset when recovery is essential

## TEST BEFORE BUILDING

Definition:

Something may matter, but there is insufficient evidence to justify more development before talking to buyers.

Examples:

- no Slack integration
- no annual plan
- no team collaboration
- missing export format
- feature request not yet tied to buying behavior

This disposition is a major differentiator.

AppHole should actively protect builders from endless build mode.

## NOT BLOCKING A SALE

Definition:

A real imperfection that should not justify postponing customer conversations.

Examples:

- no dark mode
- imperfect spacing
- empty blog
- animation polish
- cosmetic inconsistency
- nice-to-have settings

## COULDN'T VERIFY

Definition:

AppHole did not have enough access or conditions to honestly test the behavior.

Examples:

- cancellation requiring an active paid subscription
- admin-only workflow
- account deletion requiring privileges
- email flow blocked by inaccessible inbox
- checkout requiring production payment credentials

AppHole should always prefer "couldn't verify" over pretending a check was completed.

---

# 13. Top-Level Readiness Verdicts

Use judgment-oriented verdicts rather than arbitrary 82/100 scoring.

Recommended statuses:

## READY TO FACE CUSTOMERS

No known blocker justifies delaying a buyer conversation.

## PLUG THESE FIRST

A small number of observed holes could materially interfere with a customer or sale.

## NOT READY FOR CUSTOMERS

Critical workflow, trust, payment, or permissions issues exist.

## INCOMPLETE CHECK

Important paths could not be verified.

---

# 14. AppHole Categories to Check

AppHole should inspect broadly.

The following categories define the product backlog.

## Core functionality

Check for:

- broken links
- dead buttons
- 404s
- crashes
- broken forms
- failed requests
- bad redirects
- missing assets
- disabled primary actions
- JavaScript errors
- broken core workflow

## Signup and login

Check for:

- signup failures
- verification failures
- login loops
- OAuth errors
- password-reset failures
- session loss
- confusing authentication states

## First-run experience

Check for:

- blank dashboard
- unclear next action
- missing empty state
- onboarding dead ends
- no example/demo content where needed
- setup that strands the user

## Activation

Check whether a new user can reasonably reach the product's core value.

The app may function technically but still fail activation.

## Mobile

Check:

- responsive layout
- clipped content
- inaccessible buttons
- tiny tap targets
- modal traps
- horizontal scrolling
- mobile checkout
- form behavior
- mobile navigation

## Browser compatibility

At minimum eventually test:

- Chromium
- Safari/WebKit
- Firefox

Check:

- layout differences
- browser back behavior
- popup behavior
- state persistence
- incompatible APIs

## Payment and checkout

Check:

- checkout route exists
- upgrade path works
- prices match
- selected plan matches checkout
- successful payment changes entitlement
- receipt/confirmation exists
- payment failure is understandable
- billing state is visible
- paid features unlock properly

Do not use real payment cards in automation.

Use authorized test environments or only inspect the public purchase path unless the user provides a safe test setup.

## Purchase moment

This is important.

Check whether the app actually gives the user a clear buying decision.

Questions:

- Can a user tell what is free and what is paid?
- Does the user encounter a reason to upgrade?
- Is the CTA shown at the right point?
- Can the user understand what they receive?
- Is there a clear path from value to payment?

Important product insight:

> "Nobody paid" and "nobody ever had to decide whether to pay" are different problems.

## Pricing consistency

Check:

- landing page pricing
- pricing page
- checkout
- account/billing page
- plan feature tables
- upgrade modals

Flag contradictions.

## Trust

Check for:

- company identity
- support path
- contact method
- product name consistency
- broken social links
- suspicious claims
- fake-looking placeholders
- outdated pages
- obvious unfinished state
- inconsistent branding

## Support

Check:

- support link works
- contact form works
- support email is visible where appropriate
- failed workflows have recovery paths
- user is not trapped after an error

## Privacy

Check:

- privacy policy exists
- link works
- basic product behavior does not obviously contradict the policy
- data deletion/contact path exists when relevant

Do not present this as legal advice.

## Terms

Check:

- terms page exists when appropriate
- links work
- refund/cancellation wording does not obviously contradict the checkout/product flow

Do not present this as legal certification.

## Security and permissions

Only perform safe, authorized, non-destructive checks.

Possible checks:

- exposed client-side secrets
- unsafe public admin routes
- authorization failures
- cross-user resource access
- role restrictions
- insecure defaults
- missing obvious security headers
- accidental debug endpoints

AppHole is **not** a penetration test.

Do not run intrusive exploit attempts without explicit authorization.

## Data integrity

Check:

- saved data persists
- refresh does not lose work
- duplicates are not created unexpectedly
- dates/currencies format correctly
- export works
- destructive actions are confirmed
- one user's data does not appear in another user's account

## Email

Where possible:

- verification email
- password reset email
- receipt
- notification links
- expiration behavior
- sender identity

## Error handling

Check for:

- raw stack traces
- meaningless error codes
- `[object Object]`
- console errors
- silent failures
- user blamed for system errors
- no recovery guidance

## Navigation

Check:

- logo/home behavior
- back navigation
- major pages discoverable
- primary CTA consistency
- dead-end screens
- conflicting navigation patterns

## Copy/content

Check:

- lorem ipsum
- TODO text
- placeholder copy
- spelling errors
- inconsistent product name
- old product name
- unfinished developer notes
- misleading buttons

## Promise consistency

Check whether the marketing promise matches what the product actually does.

Examples:

- screenshot shows nonexistent feature
- pricing says unlimited but app imposes a hard limit
- landing page promises export but app has no export
- documentation is from an older product version

## Plan gating

Check:

- advertised plan entitlements
- upgrade prompt behavior
- paid user permissions
- free user restrictions
- incorrect paywalls
- paid user still sees upgrade prompts

## Cancellation

Where safe and possible:

- can user find cancellation?
- does cancellation actually change subscription state?
- is billing language clear?
- is downgrade path coherent?

## Accessibility

Basic automated checks:

- keyboard access
- form labels
- button names
- contrast
- image alt text
- landmark structure
- obvious screen-reader semantics

Do not claim full WCAG certification.

## Performance

Check:

- first load
- slow core interactions
- API timeout behavior
- oversized images/assets
- endless spinners
- severe layout shift
- obvious blocking scripts

## Production hygiene

Check:

- localhost links
- staging domains
- test credentials
- debug tools
- developer panels
- console spam
- test Stripe configuration
- staging banners
- placeholder users/data
- accidental environment leakage

---

# 15. Evidence Requirements

Every finding should include evidence whenever possible.

Recommended fields:

- title
- severity
- disposition
- category
- summary
- observed behavior
- expected behavior
- URL
- browser/device
- steps to reproduce
- screenshot
- console errors
- network errors
- timestamp
- confidence
- why it matters
- recommended plug
- verification/retest instructions

Do not produce vague findings such as:

> "Improve your UX."

Prefer:

> "A new account reaches `/dashboard` with no projects, no instruction, and no visible primary action. A first-time user cannot determine how to begin."

---

# 16. "Plug" Concept

AppHole should eventually do more than diagnose.

Conceptual workflow:

```text
FIND THE HOLE
↓
SHOW THE EVIDENCE
↓
DECIDE WHETHER IT MATTERS
↓
PROPOSE THE PLUG
↓
HUMAN APPROVES
↓
RETEST
```

For MVP, a plug can simply be:

- recommended change
- code-oriented guidance
- exact page/component likely affected
- copy suggestion
- UX recommendation
- test instructions

Future versions can optionally connect to the repository and generate:

- proposed patch
- diff
- pull request

Never silently deploy changes.

---

# 17. Product Safety and Authorization

AppHole must not become a general-purpose hacking tool.

Before scanning, require the user to confirm that they own the app or are authorized to test it.

Rules:

- do not run destructive actions
- do not attempt denial of service
- do not exploit known vulnerabilities to gain access
- do not brute-force credentials
- do not submit real payments
- do not delete user data
- do not change production data unless the user explicitly authorizes a safe test account/workspace
- rate-limit scanning
- keep logs
- label any intrusive check as unsupported until an explicit authorized mode exists

Security checks should focus on obvious, safe signals in v1.

---

# 18. Recommended MVP Product Flow

## Step 1: User arrives

Landing page explains the product.

Primary CTA:

> **Check my AppHole**

## Step 2: User enters app URL

Input:

```text
https://myapp.com
```

Require:

- URL
- ownership/authorization checkbox

Optional later:

- test account username
- test account password
- test instructions
- repo connection

## Step 3: Preflight

Check:

- URL reachable
- TLS/HTTPS
- page title
- basic metadata
- obvious errors

## Step 4: Browser scan

Use browser automation to inspect public flows.

Initial MVP can be limited to:

- homepage
- primary CTA
- signup
- login page
- obvious onboarding path
- navigation
- pricing
- checkout entry point
- support
- privacy/terms
- mobile viewport
- console/network errors

## Step 5: Analyze evidence

Normalize observations into findings.

## Step 6: Classify findings

Apply the disposition logic.

## Step 7: Generate report

Provide:

- readiness verdict
- top blockers
- prioritized holes
- passes
- couldn't verify
- recommended plugs

## Step 8: Retest

Pro users should eventually be able to rerun the same checks after fixes.

---

# 19. Recommended Internal Architecture

This is a suggested architecture, not a rigid requirement.

A coding agent may choose an equivalent stack if there is a clear reason.

## Frontend

Recommended:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui or similar accessible component library

Reasons:

- easy deployment
- strong developer ecosystem
- good fit for Vercel
- easy API routes / server actions
- strong component system

## Authentication

Recommended candidates:

- Supabase Auth
- Clerk
- Better Auth

Prefer a low-friction option.

Free users should not be forced through excessive onboarding before seeing value.

Possible pattern:

1. allow URL submission
2. run limited preview scan
3. require account/email to save/view full report

Do not introduce friction simply because SaaS apps usually do.

## Database

Recommended:

- Postgres
- Supabase Postgres is acceptable for MVP

Likely tables/entities:

- users
- accounts/workspaces
- subscriptions
- apps
- scan_runs
- scan_targets
- findings
- evidence
- dispositions
- reports
- check_definitions
- events

## Background work

Scanning should happen in background jobs.

Possible options:

- Vercel background functions if sufficient
- Trigger.dev
- Inngest
- Temporal later if orchestration becomes complex
- separate worker service

Avoid holding a normal HTTP request open for a full scan.

## Browser automation

Recommended:

- Playwright

Eventually support:

- Chromium
- WebKit
- Firefox

MVP can begin with Chromium + mobile viewport, then expand.

## Accessibility

Recommended:

- axe-core integrated into Playwright

## Performance

Possible:

- Lighthouse / Lighthouse CI
- Playwright timings
- Web Performance APIs

Do not treat Lighthouse as the entire product.

## Static/security signals

Possible tools/libraries:

- response header inspection
- dependency checks if repo connected
- secret pattern scanning if repo connected
- console/network error collection

Avoid invasive security scanners in v1.

## Screenshots

Capture screenshots at:

- major workflow states
- failed actions
- error screens
- mobile failures

Store only what is necessary.

## AI analysis

An LLM can help with:

- summarizing evidence
- classifying a finding
- explaining impact
- proposing a plug
- distinguishing blocker vs polish

However:

- evidence should come from deterministic observations where possible
- the LLM must not invent failures
- every AI-generated finding should reference actual evidence
- "couldn't verify" is preferable to hallucination

---

# 20. Suggested Finding Schema

Example logical structure:

```json
{
  "id": "finding_123",
  "scan_id": "scan_456",
  "category": "payments",
  "title": "Checkout fails on mobile",
  "observed": "Tapping Pay on a 390px viewport returns an error state.",
  "expected": "User should reach a functional checkout.",
  "disposition": "FIX_BEFORE_SELLING",
  "severity": "high",
  "confidence": 0.96,
  "url": "https://example.com/checkout",
  "viewport": "390x844",
  "browser": "chromium",
  "evidence": [
    {
      "type": "screenshot",
      "path": "..."
    },
    {
      "type": "console_error",
      "value": "..."
    }
  ],
  "why_it_matters": "A mobile customer cannot complete a purchase.",
  "recommended_plug": "Fix the mobile payment handler and retest checkout."
}
```

---

# 21. Free vs Pro

Only two plans are needed.

Do not create a complicated pricing ladder.

Pricing itself is still a decision to make later.

## AppHole Free

Free must provide real value.

Suggested Free scope:

- one public app
- limited scan depth
- homepage + major public routes
- basic mobile check
- basic console/network errors
- obvious production hygiene
- top AppHoles
- basic disposition summary
- one example recommended plug
- limited scan frequency

Possible limit:

- 1 or a few scans per month

Do not lock everything useful behind the paywall.

The free scan should make the user understand the product.

## AppHole Pro

Suggested Pro capabilities:

- deeper scan
- authenticated workflows
- additional routes
- more browser/device coverage
- recurring retests
- full evidence
- full finding history
- saved app profiles
- deeper payment/onboarding tests
- downloadable/shareable report
- more recommended plugs
- future repo connection
- future proposed code patches
- team/agency features only if real demand appears

Avoid prematurely building a multi-tier enterprise pricing structure.

---

# 22. Landing Page Example Report

The landing page should show a realistic visual report.

Example:

> **7 AppHoles found**

- Checkout fails on mobile — FIX BEFORE SELLING
- New users land on an empty dashboard — FIX BEFORE SELLING
- Password reset link is broken — FIX BEFORE SELLING
- No clear paid action exists — TEST BEFORE BUILDING
- Pricing contradicts the product — TEST BEFORE BUILDING
- Privacy language incomplete — NOT BLOCKING A SALE
- Core workflow works — PASS

Verdict:

> **Plug 3 AppHoles before putting this in front of buyers.**

Do not imply the report came from a real customer unless it did.

Label it:

> Example AppHole Report

---

# 23. Landing Page Content Structure

Recommended page order:

1. Header / wordmark
2. Hero
3. URL input / CTA
4. Example AppHole Report
5. Explanation of dispositions
6. AppHole Anatomy accordion
7. Bobbing for AppHoles category grid
8. Detailed example finding
9. How it works
10. AppHole-proof positioning
11. Free vs Pro
12. FAQ
13. Final CTA
14. Footer

---

# 24. Free vs Pro Landing Page Section

Keep it simple.

## Free

Suggested copy:

> **Find the obvious holes.**

Possible bullets:

- public URL scan
- major flow checks
- basic mobile check
- top findings
- readiness verdict

CTA:

> **Check my AppHole**

## Pro

Suggested copy:

> **Go deeper. Retest. Plug more holes.**

Possible bullets:

- deeper checks
- authenticated workflows
- more browsers/devices
- full evidence
- saved scan history
- retesting
- advanced plugs/remediation guidance

CTA:

> **Go Pro**

Do not publish pricing until a pricing decision is made.

Use "Coming soon" only if necessary and truthful.

---

# 25. Landing Page Copy Guardrails

Do not use generic startup language such as:

- revolutionize
- transform your business
- unlock your potential
- seamless
- cutting-edge
- game-changing
- start your journey

Prefer concrete language.

Good:

> Checkout fails on mobile.

Bad:

> Optimize your digital commerce journey.

Good:

> New users land on a blank dashboard.

Bad:

> Improve activation through enhanced onboarding experiences.

---

# 26. Social Proof Guardrails

Until real customers exist, do not invent:

- testimonials
- scan counts
- conversion lifts
- customer logos
- ratings
- revenue impact
- "trusted by thousands"

Use credibility through:

- transparent methodology
- realistic example reports
- visible evidence
- clear limitations
- honest product claims

---

# 27. SEO

Recommended title:

> **AppHole | Find the holes in your app before customers do**

Recommended meta description:

> **AppHole checks shipped and nearly shipped apps for broken flows, onboarding problems, payment issues, trust gaps, production mistakes, and other holes worth fixing before customers find them.**

H1 candidate:

> **Don't expose your AppHole in public.**

---

# 28. FAQ

Include at minimum:

## What is an AppHole?

Something in a shipped or nearly shipped app that can break the customer experience, undermine trust, block payment, or create a problem worth fixing before selling.

## Is this just another bug scanner?

No. Bugs are one class of AppHole. AppHole also looks at onboarding, payment, trust, support, mobile behavior, purchase paths, permissions, production hygiene, and other things customers actually encounter.

## Will it find every problem?

No. AppHole should tell the user what it checked, what it observed, and what it could not verify.

## Does passing mean customers will buy?

No. AppHole tests readiness, not demand.

## Will AppHole automatically change my code?

For MVP:

No. It shows evidence and recommends the plug. The user decides what gets changed.

This can change later if repository-connected remediation exists.

## Do I have to fix everything?

No.

That is one of the reasons AppHole exists.

Explain:

- FIX BEFORE SELLING
- TEST BEFORE BUILDING
- NOT BLOCKING A SALE
- COULDN'T VERIFY

## Is this a security audit?

No.

AppHole can catch obvious security/permission problems but is not a penetration test, compliance audit, or certification.

---

# 29. Analytics

Implement analytics hooks even if the provider is chosen later.

Suggested events:

```text
ah_landing_view
ah_hero_cta_click
ah_url_submit
ah_scan_authorization_confirmed
ah_scan_started
ah_scan_completed
ah_scan_failed
ah_report_viewed
ah_finding_expanded
ah_disposition_viewed
ah_example_report_viewed
ah_free_signup
ah_pro_click
ah_checkout_started
ah_subscription_started
ah_retest_started
ah_faq_expand
```

Recommended lightweight analytics candidates:

- PostHog
- Plausible
- Umami

Use whichever best fits the deployment and privacy model.

---

# 30. Stripe Integration

Stripe should handle paid subscriptions.

Do not build custom card handling.

## Recommended model

Free plan:

- no payment method required

Pro plan:

- Stripe subscription

Pricing amount and billing cadence remain decisions for later.

Possible choices:

- monthly only initially
- monthly + annual later

Keep it simple.

## Stripe implementation

Use:

- Stripe Checkout
- Stripe Billing Portal
- Stripe webhooks
- Stripe Customer ID stored in the user/account record
- subscription status synchronized from webhooks

Required environment variables will likely include:

```text
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRO_PRICE_ID
```

Never commit secrets.

Use `.env.local` for local development and hosting-provider environment variables for production.

## Stripe test process

Before launch:

1. use Stripe test mode
2. create test Pro product/price
3. test subscribe
4. test failed payment
5. test cancel
6. test billing portal
7. test webhook synchronization
8. confirm Free users remain Free
9. confirm Pro users gain Pro entitlements
10. only then switch to live-mode product/price IDs

Do not claim the Pro plan is live until this is verified.

---

# 31. Domain and GoDaddy DNS Instructions

The domain is:

> **AppHole.pro**

Registrar:

> **GoDaddy**

Recommended hosting for a Next.js MVP:

> **Vercel**

Equivalent hosting is acceptable if the coding agent has a strong reason.

## Important rule

Do not blindly use hardcoded DNS values from this document if the hosting provider gives different/current values.

Always use the exact DNS records shown by the hosting provider for the project.

## Typical Vercel flow

1. Deploy the app to Vercel.
2. In Vercel, add:
   - `apphole.pro`
   - `www.apphole.pro`
3. Vercel will display the required DNS records.
4. Log into GoDaddy.
5. Open the DNS manager for `AppHole.pro`.
6. Replace/add the records Vercel requests.
7. Remove conflicting parked-domain records if necessary.
8. Wait for verification.
9. Confirm SSL certificate becomes active.
10. Test:
    - `https://apphole.pro`
    - `https://www.apphole.pro`
11. Choose one canonical domain and redirect the other.

Typical values may resemble:

- root `A` record
- `www` CNAME

But use the values currently provided by Vercel rather than assuming older examples are correct.

## If the AI agent has browser access

The AI may guide the user step-by-step.

If login or authentication is required, it should pause and ask the user to take over or provide access in an authorized environment.

Do not request passwords in chat.

## If GoDaddy support/chat is preferred

The user may contact GoDaddy support and say, approximately:

> "I own AppHole.pro and have deployed the site on Vercel. I need the domain connected to the Vercel project. Here are the DNS records Vercel says I need. Please help me update the DNS and make apphole.pro the primary domain."

The same pattern works for another hosting provider.

## DNS verification checklist

- root domain resolves
- www resolves
- canonical redirect works
- HTTPS works
- no GoDaddy parking page remains
- no mixed-content errors
- Open Graph metadata uses the canonical domain
- Stripe success/cancel URLs use the production domain
- authentication callback URLs use the production domain
- email links use the production domain

---

# 32. Email and Transactional Messages

A transactional email provider may be needed later.

Recommended candidates:

- Resend
- Postmark

Likely messages:

- account verification
- magic login link
- scan complete
- Pro subscription confirmation
- failed scan
- report share link

Use a domain-specific sender after DNS setup, such as:

```text
hello@apphole.pro
reports@apphole.pro
```

Do not implement marketing email without consent.

---

# 33. Hosting and Deployment

Recommended:

- GitHub repository
- Vercel deployment
- preview deployment for pull requests
- production deployment from main branch

CI should include:

- lint
- typecheck
- unit tests
- critical Playwright smoke tests

Do not deploy failing builds.

---

# 34. Suggested Repository Structure

Example only:

```text
apphole/
  app/
    (marketing)/
    dashboard/
    api/
  components/
  lib/
    auth/
    db/
    billing/
    scans/
    findings/
    ai/
  workers/
  tests/
    e2e/
  public/
    ah-logo.png
    ah-title.png
  docs/
    apphole_full_context_goals_instructions.md
```

The coding agent can adapt this to the framework.

---

# 35. App UI

The product UI should not look like a marketing toy.

Recommended dashboard structure:

## Left navigation

- Overview
- Apps
- Scans
- Findings
- Retests
- Billing
- Settings

For a single-app MVP, simplify further.

## App overview

Show:

- app URL
- last scan
- readiness verdict
- number of blockers
- number to test
- number not blocking
- unverified checks
- run new check

## Scan result

Top:

> **7 AppHoles found**

Then prioritized findings.

Filter by:

- disposition
- category
- status

Each finding can expand to show evidence and recommended plug.

---

# 36. Example Detailed Finding

## APPHOLE #03

### New users land on a blank dashboard

**Disposition:** FIX BEFORE SELLING

**Observed**

A new account reaches `/dashboard` after verification with no projects, no instruction, and no obvious next action.

**Why it matters**

A first-time user can successfully register and still fail to experience the product's value.

**Evidence**

- screenshot
- tested path
- browser/device
- timestamp
- relevant console/network output

**Plug**

Route empty accounts to the first useful action or provide a strong empty-state CTA.

**Retest**

Repeat the same first-user path after the change.

---

# 37. AI Classification Instructions

If an LLM is used to classify findings, give it strict rules.

It should answer:

1. What was actually observed?
2. Is there evidence?
3. Could this plausibly block:
   - understanding?
   - trust?
   - use?
   - payment?
   - support/recovery?
4. Is the proposed fix necessary before selling?
5. Could this instead be a feature hypothesis?
6. Is it merely polish?
7. Was the check actually verifiable?

The model should favor:

- evidence
- restraint
- explicit uncertainty

The model should not reward itself for finding more issues.

---

# 38. The "Fake AppHole" Concept

This concept is strategically important.

Sometimes AppHole detects an imperfection that should explicitly **not** be fixed yet.

Example:

> **Dark mode is missing.**

Is it imperfect?

Yes.

Is there evidence a buyer will refuse to pay without it?

No.

Disposition:

> **NOT BLOCKING A SALE**

Another example:

> **No team collaboration.**

Could it matter?

Yes.

Has any buyer made payment conditional on it?

Unknown.

Disposition:

> **TEST BEFORE BUILDING**

This is one of AppHole's best differentiators.

---

# 39. Relationship to Make it RAIN

AppHole should be able to stand alone.

Do not heavily cross-sell Make it RAIN on the landing page.

Possible post-report handoff later:

> **AppHole says you're ready to face buyers. Now find out who may pay.**

Then:

> Continue to Make it RAIN

This is optional and should not distract from AppHole's job.

---

# 40. Ad/Creative Context

Several ad concepts have already been explored.

## "Don't expose your AppHole in public."

Concept:

A founder publicly demoing an app while obvious code errors, failures, and downward graphs are visible on the big screen.

This communicates embarrassment + readiness failure.

## "Your AppHole shouldn't be the first thing customers notice."

Concept:

A potential customer sees an app screen dominated by an obvious giant hole/void.

## "Before customers touch it, check your AppHole."

Concept:

A polished AppHole report UI showing:

- AppHoles found
- checkout failure
- empty dashboard
- paid action issue
- pricing contradiction
- support gap
- privacy issue
- core workflow pass

## "We've seen worse AppHoles. Probably."

Concept:

Dry/deadpan QA or doctor/diagnostic visual inspecting a catastrophically broken app.

These ad concepts are not product requirements but demonstrate the desired tone.

---

# 41. Landing Page Humor Rules

Every joke should open into substance.

Preferred rhythm:

> **funny headline → real product problem → concrete example → AppHole judgment**

Avoid:

> joke → joke → joke → CTA

Do not use explicit anatomical imagery beyond the abstract apple-hole logo.

Keep the brand cheeky, not pornographic or juvenile.

---

# 42. Accessibility

Landing page and product should include:

- semantic HTML
- visible focus
- keyboard support
- accessible accordions
- alt text
- sufficient contrast
- status icon + text, not color alone
- reduced-motion support
- form labels
- meaningful error states

---

# 43. Performance

Optimize:

- image sizes
- font loading
- layout shift
- JS bundle
- landing page Core Web Vitals

Use framework image optimization.

The hero logo should load quickly.

Do not add a large animation library only to make the logo bounce.

---

# 44. Motion

Use restrained motion only:

- subtle reveal
- small button hover
- accordion transitions
- report-card expansion

Do not:

- spin the AppHole
- pulse the hole continuously
- make the page feel like a novelty site

---

# 45. Privacy

Because AppHole may inspect customer apps, privacy needs attention.

For MVP:

- minimize stored page content
- store screenshots/evidence only when necessary
- disclose what is stored
- allow users to delete scans
- encrypt sensitive stored credentials if authenticated test accounts are added
- avoid storing passwords where possible
- prefer ephemeral test credentials or secure secrets storage

Do not send private app content to third-party AI services without disclosure.

---

# 46. Decisions That Can Be Deferred

The coding agent should **not** block MVP development on these decisions.

They can be revisited later.

## Pricing

Unknown.

Free + Pro is decided.

Exact Pro price is not decided.

## Billing cadence

Monthly vs annual is not decided.

Start monthly only if a choice is needed.

## Auth provider

Supabase/Clerk/Better Auth are all acceptable.

## Database provider

Postgres is preferred.

Supabase is reasonable for MVP.

## Job system

Choose the simplest reliable background-job system that works with hosting.

## Repo integration

Future feature.

Do not make MVP depend on GitHub repository access.

## Autonomous code fixes

Future feature.

MVP can recommend plugs.

## Full multi-browser scanning

MVP may begin with Chromium + mobile emulation.

## Team/agency features

Do not build unless demand appears.

## Make it RAIN integration

Future handoff only.

---

# 47. Decisions That Should Be Made Early

The coding agent should explicitly decide and document:

1. framework
2. hosting
3. database
4. authentication
5. job runner
6. browser automation deployment model
7. evidence storage
8. Stripe integration approach
9. scan quota enforcement
10. how long scans/evidence are retained
11. how public vs authenticated scanning is separated
12. how findings are deterministically backed by evidence

---

# 48. Suggested MVP Build Sequence

## Phase 0 — Project foundation

- initialize repo
- add `ah-logo.png`
- add `ah-title.png`
- add design tokens
- add lint/typecheck/tests
- set up deployment

## Phase 1 — Landing page

Build the full marketing page.

Include:

- hero
- example report
- dispositions
- accordion
- check categories
- how it works
- Free vs Pro
- FAQ
- CTA
- domain-ready metadata

At this phase, if scanning is not ready, the CTA may collect an email/waitlist or go to a safe placeholder flow.

Do not fake a completed scan.

## Phase 2 — Scan intake

Build:

- URL submission
- authorization checkbox
- validation
- scan job creation
- progress state

## Phase 3 — Public browser scan

Use Playwright.

Collect:

- pages
- navigation
- console errors
- failed requests
- screenshots
- mobile viewport
- basic form/CTA behavior

## Phase 4 — Findings engine

Create deterministic checks first.

Examples:

- dead primary links
- console errors
- failed network calls
- missing privacy/support links
- broken mobile layout signals
- placeholder text
- staging URLs
- missing purchase path

## Phase 5 — AI reasoning layer

Use LLM to:

- explain
- classify
- prioritize
- recommend plug

Never allow LLM to invent evidence.

## Phase 6 — Report UI

Build:

- readiness verdict
- findings
- filters
- evidence
- plugs
- passes
- couldn't verify

## Phase 7 — Accounts

Add:

- sign up
- saved scans
- app ownership
- scan history

## Phase 8 — Stripe / Pro

Add:

- Pro checkout
- webhook sync
- entitlements
- billing portal

## Phase 9 — Retest

Allow Pro user to rerun and compare:

- fixed
- unchanged
- new
- could not verify

## Phase 10 — Domain production launch

Connect `AppHole.pro`.

---

# 49. Definition of MVP Success

MVP is successful if a builder can:

1. visit AppHole.pro
2. immediately understand the joke and the product
3. submit a public app URL
4. authorize the check
5. receive a real scan
6. see evidence-backed findings
7. understand what needs fixing now
8. understand what does not need fixing now
9. get at least one useful recommended plug
10. trust that AppHole is not inventing results
11. rerun or upgrade if they want deeper checking

The MVP does **not** need to:

- autonomously repair code
- perform a full penetration test
- inspect every browser
- guarantee market demand
- integrate with every repo host
- provide agency/team workflows

---

# 50. Product North Star

AppHole should optimize for:

> **fewer embarrassing or sale-blocking surprises when a real customer encounters the app**

Not:

- issue count
- scan complexity
- feature count
- theoretical perfection

The best report might find only three meaningful holes.

That is fine.

---

# 51. Tone of Product Findings

Findings should be plain, useful, and a little human.

Good:

> **Checkout fails on mobile.**
>
> We reproduced it on a 390px viewport. The Pay button returns an error before the checkout session opens.
>
> **FIX BEFORE SELLING**

Good:

> **No dark mode.**
>
> Real imperfection. No evidence this blocks a sale.
>
> **NOT BLOCKING A SALE**

Bad:

> **Your digital experience optimization opportunities require strategic enhancement.**

---

# 52. Launch Copy Candidates

Keep these available for A/B testing later.

## Hero variants

- Don't expose your AppHole in public.
- Your app has holes. Find them before your customers do.
- Check your AppHole before you show it to customers.
- Nobody wants to discover your AppHole after launch.
- Make your app AppHole-proof.

Do not rotate these randomly in v1.

Use one controlled hero.

---

# 53. Recommended Initial Landing Page Choice

Ship first with:

## Hero

> **Don't expose your AppHole in public.**

## Subhead

> **Find the holes before your customers do.**

## Description

> AppHole checks the parts of your app customers actually encounter, then separates the holes worth fixing from the things that can wait.

## CTA

> **Check my AppHole**

## Secondary

> **See an example report**

---

# 54. Footer

Use the wordmark.

Suggested links:

- Product
- How it works
- Free vs Pro
- FAQ
- Privacy
- Terms
- Contact

Possible footer line:

> **Don't expose your AppHole in public.**

Secondary:

> **AppHole.pro — Make your app AppHole-proof.**

If owned by Reliable AI Network, Inc., legal/company identity can be shown in the footer once confirmed for launch.

---

# 55. Final Build Instruction to Cursor / Coding Agent

You are not being asked to build a joke website.

You are being asked to build a credible app-readiness product with a memorable brand.

Preserve these principles:

1. Humor earns attention.
2. Evidence earns trust.
3. Prioritization is more valuable than issue volume.
4. Builders should not be encouraged to endlessly polish.
5. AppHole tests readiness, not market demand.
6. Never claim a check was performed when it was not.
7. Every important finding should be reproducible.
8. The product must be safe to use against authorized targets.
9. Free should provide real value.
10. Pro should provide deeper scanning, evidence, history, and retesting.
11. Keep the product technically serious underneath the joke.
12. Optimize for a builder confidently putting the app in front of a real customer.

The core promise is:

> **AppHole finds what could stop your app from surviving contact with a customer, then separates what you should fix from what you should stop hiding in the code to improve.**

And the memorable brand expression is:

> **AppHole.pro — Make your app AppHole-proof.**
