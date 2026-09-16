import Link from "next/link";
import { DashboardNav } from "@/components/DashboardNav";
import { GoProLink } from "@/components/GoProLink";
import { getSessionUserId, readAnonymousId } from "@/lib/auth";
import { planForUser } from "@/lib/entitlements";
import { listScansFor } from "@/lib/store";
import { VERDICT_LABEL } from "@/lib/scans/types";

export const metadata = { title: "Dashboard | AppHole" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string; welcome?: string }>;
}) {
  const { checkout, welcome } = await searchParams;
  const userId = await getSessionUserId();
  const anonymousId = await readAnonymousId();
  const plan = await planForUser(userId);
  const scans = await listScansFor({ userId: userId || undefined, anonymousId });
  const latest = scans[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <DashboardNav />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="mt-1 text-sm text-ah-muted">Plan: {plan === "pro" ? "AppHole Pro" : "AppHole Free"}</p>
        </div>
        {welcome === "1" && userId && (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm">
            You&apos;re in. Your AppHole account is ready.{" "}
            {plan === "pro" ? "Pro is active." : (
              <>
                <GoProLink className="font-semibold text-ah-green-dark">Go Pro</GoProLink> for deeper crawls, history, and retests.
              </>
            )}
          </p>
        )}
        {checkout === "success" && (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm">
            You&apos;re in. Payment finished. Pro turns on when Stripe confirms the subscription.
          </p>
        )}
        {checkout === "already" && (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm">This account already has AppHole Pro.</p>
        )}
        {checkout === "pending" && userId && (
          <p className="rounded-xl bg-emerald-50 p-3 text-sm">
            You&apos;re in. Your AppHole account is ready. Card checkout is not live in this environment yet. Free checks still run.
          </p>
        )}
        {!userId && (
          <p className="rounded-xl border border-ah-line bg-white p-3 text-sm">
            You are browsing without an account.{" "}
            <Link href={`/signup?next=${encodeURIComponent("/dashboard?welcome=1")}`} className="font-semibold text-ah-blue">
              Create an account
            </Link>{" "}
            to save scans, or{" "}
            <GoProLink className="font-semibold text-ah-green-dark">Go Pro</GoProLink>.
          </p>
        )}
        <section className="rounded-3xl border border-ah-line bg-white p-6 shadow-sm">
          {latest?.report ? (
            <>
              <p className="text-sm text-ah-muted">{latest.url}</p>
              <h2 className="mt-1 text-2xl font-bold">{VERDICT_LABEL[latest.report.verdict]}</h2>
              <p className="mt-2 text-sm">{latest.report.verdictSummary}</p>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-ah-muted">Blockers</dt>
                  <dd className="text-xl font-bold text-ah-red">{latest.report.blockerCount}</dd>
                </div>
                <div>
                  <dt className="text-ah-muted">Test first</dt>
                  <dd className="text-xl font-bold">{latest.report.testBeforeCount}</dd>
                </div>
                <div>
                  <dt className="text-ah-muted">Not blocking</dt>
                  <dd className="text-xl font-bold">{latest.report.notBlockingCount}</dd>
                </div>
                <div>
                  <dt className="text-ah-muted">Unverified</dt>
                  <dd className="text-xl font-bold">{latest.report.unverifiedCount}</dd>
                </div>
              </dl>
              <Link href={`/scan/${latest.id}`} className="mt-4 inline-block text-sm font-semibold text-ah-blue">
                Open report
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold">No checks yet</h2>
              <p className="mt-2 text-sm text-ah-muted">Run a public AppHole Check to see blockers vs polish.</p>
              <Link href="/check" className="mt-4 inline-flex rounded-full bg-ah-blue px-4 py-2 text-sm font-semibold text-white">
                Check my AppHole
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
