import { NextResponse } from "next/server";
import { getSessionUserId, siteUrl } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { getUserById, updateUser } from "@/lib/store";
import {
  STRIPE_CHECKOUT_FAILED_MESSAGE,
  STRIPE_NOT_CONFIGURED_MESSAGE,
  checkoutUrls,
  getStripe,
  stripeConfigured,
  wantsJsonCheckout,
} from "@/lib/stripe";

async function startCheckout(req: Request) {
  const json = req.method === "POST" || wantsJsonCheckout(req);
  const userId = await getSessionUserId();
  if (!userId) {
    if (json) {
      return NextResponse.json({ error: "Log in to pay for AppHole Pro." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login?next=/go-pro", siteUrl()));
  }
  const user = await getUserById(userId);
  if (!user) {
    if (json) {
      return NextResponse.json({ error: "Your session is not valid. Log in again to pay." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login?next=/go-pro", siteUrl()));
  }
  const plan = await planForUser(userId);
  if (plan === "pro") {
    const already = `${siteUrl()}/dashboard?checkout=already`;
    if (json) return NextResponse.json({ url: already });
    return NextResponse.redirect(new URL(already));
  }
  if (!stripeConfigured()) {
    if (json) {
      return NextResponse.json({ error: STRIPE_NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }
    return NextResponse.redirect(new URL("/go-pro?pay=unavailable", siteUrl()));
  }

  try {
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
      if (json) return NextResponse.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
      return NextResponse.redirect(new URL("/go-pro?pay=error", siteUrl()));
    }
    if (json) return NextResponse.json({ url: session.url });
    return NextResponse.redirect(session.url, { headers: { "Cache-Control": "no-store" } });
  } catch {
    if (json) return NextResponse.json({ error: STRIPE_CHECKOUT_FAILED_MESSAGE }, { status: 500 });
    return NextResponse.redirect(new URL("/go-pro?pay=error", siteUrl()));
  }
}

export async function GET(req: Request) {
  return startCheckout(req);
}

export async function POST(req: Request) {
  return startCheckout(req);
}
