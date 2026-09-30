export const metadata = { title: "Privacy | AppHole" };

export default function PrivacyPage() {
  return (
    <article className="prose-ah mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold">Privacy</h1>
      <p className="mt-4 text-sm text-ah-muted">Last updated 28 September 2026. This is a product disclosure, not legal advice.</p>
      <div className="mt-8 space-y-4 text-sm leading-7 text-ah-muted">
        <p>
          AppHole inspects public pages of apps you submit, and public GitHub repositories when that is the link you paste. We store every URL entered, with the time and whether it looked like a product, a GitHub repo, or an unrelated site such as a search engine. We also store timestamps, HTTP metadata, extracted text needed for findings, and the resulting report. We do not ask for passwords in the Free check. We use that URL list to follow up on real checks and to separate them from casual tests.
        </p>
        <p>
          Do not submit an app you are not authorized to test. Do not paste secrets into the URL field.
        </p>
        <p>
          If you create an account, we store your email and a password hash. If you upgrade, Stripe stores payment details. AppHole stores Stripe customer and subscription ids so Pro entitlements can sync.
        </p>
        <p>
          If you request a plug quote, we store the email and hole description you submit, plus optional report context (scan id, app URL, and the finding you picked) so we can reply with a price. We use that only to quote and follow up on the job, not as a marketing list.
        </p>
        <p>
          Optional AI plug wording: if an operator enables an LLM key, finding titles and evidence may be sent to that provider to rewrite recommended plugs. The model is not allowed to invent extra failures. You can run AppHole without that key.
        </p>
        <p>
          Scan data is kept so you can reopen a report and, on Pro, retest. You can email hello@apphole.pro to request deletion of stored scans, plug-quote leads, and account data.
        </p>
        <p>
          We keep first-party usage events (pages viewed, checks started, signup and checkout steps) so we can see where the product is confusing. We also run a Meta Pixel (Facebook) that records page views and those same conversion steps. Meta may set cookies and receive a hashed view of the visit so ads can be measured. We do not send your scan targets, emails, or passwords to Meta.
        </p>
        <p>We do not sell your scan targets as a marketing list.</p>
      </div>
    </article>
  );
}
