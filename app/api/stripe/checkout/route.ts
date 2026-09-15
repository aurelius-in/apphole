import { NextResponse } from "next/server";
import { getSessionUserId, siteUrl } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/store";
import { checkoutUrls, getStripe, stripeConfigured } from "@/lib/stripe";

export async function GET() {
  if (!stripeConfigured()) {
    return NextResponse.redirect(new URL("/pricing", siteUrl()));
  }
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.redirect(new URL("/signup?next=/dashboard/billing", siteUrl()));
  }
  const user = await getUserById(userId);
  if (!user) return NextResponse.redirect(new URL("/signup?next=/dashboard/billing", siteUrl()));

  const stripe = getStripe();
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { appholeUserId: user.id },
    });
    customerId = customer.id;
    await updateUser(user.id, { stripeCustomerId: customerId });
  }
  const urls = checkoutUrls();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID, quantity: 1 }],
    success_url: urls.success,
    cancel_url: urls.cancel,
    allow_promotion_codes: true,
    metadata: { appholeUserId: user.id },
  });
  if (!session.url) {
    return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
  }
  return NextResponse.redirect(session.url, { headers: { "Cache-Control": "no-store" } });
}

export { GET as POST };
