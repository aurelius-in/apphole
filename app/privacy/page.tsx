export const metadata = { title: "Privacy | AppHole" };

export default function PrivacyPage() {
  return (
    <article className="prose-ah mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-4xl font-bold">Privacy</h1>
      <p className="mt-4 text-sm text-ah-muted">Last updated 15 September 2026. This is a product disclosure, not legal advice.</p>
      <div className="mt-8 space-y-4 text-sm leading-7 text-ah-muted">
        <p>
          AppHole inspects public pages of apps you submit. We store the URL, timestamps, HTTP metadata, extracted text needed for findings, and the resulting report. We do not ask for passwords in the Free check.
        </p>
        <p>
          Do not submit an app you are not authorized to test. Do not paste secrets into the URL field.
        </p>
        <p>
          If you create an account, we store your email and a password hash. If you upgrade, Stripe stores payment details. AppHole stores Stripe customer and subscription ids so Pro entitlements can sync.
        </p>
        <p>
          Optional AI plug wording: if an operator enables an LLM key, finding titles and evidence may be sent to that provider to rewrite recommended plugs. The model is not allowed to invent extra failures. You can run AppHole without that key.
        </p>
        <p>
          Scan data is kept so you can reopen a report and, on Pro, retest. You can email hello@apphole.pro to request deletion of stored scans and account data.
        </p>
        <p>We do not sell your scan targets as a marketing list.</p>
      </div>
    </article>
  );
}
