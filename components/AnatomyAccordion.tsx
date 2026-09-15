"use client";

import { track } from "@/lib/analytics";

const items = [
  {
    title: "Everybody has an AppHole. Smart builders check theirs before launch.",
    body: "Every shipped app has imperfections. The relevant question is whether those imperfections can stop signup, understanding, trust, usage, payment, or recovery.",
  },
  {
    title: "Your AppHole may be bigger than you think.",
    body: "Not all holes are software bugs. A technically functioning product can still have no purchase moment, contradictory pricing, unclear onboarding, no support path, no clear first action, or promises the product does not deliver.",
  },
  {
    title: "One bad AppHole can ruin the whole experience.",
    body: "Customers move Homepage to Signup to Verification to First Use to Value to Payment to Support. One critical failure can make the whole product feel broken.",
  },
  {
    title: "We inspect AppHoles so your customers don't have to.",
    body: "Customers generally do not file useful bug reports. They leave.",
  },
  {
    title: "Don't ship with your AppHole wide open.",
    body: "Production hygiene and obvious security or permissions problems are in scope. AppHole is not a penetration test. It looks for the embarrassing public stuff that should never reach a buyer.",
  },
  {
    title: "Fix your AppHole before somebody complains about it.",
    body: "Every finding gets a disposition: fix before selling, test before building, not blocking a sale, or couldn't verify. Volume is not the point.",
  },
  {
    title: "A neglected AppHole eventually becomes a customer problem.",
    body: "Small UX and production mistakes become support, refund, and churn problems once a stranger is on the other side of the screen.",
  },
  {
    title: "Before customers touch it, check your AppHole.",
    body: "Submit a public URL, confirm you are authorized, and get a real crawl of the pages customers actually hit.",
  },
  {
    title: "We've seen worse AppHoles. Probably.",
    body: "AppHole is not looking for perfection. The goal is READY TO FACE CUSTOMERS.",
  },
];

export function AnatomyAccordion() {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <details
          key={item.title}
          className="rounded-2xl border border-ah-line bg-white p-4"
          onToggle={(event) => {
            if ((event.target as HTMLDetailsElement).open) track("ah_faq_expand", { section: "anatomy", item: item.title });
          }}
        >
          <summary className="cursor-pointer text-base font-semibold">{item.title}</summary>
          <p className="mt-3 text-sm leading-6 text-ah-muted">{item.body}</p>
        </details>
      ))}
    </div>
  );
}
