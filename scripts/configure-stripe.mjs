/**
 * One-shot live (or test) Stripe setup for AppHole.
 * Usage: node scripts/configure-stripe.mjs
 * Requires STRIPE_SECRET_KEY in the environment (do not commit it).
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first.");
  process.exit(1);
}

const stripe = new Stripe(key);
const live = key.startsWith("sk_live_") || key.startsWith("rk_live_");

const product = await stripe.products.create({
  name: "AppHole Pro",
  description: "Deeper AppHole checks, saved history, and retests.",
  metadata: { app: "apphole" },
});

const price = await stripe.prices.create({
  product: product.id,
  currency: "usd",
  unit_amount: 2900,
  recurring: { interval: "month" },
  nickname: "AppHole Pro monthly",
});

const webhook = await stripe.webhookEndpoints.create({
  url: "https://apphole.pro/api/stripe/webhook",
  enabled_events: [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed",
  ],
  description: "AppHole production billing",
});

console.log(JSON.stringify({
  mode: live ? "live" : "test",
  productId: product.id,
  priceId: price.id,
  webhookId: webhook.id,
  webhookSecretSet: Boolean(webhook.secret),
}, null, 2));
if (webhook.secret) {
  console.log("WEBHOOK_SECRET_READY");
}
