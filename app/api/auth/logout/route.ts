import { NextResponse } from "next/server";
import { clearSession, siteUrl } from "@/lib/auth";

export async function POST() {
  await clearSession();
  return NextResponse.redirect(new URL("/login", siteUrl()));
}
