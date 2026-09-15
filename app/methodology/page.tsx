export const metadata = { title: "Methodology | AppHole" };

export default function MethodologyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 text-sm leading-7 text-ah-muted">
      <h1 className="text-4xl font-bold text-ah-ink">Methodology</h1>
      <p className="mt-4">
        AppHole Free starts with a public HTTP crawl. It fetches the homepage, follows a limited set of same-origin links (signup, login, pricing, checkout, privacy, terms, support), and probes a few obvious paths. It does not log in unless a future Pro authenticated mode is explicitly enabled with a test account you provide.
      </p>
      <p className="mt-4">
        Findings are generated from observations: HTTP status, HTML, headers, link targets, copy patterns, viewport meta, form labels, and similar signals. An LLM, if configured, may rewrite plug language. It may not add holes that were not observed.
      </p>
      <p className="mt-4">
        Runtime console errors, screenshots, Safari, and paid checkout require a browser worker. Until Playwright is enabled for a scan, those items are marked couldn&apos;t verify.
      </p>
      <p className="mt-4">
        Dispositions exist so builders do not treat every imperfection as a launch blocker. Missing dark mode is usually not blocking a sale. Broken checkout is.
      </p>
    </article>
  );
}
