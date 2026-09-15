"use client";

import { track } from "@/lib/analytics";

const faqs = [
  {
    q: "What is an AppHole?",
    a: "Something in a shipped or nearly shipped app that can break the customer experience, undermine trust, block payment, or create a problem worth fixing before selling.",
  },
  {
    q: "Is this just another bug scanner?",
    a: "No. Bugs are one class of AppHole. AppHole also looks at onboarding, payment, trust, support, mobile behavior, purchase paths, permissions, production hygiene, and other things customers actually encounter.",
  },
  {
    q: "Will it find every problem?",
    a: "No. AppHole tells you what it checked, what it observed, and what it could not verify. Couldn't verify is always preferred over pretending.",
  },
  {
    q: "Does passing mean customers will buy?",
    a: "No. AppHole tests readiness, not demand.",
  },
  {
    q: "Will AppHole automatically change my code?",
    a: "No. It shows evidence and recommends the plug. You decide what gets changed.",
  },
  {
    q: "Do I have to fix everything?",
    a: "No. That is one of the reasons AppHole exists. Fix before selling, test before building, not blocking a sale, or couldn't verify.",
  },
  {
    q: "Is this a security audit?",
    a: "No. AppHole can catch obvious security and permission problems. It is not a penetration test, compliance audit, or certification.",
  },
];

export function FaqList() {
  return (
    <div className="space-y-2">
      {faqs.map((item) => (
        <details
          key={item.q}
          className="rounded-2xl border border-ah-line bg-white p-4"
          onToggle={(event) => {
            if ((event.target as HTMLDetailsElement).open) track("ah_faq_expand", { q: item.q });
          }}
        >
          <summary className="cursor-pointer font-semibold">{item.q}</summary>
          <p className="mt-3 text-sm leading-6 text-ah-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
