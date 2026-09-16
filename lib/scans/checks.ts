import { finding } from "@/lib/scans/finding";
import { classifyLink, LOCAL_LEAK_RE, PLACEHOLDER_RE, SECRET_RE, STRIPE_TEST_RE, type ParsedPage } from "@/lib/scans/parse";
import { probeStatus } from "@/lib/scans/http";
import type { Finding, PageSnapshot } from "@/lib/scans/types";

function header(page: ParsedPage, name: string) {
  return page.snapshot.headers[name] || "";
}

function hasRole(pages: ParsedPage[], role: string) {
  return pages.some((page) => {
    if (classifyLink(page.snapshot.finalUrl, page.snapshot.title) === role) return true;
    return page.ctaTexts.some((text) => classifyLink(page.snapshot.finalUrl, text) === role);
  });
}

function findRoleUrl(pages: ParsedPage[], role: string): string | undefined {
  for (const page of pages) {
    if (classifyLink(page.snapshot.finalUrl) === role) return page.snapshot.finalUrl;
    for (const link of page.links) {
      if (classifyLink(link) === role) return link;
    }
  }
  return undefined;
}

export async function runDeterministicChecks(input: {
  origin: string;
  home: ParsedPage;
  pages: ParsedPage[];
  probes: Awaited<ReturnType<typeof probeStatus>>[];
  sensitiveProbes: Awaited<ReturnType<typeof probeStatus>>[];
}): Promise<{ findings: Finding[]; checked: string[]; couldNotVerify: string[] }> {
  const { origin, home, pages, probes, sensitiveProbes } = input;
  const findings: Finding[] = [];
  const checked: string[] = [];
  const couldNotVerify: string[] = [];
  const visibleText = pages.map((p) => `${p.snapshot.title} ${p.text} ${p.ctaTexts.join(" ")}`).join("\n");
  const allHtml = pages.map((p) => p.html).join("\n");

  checked.push("URL reachability and TLS redirect behavior");
  if (!home.snapshot.ok) {
    findings.push(
      finding({
        category: "core_functionality",
        title: "Homepage did not load",
        observed: `Request to ${home.snapshot.url} returned ${home.snapshot.status || "no HTTP status"}${home.snapshot.error ? ` (${home.snapshot.error})` : ""}.`,
        expected: "The public homepage should return a successful HTML response.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "critical",
        confidence: 0.95,
        url: home.snapshot.url,
        whyItMatters: "If the homepage cannot load, a customer never reaches signup, value, or payment.",
        recommendedPlug: "Fix DNS, hosting, or the application error on the root URL, then re-run the check.",
        evidence: [{ type: "http", label: "status", value: String(home.snapshot.status), url: home.snapshot.url }],
      }),
    );
  } else {
    findings.push(
      finding({
        category: "core_functionality",
        title: "Homepage loads",
        observed: `${home.snapshot.finalUrl} returned ${home.snapshot.status} in ${home.snapshot.elapsedMs}ms with title "${home.snapshot.title || "(none)"}".`,
        expected: "Public homepage should be reachable.",
        disposition: "PASS",
        severity: "info",
        confidence: 0.9,
        url: home.snapshot.finalUrl,
        whyItMatters: "A reachable homepage is the first customer encounter.",
        recommendedPlug: "No plug required for reachability.",
        evidence: [{ type: "http", label: "title", value: home.snapshot.title || "(none)" }],
      }),
    );
  }

  const usedHttps = origin.startsWith("https://") || home.snapshot.finalUrl.startsWith("https://");
  checked.push("HTTPS");
  if (!usedHttps) {
    findings.push(
      finding({
        category: "security",
        title: "Site is not served over HTTPS",
        observed: `The checked origin is ${origin}.`,
        expected: "A customer-facing app should use HTTPS.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.93,
        url: origin,
        whyItMatters: "Browsers and customers treat non-HTTPS apps as unsafe, especially around signup and payment.",
        recommendedPlug: "Terminate TLS on the domain and redirect HTTP to HTTPS.",
      }),
    );
  }

  checked.push("Document title and basic metadata");
  if (home.snapshot.ok && !home.snapshot.title) {
    findings.push(
      finding({
        category: "trust",
        title: "Homepage has no title",
        observed: "The homepage HTML has an empty or missing <title>.",
        expected: "The homepage should name the product.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "low",
        confidence: 0.8,
        url: home.snapshot.finalUrl,
        whyItMatters: "A missing title looks unfinished in search results and browser tabs, but it rarely blocks a motivated buyer by itself.",
        recommendedPlug: "Add a specific product title. Do not stall a launch only for this.",
      }),
    );
  }

  checked.push("Broken same-origin links (sampled)");
  const broken = probes.filter((p) => p.status >= 400 || (p.status === 0 && p.error));
  if (broken.length) {
    const sample = broken.slice(0, 6);
    findings.push(
      finding({
        category: "core_functionality",
        title: broken.length === 1 ? "A public link is broken" : `${broken.length} public links appear broken`,
        observed: sample
          .map((item) => `${item.url} -> ${item.status || item.error || "failed"}`)
          .join("; "),
        expected: "Navigable public links should not 404 or 500.",
        disposition: broken.some((item) => /signup|login|pricing|checkout|pay/i.test(item.url))
          ? "FIX_BEFORE_SELLING"
          : broken.length > 3
            ? "FIX_BEFORE_SELLING"
            : "NOT_BLOCKING_A_SALE",
        severity: broken.some((item) => /signup|login|pricing|checkout|pay/i.test(item.url)) ? "high" : "medium",
        confidence: 0.82,
        url: sample[0]?.url,
        whyItMatters: "Dead links on signup, pricing, or checkout can end the customer path. Cosmetic 404s usually should not delay selling.",
        recommendedPlug: "Fix or remove the dead URLs, starting with anything on the path to signup, use, or payment.",
        evidence: sample.map((item) => ({
          type: "link" as const,
          label: String(item.status || "error"),
          value: item.error || `HTTP ${item.status}`,
          url: item.url,
        })),
      }),
    );
  } else if (probes.length) {
    findings.push(
      finding({
        category: "navigation",
        title: "Sampled public links respond",
        observed: `Checked ${probes.length} same-origin URLs that appeared in page HTML. None returned 4xx/5xx in this sample.`,
        expected: "Public navigation should resolve.",
        disposition: "PASS",
        severity: "info",
        confidence: 0.75,
        whyItMatters: "Broken navigation is a common first-customer failure.",
        recommendedPlug: "No plug required for this sample.",
      }),
    );
  }

  checked.push("Placeholder and unfinished copy");
  const placeholder = home.text.match(PLACEHOLDER_RE) || visibleText.match(PLACEHOLDER_RE);
  if (placeholder) {
    findings.push(
      finding({
        category: "copy",
        title: "Placeholder copy is still visible",
        observed: `Found unfinished copy matching "${placeholder[0]}".`,
        expected: "Customer-facing pages should not show TODO, lorem ipsum, or dummy credentials.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.88,
        url: home.snapshot.finalUrl,
        whyItMatters: "Placeholder copy tells a customer the product is not finished.",
        recommendedPlug: "Replace placeholder strings with real product copy before any demo or checkout.",
      }),
    );
  }

  checked.push("Production hygiene (localhost/staging leaks)");
  const leak = allHtml.match(LOCAL_LEAK_RE) || visibleText.match(LOCAL_LEAK_RE);
  if (leak) {
    findings.push(
      finding({
        category: "production_hygiene",
        title: "Development or staging values appear in public HTML",
        observed: `Public pages include "${leak[0]}".`,
        expected: "Production pages should not point at localhost, staging hosts, or debug tools.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.9,
        whyItMatters: "Leaked staging URLs and localhost links break customer flows and look amateur.",
        recommendedPlug: "Strip debug/staging references from the production build.",
      }),
    );
  }

  checked.push("Client-visible secret patterns");
  const secret = allHtml.match(SECRET_RE);
  if (secret) {
    findings.push(
      finding({
        category: "security",
        title: "A client-visible secret pattern was found",
        observed: `Public HTML/JS contains a value matching a live key pattern (${secret[0].slice(0, 12)}…).`,
        expected: "Secret keys must not ship to the browser.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "critical",
        confidence: 0.92,
        whyItMatters: "Exposed keys can be copied by anyone who loads the page.",
        recommendedPlug: "Rotate the leaked credential immediately and move secrets to the server. This is not optional polish.",
        evidence: [{ type: "html", label: "pattern", value: secret[0].slice(0, 24) + "…" }],
      }),
    );
  }
  if (STRIPE_TEST_RE.test(allHtml)) {
    findings.push(
      finding({
        category: "production_hygiene",
        title: "Stripe test keys appear in the public app",
        observed: "Public HTML/JS includes Stripe test-mode publishable or secret key material.",
        expected: "A production purchase path should use live-mode keys, or the page should not present itself as production.",
        disposition: "TEST_BEFORE_BUILDING",
        severity: "medium",
        confidence: 0.7,
        whyItMatters: "Test Stripe config can mean customers cannot actually pay, or that production is still a sandbox.",
        recommendedPlug: "Confirm whether buyers are expected to pay yet. If yes, switch the public checkout to live keys. If not, do not treat more checkout UI as the next build task.",
      }),
    );
  }

  checked.push("Security headers (safe, non-intrusive)");
  if (home.snapshot.ok && home.snapshot.finalUrl.startsWith("https://") && !header(home, "strict-transport-security")) {
    findings.push(
      finding({
        category: "security",
        title: "HSTS header is missing",
        observed: "The homepage HTTPS response has no Strict-Transport-Security header.",
        expected: "Public HTTPS apps typically send HSTS.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "low",
        confidence: 0.7,
        url: home.snapshot.finalUrl,
        whyItMatters: "Missing HSTS is a real hardening gap. It is not, by itself, a reason to delay the first customer conversation.",
        recommendedPlug: "Add HSTS at the host/CDN. Do not postpone selling just for this header.",
      }),
    );
  }

  checked.push("Privacy policy");
  const privacyUrl = findRoleUrl(pages, "privacy") || pages.find((p) => /privacy/i.test(p.snapshot.finalUrl))?.snapshot.finalUrl;
  if (!privacyUrl) {
    findings.push(
      finding({
        category: "privacy",
        title: "No privacy policy link was found",
        observed: "Crawled public pages do not expose a reachable privacy policy URL.",
        expected: "If you collect emails or accounts, customers should find a privacy policy.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "medium",
        confidence: 0.7,
        whyItMatters: "Missing privacy language can create trust friction. It is not the same as a broken checkout.",
        recommendedPlug: "Publish a plain privacy page and link it in the footer. This is not legal advice.",
      }),
    );
  } else {
    findings.push(
      finding({
        category: "privacy",
        title: "Privacy policy is linked",
        observed: `Found ${privacyUrl}.`,
        expected: "A privacy link should exist and load.",
        disposition: "PASS",
        severity: "info",
        confidence: 0.72,
        url: privacyUrl,
        whyItMatters: "Customers look for this when asked for an email.",
        recommendedPlug: "No plug required for existence. Have a human confirm the policy matches actual data use.",
      }),
    );
  }

  checked.push("Terms");
  const termsUrl = findRoleUrl(pages, "terms");
  if (!termsUrl && hasRole(pages, "checkout")) {
    findings.push(
      finding({
        category: "terms",
        title: "Checkout path exists without visible terms",
        observed: "A purchase/upgrade CTA or checkout URL was found, but no terms page was discovered.",
        expected: "Paid products usually link terms near checkout.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "low",
        confidence: 0.6,
        whyItMatters: "This is a trust/legal hygiene issue, not proof that nobody will pay.",
        recommendedPlug: "Link terms near checkout. This is not legal certification.",
      }),
    );
  }

  checked.push("Support / contact path");
  const supportUrl = findRoleUrl(pages, "support");
  const hasEmail = /mailto:/i.test(home.html) || /@[a-z0-9.-]+\.[a-z]{2,}/i.test(home.text.slice(0, 4000));
  if (!supportUrl && !hasEmail) {
    findings.push(
      finding({
        category: "support",
        title: "No support or contact path was found",
        observed: "Crawled pages did not expose a help/contact URL or a visible email.",
        expected: "A customer who gets stuck should have a way out.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.74,
        url: home.snapshot.finalUrl,
        whyItMatters: "When something breaks, customers do not file elegant bug reports. They leave or charge back.",
        recommendedPlug: "Add a working contact/support link in the footer and on error states.",
      }),
    );
  }

  checked.push("Signup and login discovery");
  const signupUrl = findRoleUrl(pages, "signup");
  const loginUrl = findRoleUrl(pages, "login");
  if (!signupUrl && !loginUrl) {
    findings.push(
      finding({
        category: "signup_login",
        title: "No signup or login path was found",
        observed: "Public navigation and CTAs did not expose an obvious register or sign-in URL.",
        expected: "If the product needs an account, the path should be obvious. If it does not, this may be fine.",
        disposition: "TEST_BEFORE_BUILDING",
        severity: "medium",
        confidence: 0.55,
        whyItMatters: "Missing auth can mean the product is a brochure, or that the account moment is hidden. Both should be tested with a real buyer rather than assumed.",
        recommendedPlug: "If accounts are required to use the product, surface Sign up on the homepage. If not, do not build a full auth stack just because other SaaS apps have one.",
      }),
    );
  }

  checked.push("Purchase moment");
  const pricingUrl = findRoleUrl(pages, "pricing");
  const checkoutUrl = findRoleUrl(pages, "checkout");
  const paidLanguage = /\b(buy|subscribe|upgrade|pricing|pro plan|start trial|checkout)\b/i.test(home.text);
  if (!pricingUrl && !checkoutUrl && !paidLanguage) {
    findings.push(
      finding({
        category: "purchase_moment",
        title: "No clear paid action exists",
        observed: "The public pages we crawled do not present pricing, checkout, upgrade, or a trial CTA.",
        expected: "If you intend to charge, a customer should encounter a buying decision.",
        disposition: "TEST_BEFORE_BUILDING",
        severity: "medium",
        confidence: 0.7,
        url: home.snapshot.finalUrl,
        whyItMatters: '"Nobody paid" and "nobody ever had to decide whether to pay" are different problems. Building more features will not create a purchase moment.',
        recommendedPlug: "Before adding features, put one honest paid action in front of users (price, trial, or waitlist with a charge later). Then talk to buyers.",
      }),
    );
  } else {
    findings.push(
      finding({
        category: "purchase_moment",
        title: "A public purchase or upgrade path is visible",
        observed: `Signals: pricing=${pricingUrl || "none"}, checkout=${checkoutUrl || "none"}, paid language=${paidLanguage ? "yes" : "no"}.`,
        expected: "Customers can tell that paying is possible.",
        disposition: "PASS",
        severity: "info",
        confidence: 0.68,
        url: checkoutUrl || pricingUrl || home.snapshot.finalUrl,
        whyItMatters: "A visible buying decision is required before you can blame conversion on product quality.",
        recommendedPlug: "Keep pricing copy consistent across landing, pricing, and checkout. Do not invent extra plan tiers yet.",
      }),
    );
  }

  checked.push("Pricing consistency (public copy)");
  const prices = new Set<string>();
  const priceRe = /\$\s?\d+(?:[.,]\d{2})?/g;
  for (const page of pages) {
    const hits = page.text.match(priceRe) || [];
    hits.forEach((hit) => prices.add(hit.replace(/\s/g, "")));
  }
  if (prices.size > 4) {
    findings.push(
      finding({
        category: "pricing",
        title: "Public pages show many different dollar amounts",
        observed: `Found amounts: ${[...prices].slice(0, 8).join(", ")}.`,
        expected: "Landing, pricing, and checkout should not contradict each other.",
        disposition: "TEST_BEFORE_BUILDING",
        severity: "medium",
        confidence: 0.5,
        whyItMatters: "Contradictory prices create distrust. Confirm the intended price with a buyer before rebuilding the billing UI.",
        recommendedPlug: "Pick one public price per plan and make landing/pricing/checkout match. Then verify with a real checkout in test mode.",
      }),
    );
  }

  checked.push("Mobile viewport meta");
  const viewport = home.$('meta[name="viewport"]').attr("content") || "";
  if (home.snapshot.ok && !/width\s*=\s*device-width/i.test(viewport)) {
    findings.push(
      finding({
        category: "mobile",
        title: "No mobile viewport meta tag",
        observed: viewport ? `viewport content="${viewport}"` : "Homepage has no viewport meta tag.",
        expected: "Mobile browsers need width=device-width to avoid a tiny desktop layout.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.86,
        url: home.snapshot.finalUrl,
        viewport: "device",
        whyItMatters: "A large share of first visits happen on a phone. An unusable mobile layout can end the encounter immediately.",
        recommendedPlug: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"> and check the homepage at 390px.",
      }),
    );
  }

  checked.push("Basic accessibility signals");
  if (home.imageCount >= 3 && home.imagesMissingAlt / home.imageCount >= 0.6) {
    findings.push(
      finding({
        category: "accessibility",
        title: "Most images have no alt text",
        observed: `${home.imagesMissingAlt} of ${home.imageCount} homepage images are missing alt.`,
        expected: "Meaningful images should have alt text.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "low",
        confidence: 0.7,
        url: home.snapshot.finalUrl,
        whyItMatters: "This is a real accessibility gap. It is not evidence that a buyer will refuse to pay.",
        recommendedPlug: "Add alt text on content images. Do not delay customer conversations only for this.",
      }),
    );
  }
  const unlabeled = home.forms.reduce((sum, form) => sum + form.unlabeled, 0);
  if (unlabeled > 0) {
    findings.push(
      finding({
        category: "accessibility",
        title: "Form fields are missing labels",
        observed: `Homepage forms have ${unlabeled} input(s) without a label or aria-label.`,
        expected: "Every visible field should have an accessible name.",
        disposition: unlabeled > 2 ? "FIX_BEFORE_SELLING" : "NOT_BLOCKING_A_SALE",
        severity: unlabeled > 2 ? "medium" : "low",
        confidence: 0.7,
        url: home.snapshot.finalUrl,
        whyItMatters: "Unlabeled fields break screen readers and often mean a confusing signup form for everyone else.",
        recommendedPlug: "Associate a label with each input. Retest keyboard and screen-reader flow on signup.",
      }),
    );
  }

  checked.push("Obvious admin/debug routes (safe GET only)");
  const debugPaths = ["/admin", "/debug", "/.env", "/server-status", "/phpinfo.php"];
  for (const probe of sensitiveProbes) {
    const pathOnly = new URL(probe.url).pathname;
    if (debugPaths.includes(pathOnly) && probe.ok && probe.status === 200) {
      findings.push(
        finding({
          category: "security",
          title: "A sensitive public route responded",
          observed: `${probe.url} returned HTTP ${probe.status} without authentication in this GET probe.`,
          expected: "Admin/debug endpoints should not be public.",
          disposition: "FIX_BEFORE_SELLING",
          severity: "critical",
          confidence: 0.8,
          url: probe.url,
          whyItMatters: "An open admin or debug page is a trust and safety failure for any customer.",
          recommendedPlug: "Require auth or remove the route from production. AppHole did not attempt to exploit it.",
        }),
      );
    }
  }

  checked.push("Company identity");
  const identity =
    /\b(inc\.|llc|ltd|gmbh|privacy@|hello@|support@|copyright|©)\b/i.test(home.text) ||
    Boolean(home.snapshot.title);
  if (home.snapshot.ok && !/\b(inc\.|llc|ltd|privacy@|hello@|support@|©)\b/i.test(home.text)) {
    findings.push(
      finding({
        category: "trust",
        title: "Company identity is thin on the homepage",
        observed: "No obvious legal name, copyright, or support email was found in homepage text.",
        expected: "Customers should be able to tell who they are about to pay.",
        disposition: "NOT_BLOCKING_A_SALE",
        severity: "low",
        confidence: 0.55,
        url: home.snapshot.finalUrl,
        whyItMatters: "Thin identity can feel like a throwaway site. It rarely beats a broken core workflow as a blocker.",
        recommendedPlug: "Add who you are and a contact method in the footer.",
      }),
    );
  }

  checked.push("First-run emptiness signals");
  if (/\b(no (data|projects|items) yet|nothing here|get started by|your dashboard is empty)\b/i.test(visibleText)) {
    findings.push(
      finding({
        category: "first_run",
        title: "Empty-state language appears on public pages",
        observed: "Copy suggests a blank dashboard or empty first-run state is visible.",
        expected: "A new user should know the next action immediately.",
        disposition: "FIX_BEFORE_SELLING",
        severity: "high",
        confidence: 0.6,
        whyItMatters: "A new account that lands on nothing often never reaches value.",
        recommendedPlug: "Give empty accounts one obvious next action, not a blank table.",
      }),
    );
  }

  couldNotVerify.push("Authenticated first-run / empty dashboard after actual signup");
  couldNotVerify.push("Password reset email delivery");
  couldNotVerify.push("Checkout with a real or test card charge");
  couldNotVerify.push("Paid entitlement unlocking after purchase");
  couldNotVerify.push("Cancellation and billing portal behavior");
  couldNotVerify.push("Runtime JavaScript console errors (needs Playwright)");
  couldNotVerify.push("Safari/WebKit and Firefox rendering");
  couldNotVerify.push("Cross-user data access");
  couldNotVerify.push("Email verification flow");

  findings.push(
    finding({
      category: "browser",
      title: "Runtime browsers beyond this HTTP check were not launched",
      observed: "This scan fetched public HTML over HTTP(S). It did not drive Chromium, WebKit, or Firefox unless Playwright was enabled separately.",
      expected: "Console errors, screenshots, and tap-target failures need a real browser.",
      disposition: "COULDNT_VERIFY",
      severity: "info",
      confidence: 1,
      whyItMatters: "Inventing console errors would be dishonest. AppHole prefers couldn't verify over theater.",
      recommendedPlug: "Run a local or Pro Playwright pass to capture console, network failures, and mobile screenshots.",
    }),
  );

  void identity;
  return { findings, checked, couldNotVerify };
}

export function sensitivePaths(origin: string): string[] {
  const extras = ["/admin", "/debug", "/.env", "/server-status", "/phpinfo.php"];
  const urls: string[] = [];
  for (const extra of extras) {
    try {
      urls.push(new URL(extra, origin).toString());
    } catch {
      // ignore
    }
  }
  return urls;
}

export function summarizePages(pages: PageSnapshot[]) {
  return pages.map((p) => `${p.status} ${p.finalUrl}`).join("\n");
}
