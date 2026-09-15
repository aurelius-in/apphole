import { getUserById } from "@/lib/store";
import type { Plan } from "@/lib/plans";

export async function planForUser(userId?: string | null): Promise<Plan> {
  if (!userId) return "free";
  const user = await getUserById(userId);
  if (!user) return "free";
  if (user.plan === "pro" && (user.planStatus === "active" || user.planStatus === "past_due")) return "pro";
  return "free";
}
