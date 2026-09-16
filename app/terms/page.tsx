export const metadata = { title: "Terms | AppHole" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 text-sm leading-7 text-ah-muted">
      <h1 className="text-4xl font-bold text-ah-ink">Terms</h1>
      <p className="mt-4">Last updated 15 September 2026. Not legal advice.</p>
      <p className="mt-6">
        AppHole is a pre-customer readiness checker. It is not a penetration test, security certification, accessibility certification, legal review, or demand forecast.
      </p>
      <p className="mt-4">
        You may only submit URLs for apps you own or are authorized to test. You agree AppHole may fetch public pages, follow public same-origin links, and record evidence needed to explain findings.
      </p>
      <p className="mt-4">
        AppHole will not attempt exploits, brute force, denial of service, real card charges, or production data changes. Safe GET probes of obvious public paths (for example /privacy or /admin) may occur.
      </p>
      <p className="mt-4">
        Reports can be incomplete. A pass means this check did not observe a blocker, not that customers will buy or that no holes exist.
      </p>
      <p className="mt-4">
        Free and Pro quotas may change. Pro billing is handled by Stripe when configured. You can cancel through the Stripe billing portal. A plug-quote request asks a human to examine a described hole and price the fix. It is not a Stripe charge and not a promise that the hole is already plugged.
      </p>
    </article>
  );
}
