import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { stripeConfigured } from "@/lib/stripe";

export const metadata = { title: "Go Pro | AppHole" };

export default async function GoProPage() {
  const userId = await getSessionUserId();
  if (!userId) {
    redirect("/signup?next=/go-pro");
  }
  const plan = await planForUser(userId);
  if (plan === "pro") {
    redirect("/dashboard?checkout=already");
  }
  if (!stripeConfigured()) {
    redirect("/dashboard?welcome=1&checkout=pending");
  }
  redirect("/api/stripe/checkout");
}
