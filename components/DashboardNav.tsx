import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { CTA_GO_PRO, CTA_UPGRADE } from "@/lib/pricing";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/scans", label: "Scans" },
  { href: "/check", label: "New check" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export async function DashboardNav() {
  const userId = await getSessionUserId();
  const plan = await planForUser(userId);
  return (
    <aside className="rounded-3xl border border-ah-line bg-white p-4 shadow-sm">
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-ah-muted">AppHole</p>
      <nav className="mt-3 flex flex-col gap-1 text-sm font-medium" aria-label="Dashboard">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 hover:bg-ah-bg">
            {item.label}
          </Link>
        ))}
        {userId && plan !== "pro" && (
          <Link
            href="/go-pro"
            className="rounded-xl bg-ah-green px-3 py-2 font-semibold text-ah-ink hover:bg-ah-green-dark hover:text-white"
          >
            {CTA_UPGRADE}
          </Link>
        )}
        {userId ? (
          <form action="/api/auth/logout" method="post">
            <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-ah-bg" type="submit">
              Log out
            </button>
          </form>
        ) : (
          <>
            <Link href="/login" className="rounded-xl px-3 py-2 hover:bg-ah-bg">
              Log in
            </Link>
            <Link href="/signup" className="rounded-xl px-3 py-2 hover:bg-ah-bg">
              Sign up
            </Link>
            <Link href="/go-pro" className="rounded-xl px-3 py-2 hover:bg-ah-bg">
              {CTA_GO_PRO}
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
}
