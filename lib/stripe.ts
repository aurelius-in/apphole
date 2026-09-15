import Stripe from "stripe";
import { siteUrl } from "@/lib/auth";

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(key, { typescript: true });
}

export function checkoutUrls() {
  const base = siteUrl();
  return {
    success: `${base}/dashboard/billing?checkout=success`,
    cancel: `${base}/pricing?checkout=cancel`,
  };
}

export function isProStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}
