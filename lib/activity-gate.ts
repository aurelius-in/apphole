export function activityGate(key: string | undefined): { ok: true } | { ok: false; reason: "locked" | "unconfigured" } {
  const expected = process.env.ACTIVITY_ADMIN_SECRET?.trim();
  if (!expected) {
    if (process.env.VERCEL || process.env.NODE_ENV === "production") {
      return { ok: false, reason: "unconfigured" };
    }
    return { ok: true };
  }
  if (!key || key !== expected) return { ok: false, reason: "locked" };
  return { ok: true };
}
