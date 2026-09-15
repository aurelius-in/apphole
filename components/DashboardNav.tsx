import Link from "next/link";
import { getSessionUserId } from "@/lib/auth";

const items = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/scans", label: "Scans" },
  { href: "/check", label: "New check" },
  { href: "/dashboard/billing", label: "Billing" },
  { href: "/dashboard/settings", label: "Settings" },
];

export async function DashboardNav() {
  const userId = await getSessionUserId();
  return (
    <aside className="rounded-3xl border border-ah-line bg-white p-4 shadow-sm">
      <p className="px-2 text-xs font-semibold uppercase tracking-wider text-ah-muted">AppHole</p>
      <nav className="mt-3 flex flex-col gap-1 text-sm font-medium" aria-label="Dashboard">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl px-3 py-2 hover:bg-ah-bg">
            {item.label}
          </Link>
        ))}
        {userId ? (
          <form action="/api/auth/logout" method="post">
            <button className="w-full rounded-xl px-3 py-2 text-left hover:bg-ah-bg" type="submit">
              Log out
            </button>
          </form>
        ) : (
          <Link href="/login" className="rounded-xl px-3 py-2 hover:bg-ah-bg">
            Log in to save history
          </Link>
        )}
      </nav>
    </aside>
  );
}
