import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getUserById, getUserByStripeCustomer, updateUser } from "@/lib/store";
import { getStripe, isProStatus } from "@/lib/stripe";

export const runtime = "nodejs";

async function syncSubscription(customerId: string, subscription: Stripe.Subscription) {
  const user = await getUserByStripeCustomer(customerId);
  if (!user) return;
  const active = isProStatus(subscription.status) || subscription.status === "past_due";
  await updateUser(user.id, {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    plan: active ? "pro" : "free",
    planStatus:
      subscription.status === "past_due"
        ? "past_due"
        : isProStatus(subscription.status)
          ? "active"
          : "canceled",
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.appholeUserId;
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    if (userId && customerId) {
      await updateUser(userId, { stripeCustomerId: customerId });
      const user = await getUserById(userId);
      if (user && session.subscription) {
        const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const sub = await getStripe().subscriptions.retrieve(subId);
        await syncSubscription(customerId, sub);
      }
    }
  }

  if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
    await syncSubscription(customerId, subscription);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice;
    const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (customerId) {
      const user = await getUserByStripeCustomer(customerId);
      if (user) await updateUser(user.id, { planStatus: "past_due" });
    }
  }

  return NextResponse.json({ received: true });
}
