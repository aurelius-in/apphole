import { PricingSplit } from "@/components/PricingSplit";
import { stripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Free vs Pro | AppHole" };

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-14">
      <h1 className="text-4xl font-bold">Free vs Pro</h1>
      <p className="mt-3 max-w-2xl text-ah-muted">
        Two plans. AppHole Pro is $29/month. Checkout is handled by Stripe.
      </p>
      <div className="mt-10">
        <PricingSplit stripeReady={stripeConfigured()} />
      </div>
    </div>
  );
}
