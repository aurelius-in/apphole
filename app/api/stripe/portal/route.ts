import { NextResponse } from "next/server";
import { getSessionUserId, siteUrl } from "@/lib/auth";
import { getUserById } from "@/lib/store";
import { getStripe, stripeConfigured } from "@/lib/stripe";

export async function POST() {
  if (!stripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
  }
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.redirect(new URL("/login?next=/dashboard/billing", siteUrl()));
  const user = await getUserById(userId);
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "No Stripe customer on this account yet." }, { status: 400 });
  }
  const session = await getStripe().billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${siteUrl()}/dashboard/billing`,
  });
  return NextResponse.redirect(session.url);
}
