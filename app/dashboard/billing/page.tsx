import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import { GoProLink } from "@/components/GoProLink";
import { ProPayCta } from "@/components/ProPayCta";
import { getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { getUserById } from "@/lib/store";
import { stripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Billing | AppHole" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const userId = await getSessionUserId();
  const plan = await planForUser(userId);
  const user = userId ? await getUserById(userId) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <DashboardNav />
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Billing</h1>
        {checkout === "success" && (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm">You&apos;re in. Payment finished. Entitlements update when Stripe confirms.</p>
        )}
        <p className="text-sm text-ah-muted">
          Current plan: {plan === "pro" ? "AppHole Pro" : "AppHole Free"}
          {user?.planStatus ? ` (${user.planStatus})` : ""}.
        </p>
        {!userId && (
          <p className="text-sm">
            <Link href="/signup?next=/go-pro" className="font-semibold text-ah-blue">
              Create an account
            </Link>{" "}
            to subscribe, or{" "}
            <GoProLink className="font-semibold text-ah-green-dark">Go Pro</GoProLink>.
          </p>
        )}
        {userId && plan !== "pro" && <ProPayCta />}
        {userId && stripeConfigured() && user?.stripeCustomerId && (
          <form action="/api/stripe/portal" method="post">
            <button className="rounded-full border border-ah-line px-4 py-2 text-sm font-semibold" type="submit">
              Open billing portal
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
