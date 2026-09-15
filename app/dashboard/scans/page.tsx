import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import { getSessionUserId, readAnonymousId } from "@/lib/auth";
import { listScansFor } from "@/lib/store";

export const metadata = { title: "Scans | AppHole" };

export default async function ScansPage() {
  const userId = await getSessionUserId();
  const anonymousId = await readAnonymousId();
  const scans = await listScansFor({ userId: userId || undefined, anonymousId });

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <DashboardNav />
      <div>
        <h1 className="text-3xl font-bold">Scans</h1>
        <ul className="mt-6 space-y-3">
          {scans.length === 0 && <li className="text-sm text-ah-muted">No scans stored in this browser session yet.</li>}
          {scans.map((scan) => (
            <li key={scan.id} className="rounded-2xl border border-ah-line bg-white p-4">
              <Link href={`/scan/${scan.id}`} className="font-semibold hover:text-ah-blue">
                {scan.url}
              </Link>
              <p className="text-xs text-ah-muted">
                {scan.status} · {new Date(scan.createdAt).toLocaleString()} · {scan.report?.verdict ?? "in progress"}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
