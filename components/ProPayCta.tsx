import { PayProButton } from "@/components/PayProButton";
import { PRO_PRICE_LABEL } from "@/lib/pricing";

export function ProPayCta({
  size = "banner",
  initialError,
}: {
  size?: "hero" | "banner";
  initialError?: string;
}) {
  const titleClass =
    size === "hero" ? "text-4xl font-extrabold tracking-tight sm:text-5xl" : "text-3xl font-extrabold tracking-tight sm:text-4xl";

  return (
    <section className="rounded-3xl border-2 border-ah-green bg-ah-green/10 p-6 shadow-card sm:p-8">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-ah-green-dark">AppHole Pro</p>
      <h2 className={`mt-2 ${titleClass}`}>Probe deeper with Pro</h2>
      <p className="mt-3 text-xl font-bold text-ah-ink">{PRO_PRICE_LABEL}</p>
      <p className="mt-2 max-w-xl text-base text-ah-ink">Deeper crawls, saved history, and retests after you plug a hole.</p>
      <div className="mt-6 max-w-md">
        <PayProButton initialError={initialError} />
      </div>
    </section>
  );
}
