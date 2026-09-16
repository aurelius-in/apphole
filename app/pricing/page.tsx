import { PlugQuoteForm } from "@/components/PlugQuoteForm";
import { PricingSplit } from "@/components/PricingSplit";

export const metadata = { title: "Free vs Pro | AppHole" };

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold">Free vs Pro</h1>
      <p className="mt-3 max-w-2xl text-ah-muted">
        Two plans. AppHole Pro is $29/month. Probe deeper with Pro, then subscribe. Plug quotes are a separate human job, not this subscription.
      </p>
      {checkout === "cancel" && (
        <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm">
          Checkout was canceled. Your account is still here. Subscribe when you are ready.
        </p>
      )}
      <div className="mt-10">
        <PricingSplit />
      </div>
      <div className="mt-10">
        <PlugQuoteForm source="pricing" compact />
      </div>
    </div>
  );
}
