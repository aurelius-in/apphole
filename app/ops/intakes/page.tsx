import Link from "next/link";
import { activityGate } from "@/lib/activity-gate";
import { listIntakes, type UrlIntake } from "@/lib/intakes";
import { getUserById } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Submitted URLs | AppHole", robots: { index: false, follow: false } };

type SearchParams = Promise<{ key?: string }>;

export default async function IntakesPage({ searchParams }: { searchParams: SearchParams }) {
  const { key } = await searchParams;
  const gate = activityGate(key);
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Submitted URLs</h1>
        <p className="mt-3 text-sm text-ah-muted">
          {gate.reason === "unconfigured"
            ? "Set ACTIVITY_ADMIN_SECRET, then open this page with ?key= that secret."
            : "Add the activity key to the URL: /ops/intakes?key=YOUR_SECRET"}
        </p>
      </main>
    );
  }

  const rows = await listIntakes();
  const emails = new Map<string, string>();
  for (const row of rows) {
    if (!row.userId || emails.has(row.userId)) continue;
    const user = await getUserById(row.userId);
    if (user) emails.set(row.userId, user.email);
  }
  const realistic = rows.filter((row) => row.realistic).length;
  const common = rows.filter((row) => row.kind === "common_site").length;
  const github = rows.filter((row) => row.kind === "github_repo").length;

  return (
    <main className="min-h-screen bg-ah-bg px-4 py-10 text-ah-ink">
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ah-blue">AppHole</p>
          <h1 className="mt-2 text-3xl font-extrabold">Submitted URLs</h1>
          <p className="mt-2 text-sm text-ah-muted">
            Every URL entered on the check form. Realistic means a product site or a public GitHub repo. Common sites such as google.com stay in the list so they do not get counted as product tests.
          </p>
          <p className="mt-3 text-sm">
            <Link className="font-semibold text-ah-blue" href={key ? `/ops/activity?key=${encodeURIComponent(key)}` : "/ops/activity"}>
              Activity
            </Link>
          </p>
        </header>
        <section className="grid gap-3 sm:grid-cols-4">
          <Stat label="Entered" value={String(rows.length)} />
          <Stat label="Realistic" value={String(realistic)} />
          <Stat label="GitHub repos" value={String(github)} />
          <Stat label="Common sites" value={String(common)} />
        </section>
        <div className="overflow-x-auto rounded-3xl border border-ah-line bg-white shadow-card">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-ah-line text-xs uppercase tracking-wide text-ah-muted">
              <tr>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Kind</th>
                <th className="px-4 py-3">Realistic</th>
                <th className="px-4 py-3">Result</th>
                <th className="px-4 py-3">Account</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-ah-muted" colSpan={6}>
                    No URLs yet.
                  </td>
                </tr>
              ) : (
                rows.map((row) => <IntakeRow key={row.id} row={row} email={row.userId ? emails.get(row.userId) : undefined} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ah-line bg-white p-4 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wide text-ah-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function IntakeRow({ row, email }: { row: UrlIntake; email?: string }) {
  return (
    <tr className="border-b border-ah-line/70 align-top">
      <td className="whitespace-nowrap px-4 py-3 text-ah-muted">{new Date(row.ts).toLocaleString()}</td>
      <td className="px-4 py-3">
        <div className="max-w-sm break-all font-medium">{row.raw}</div>
        <div className="text-xs text-ah-muted">{row.note}</div>
      </td>
      <td className="px-4 py-3">{row.kind.replace(/_/g, " ")}</td>
      <td className="px-4 py-3">{row.realistic ? "Yes" : "No"}</td>
      <td className="px-4 py-3">
        {row.scanId ? (
          <Link className="font-semibold text-ah-blue" href={`/scan/${row.scanId}`}>
            {row.outcome}
          </Link>
        ) : (
          <span>
            {row.outcome}
            {row.rejectReason ? ` (${row.rejectReason})` : ""}
          </span>
        )}
      </td>
      <td className="px-4 py-3">{email || row.anonymousId.slice(0, 8)}</td>
    </tr>
  );
}
