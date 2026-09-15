import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { getUserById } from "@/lib/store";
import { planForUser } from "@/lib/entitlements";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ user: null, plan: "free" });
  const user = await getUserById(userId);
  if (!user) return NextResponse.json({ user: null, plan: "free" });
  const plan = await planForUser(userId);
  return NextResponse.json({
    user: { id: user.id, email: user.email, plan, planStatus: user.planStatus },
    plan,
  });
}
