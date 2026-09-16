import Image from "next/image";
import Link from "next/link";
import { AnatomyAccordion } from "@/components/AnatomyAccordion";
import { CategoryGrid } from "@/components/CategoryGrid";
import { CheckForm } from "@/components/CheckForm";
import { FaqList } from "@/components/FaqList";
import { HeroLogo } from "@/components/HeroLogo";
import { LandingTracker } from "@/components/LandingTracker";
import { PlugQuoteForm } from "@/components/PlugQuoteForm";
import { PricingSplit } from "@/components/PricingSplit";
import { ReportView } from "@/components/ReportView";
import { brand } from "@/lib/brand";
import { exampleReport } from "@/lib/scans/example";

export default function HomePage() {
  return (
    <div>
      <LandingTracker />
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-ah-blue/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-ah-green/10 blur-3xl" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ah-blue">{brand.heroEyebrow}</p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">{brand.heroHeadline}</h1>
            <p className="mt-4 text-xl font-semibold text-ah-ink">{brand.heroSubhead}</p>
            <p className="mt-4 max-w-xl text-ah-muted">{brand.heroBody}</p>
            <p className="mt-3 max-w-xl text-sm text-ah-muted">
              We look for the things that can break, confuse, embarrass, or stop a customer from buying, then tell you which holes to fix before you sell and which can wait.
            </p>
            <div className="mt-8 max-w-lg">
              <CheckForm />
            </div>
            <p className="mt-4">
              <Link href="/example" className="text-sm font-semibold text-ah-blue hover:underline">
                {brand.secondaryCta}
              </Link>
            </p>
          </div>
          <div className="flex flex-col items-center">
            <HeroLogo />
          </div>
        </div>
      </section>

      <section id="product" className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ah-red">Example AppHole Report</p>
        <h2 className="mt-3 text-3xl font-bold">This is what the judgment looks like.</h2>
        <p className="mt-2 max-w-2xl text-ah-muted">Not a score out of 100. A short list of holes, each with a disposition so you stop hiding in the backlog.</p>
        <div className="mt-8">
          <ReportView report={exampleReport} example showPlugQuote={false} />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Four dispositions. That is the product.</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["FIX BEFORE SELLING", "A problem that can stop a reasonable customer from using, trusting, or paying."],
              ["TEST BEFORE BUILDING", "It might matter. There is not enough evidence to justify more development before talking to buyers."],
              ["NOT BLOCKING A SALE", "A real imperfection that should not postpone customer conversations. Missing dark mode lives here."],
              ["COULDN'T VERIFY", "AppHole did not have the access or conditions to honestly test it. We will not fake the check."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-ah-line p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm text-ah-muted">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="anatomy" className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ah-green-dark">AppHole Anatomy</p>
        <h2 className="mt-3 text-3xl font-bold">Everybody has an AppHole.</h2>
        <p className="mt-2 max-w-2xl text-ah-muted">The trick is knowing which ones matter before a customer finds them for you.</p>
        <div className="mt-8">
          <AnatomyAccordion />
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Bobbing for AppHoles.</h2>
          <p className="mt-2 max-w-2xl text-ah-muted">We look in the places customers are most likely to fall into one.</p>
          <div className="mt-8">
            <CategoryGrid />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">A finding should be reproducible.</h2>
        <article className="mt-8 rounded-3xl border border-ah-line bg-white p-6 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-ah-muted">AppHole #03</p>
          <h3 className="mt-1 text-2xl font-bold">New users land on a blank dashboard</h3>
          <p className="mt-3 text-sm font-semibold text-ah-red">FIX BEFORE SELLING</p>
          <p className="mt-4 text-sm leading-6 text-ah-muted">
            <span className="font-semibold text-ah-ink">Observed. </span>
            A new account reaches /dashboard after verification with no projects, no instruction, and no obvious next action.
          </p>
          <p className="mt-3 text-sm leading-6 text-ah-muted">
            <span className="font-semibold text-ah-ink">Why it matters. </span>
            A first-time user can successfully register and still fail to experience the product&apos;s value.
          </p>
          <p className="mt-3 text-sm leading-6 text-ah-muted">
            <span className="font-semibold text-ah-ink">Plug. </span>
            Route empty accounts to the first useful action or provide a strong empty-state CTA.
          </p>
        </article>
      </section>

      <section id="how-it-works" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">How an AppHole Check works</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["1. Authorize", "Paste a public URL and confirm you own it or may test it."],
              ["2. Preflight", "Reachability, HTTPS, title, and obvious public errors."],
              ["3. Public crawl", "Homepage, nav, signup, pricing, support, privacy, mobile viewport signals."],
              ["4. Judgment", "Evidence-backed findings with dispositions. No invented bugs."],
            ].map(([title, body]) => (
              <li key={title} className="rounded-2xl border border-ah-line p-5">
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm text-ah-muted">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">Make your app AppHole-proof.</h2>
        <p className="mt-3 max-w-2xl text-ah-muted">
          AppHole-proof does not mean perfect. It means you are not about to put a stranger in front of a broken signup, a blank dashboard, or a checkout that only works on your laptop.
        </p>
      </section>

      <section id="pricing" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-3xl font-bold">Free vs Pro</h2>
          <p className="mt-2 text-ah-muted">Two plans. Free has to be useful. Pro is $29/month. Probe deeper with Pro, then tap Pay.</p>
          <div className="mt-8">
            <PricingSplit />
          </div>
          <div className="mt-10">
            <PlugQuoteForm source="pricing" compact />
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-3xl font-bold">FAQ</h2>
        <div className="mt-8">
          <FaqList />
        </div>
      </section>

      <section className="bg-ah-ink py-16 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <Image src="/ah-logo-on-black.png" alt="" className="mx-auto h-20 w-20 object-contain" width={80} height={80} />
          <h2 className="mt-6 text-3xl font-bold">{brand.heroHeadline}</h2>
          <p className="mt-3 text-white/70">{brand.tagline}</p>
          <Link href="/check" className="mt-8 inline-flex rounded-full bg-ah-blue px-6 py-3 font-semibold text-white hover:bg-ah-blue-dark">
            Check my AppHole
          </Link>
        </div>
      </section>
    </div>
  );
}
