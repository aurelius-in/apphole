const categories = [
  ["Core functionality", "Broken links, dead buttons, 404s, failed requests, crashes."],
  ["Signup and login", "Register, verify, login loops, reset, session loss."],
  ["First-run", "Blank dashboards, missing next action, onboarding dead ends."],
  ["Activation", "Can a new user actually reach the core value?"],
  ["Mobile", "Viewport, clipped content, tiny tap targets, mobile checkout."],
  ["Payment and checkout", "Path exists, prices match, entitlement after pay."],
  ["Purchase moment", "Did anyone ever have to decide whether to pay?"],
  ["Pricing consistency", "Landing, pricing, checkout, and billing agree."],
  ["Trust", "Identity, unfinished pages, fake placeholders, broken claims."],
  ["Support", "A way out after failure. Contact that works."],
  ["Privacy and terms", "Pages exist and do not obviously contradict the product."],
  ["Security and permissions", "Obvious public secrets, open admin, missing headers. Not a pentest."],
  ["Copy", "Lorem ipsum, TODO, old product names, misleading buttons."],
  ["Production hygiene", "Localhost, staging, test Stripe, debug panels."],
  ["Accessibility", "Labels, alt text, keyboard basics. No WCAG certificate."],
  ["Performance", "Painfully slow first load and endless spinners, not Lighthouse theater."],
];

export function CategoryGrid() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map(([title, body]) => (
        <article key={title} className="rounded-2xl border border-ah-line bg-white p-4 shadow-sm">
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-2 text-sm text-ah-muted">{body}</p>
        </article>
      ))}
    </div>
  );
}
