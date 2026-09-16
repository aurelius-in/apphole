import { redirect } from "next/navigation";
import { ProPayCta } from "@/components/ProPayCta";
import { getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { STRIPE_CHECKOUT_FAILED_MESSAGE, STRIPE_NOT_CONFIGURED_MESSAGE } from "@/lib/stripe";

export const metadata = { title: "Go Pro | AppHole" };

export default async function GoProPage({
  searchParams,
}: {
  searchParams: Promise<{ pay?: string }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/signup?next=/go-pro");
  }
  const plan = await planForUser(userId);
  if (plan === "pro") {
    redirect("/dashboard?checkout=already");
  }
  const { pay } = await searchParams;
  const initialError =
    pay === "unavailable" ? STRIPE_NOT_CONFIGURED_MESSAGE : pay === "error" ? STRIPE_CHECKOUT_FAILED_MESSAGE : undefined;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <p className="mb-6 text-sm text-ah-muted">Your AppHole account is ready. Subscribe to start Pro.</p>
      {pay === "canceled" && (
        <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm">Checkout was canceled. Subscribe below when you are ready.</p>
      )}
      <ProPayCta size="hero" initialError={initialError} />
    </div>
  );
}
