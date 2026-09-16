import Stripe from "stripe";
import { siteUrl } from "@/lib/auth";

export const STRIPE_NOT_CONFIGURED_MESSAGE =
  "Card checkout is not live yet. Stripe billing is not configured on this server. Your AppHole account is ready. Try Subscribe again after billing is enabled, or email hello@apphole.pro.";

export const STRIPE_CHECKOUT_FAILED_MESSAGE =
  "Stripe Checkout could not start. Try Subscribe again in a minute, or email hello@apphole.pro.";

export function stripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRO_PRICE_ID);
}

export function wantsJsonCheckout(req: Request) {
  const accept = req.headers.get("accept") || "";
  return accept.includes("application/json");
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  return new Stripe(key, { typescript: true });
}

export function checkoutUrls() {
  const base = siteUrl();
  return {
    success: `${base}/dashboard?checkout=success`,
    cancel: `${base}/go-pro?pay=canceled`,
  };
}

export function isProStatus(status?: string | null) {
  return status === "active" || status === "trialing";
}
