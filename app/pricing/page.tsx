import { PricingSplit } from "@/components/PricingSplit";
import { stripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Free vs Pro | AppHole" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold">Free vs Pro</h1>
      <p className="mt-3 max-w-2xl text-ah-muted">
        Two plans. The dollar amount lives in Stripe when you are ready to charge. Until a price id is configured, Free checks still run.
      </p>
      <div className="mt-10">
        <PricingSplit stripeReady={stripeConfigured()} />
      </div>
    </div>
  );
}
