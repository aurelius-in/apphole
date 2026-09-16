import Link from "next/link";
import { GoProLink } from "@/components/GoProLink";
import { PRO_PRICE_LABEL } from "@/lib/pricing";

export function PricingSplit() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <article className="rounded-3xl border border-ah-line bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-ah-blue">AppHole Free</p>
        <h3 className="mt-2 text-2xl font-bold">Find the obvious holes.</h3>
        <ul className="mt-4 space-y-2 text-sm text-ah-muted">
          <li>Public URL scan</li>
          <li>Major flow checks</li>
          <li>Basic mobile viewport signal</li>
          <li>Top findings with dispositions</li>
          <li>Readiness verdict</li>
          <li>A few scans per month</li>
        </ul>
        <Link href="/check" className="mt-6 inline-flex rounded-full bg-ah-blue px-5 py-3 text-sm font-semibold text-white hover:bg-ah-blue-dark">
          Check my AppHole
        </Link>
      </article>
      <article className="rounded-3xl border-2 border-ah-green bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-ah-green-dark">AppHole Pro</p>
        <h3 className="mt-2 text-2xl font-bold">Probe deeper with Pro.</h3>
        <p className="mt-2 text-sm text-ah-ink">Go deeper. Retest. Plug more holes.</p>
        <p className="mt-1 text-lg font-semibold text-ah-ink">{PRO_PRICE_LABEL}</p>
        <ul className="mt-4 space-y-2 text-sm text-ah-muted">
          <li>Deeper public crawl</li>
          <li>Saved scan history</li>
          <li>Retests after you plug a hole</li>
          <li>Full finding evidence on every item</li>
          <li>Higher monthly scan quota</li>
          <li>Authenticated workflows later, when you add a test login</li>
        </ul>
        <GoProLink className="mt-6 inline-flex rounded-full bg-ah-green px-5 py-3 text-sm font-semibold text-ah-ink hover:bg-ah-green-dark hover:text-white">
          Go Pro
        </GoProLink>
        <p className="mt-3 text-sm text-ah-muted">
          Tap Go Pro to create an account and pay {PRO_PRICE_LABEL}. You get a login when you subscribe.
        </p>
      </article>
    </div>
  );
}
