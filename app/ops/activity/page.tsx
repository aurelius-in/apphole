import Link from "next/link";
import { activityGate } from "@/lib/activity-gate";
import { loadActivity } from "@/lib/activity-log";
import {
  ACTIVITY_RANGES,
  buildActivityStats,
  parseActivityRange,
  type ActivityRange,
  type ActivityStats,
} from "@/lib/activity-stats";

export const dynamic = "force-dynamic";
export const metadata = { title: "Activity | AppHole", robots: { index: false, follow: false } };

type SearchParams = Promise<{ key?: string; range?: string }>;

export default async function ActivityPage({ searchParams }: { searchParams: SearchParams }) {
  const { key, range: rangeRaw } = await searchParams;
  const gate = activityGate(key);
  if (!gate.ok) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold">Activity</h1>
        <p className="mt-3 text-sm text-ah-muted">
          {gate.reason === "unconfigured"
            ? "Set ACTIVITY_ADMIN_SECRET, then open this page with ?key= that secret."
            : "Add the activity key to the URL: /ops/activity?key=YOUR_SECRET"}
        </p>
      </main>
    );
  }

  const range = parseActivityRange(rangeRaw);
  const stats = buildActivityStats(await loadActivity(), range);
  return <Board stats={stats} adminKey={key || ""} />;
}

function Board({ stats, adminKey }: { stats: ActivityStats; adminKey: string }) {
  const href = (range: ActivityRange) => {
    const params = new URLSearchParams();
    if (adminKey) params.set("key", adminKey);
    params.set("range", range);
    return `/ops/activity?${params.toString()}`;
  };
  const max = Math.max(...stats.funnel.map((step) => step.sessions), 1);

  return (
    <main className="min-h-screen bg-ah-bg px-4 py-10 text-ah-ink">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ah-blue">AppHole</p>
          <h1 className="mt-2 text-3xl font-extrabold">Activity</h1>
          <p className="mt-2 text-sm text-ah-muted">
            {stats.rangeLabel} · checks, time on page, and where people stop before an account ·{" "}
            {new Date(stats.checkedAt).toLocaleString()}
          </p>
        </header>

        <div className="flex flex-wrap justify-center gap-2">
          {ACTIVITY_RANGES.map((item) => (
            <Link
              key={item.id}
              href={href(item.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${
                stats.range === item.id ? "bg-ah-blue text-white" : "bg-white text-ah-muted ring-1 ring-ah-line"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <section className="rounded-3xl border border-ah-blue/20 bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ah-blue">{stats.rangeLabel} snapshot</p>
          <p className="mt-2 text-sm leading-relaxed">{stats.headline}</p>
        </section>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Visitors" value={stats.visitors} />
          <Stat label="Sessions" value={stats.sessions} />
          <Stat label="Page views" value={stats.pageViews} />
          <Stat label="Typical session" value={stats.medianSessionLabel} />
        </div>

        <section className="rounded-3xl border border-ah-line bg-white p-5 shadow-card">
          <h2 className="text-sm font-bold">Path to an account</h2>
          <p className="mt-1 text-xs text-ah-muted">Sessions that actually did each step. A later step does not invent the ones they skipped.</p>
          <ul className="mt-4 space-y-3">
            {stats.funnel.map((step) => (
              <li key={step.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-semibold">{step.label}</span>
                  <span className="tabular-nums text-ah-muted">
                    {step.sessions}
                    {step.continuePct === null ? "" : ` · ${step.continuePct}% continued`}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-ah-bg">
                  <div className="h-full rounded-full bg-ah-blue" style={{ width: `${Math.max(4, (step.sessions / max) * 100)}%` }} />
                </div>
                <p className="mt-1 text-xs text-ah-muted">{step.hint}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Where sessions stopped" hint="Furthest step in this window">
            {stats.stops.length === 0 ? (
              <Empty>No sessions yet.</Empty>
            ) : (
              <ul className="divide-y divide-ah-line">
                {stats.stops.map((row) => (
                  <li key={row.key} className="flex items-center justify-between py-2 text-sm">
                    <span>{row.label}</span>
                    <span className="font-bold tabular-nums">
                      {row.sessions}
                      {row.sharePct === null ? "" : ` · ${row.sharePct}%`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Signup" hint="The account form is optional. Free checks work without it.">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Saw the form" value={stats.signups.sawForm} />
              <Stat label="Started typing" value={stats.signups.started} />
              <Stat label="Submitted" value={stats.signups.submitted} />
              <Stat label="Created" value={stats.signups.completed} tone="good" />
              <Stat label="Failed" value={stats.signups.failed} tone={stats.signups.failed ? "bad" : "plain"} />
              <Stat label="Started, not finished" value={stats.signups.leftAfterStart} tone={stats.signups.leftAfterStart ? "bad" : "plain"} />
            </div>
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Checks" hint="The free product, before anyone is asked for an account.">
            <div className="grid grid-cols-2 gap-3">
              <Stat label="URL field focused" value={stats.checks.focused} />
              <Stat label="URL submitted" value={stats.checks.submitted} />
              <Stat label="Scans started" value={stats.checks.started} />
              <Stat label="Scans finished" value={stats.checks.completed} />
              <Stat label="Scans failed" value={stats.checks.failed} />
              <Stat label="Example report" value={stats.checks.exampleViews} />
              <Stat label="Pro clicks" value={stats.checks.proClicks} />
              <Stat label="Checkout started" value={stats.checks.checkoutStarts} />
              <Stat label="Plug quotes" value={stats.checks.plugQuotes} />
            </div>
          </Panel>
          <Panel title="What is getting read" hint="Median is time on that page before they left or moved on.">
            {stats.pages.length === 0 ? (
              <Empty>No page views yet.</Empty>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-ah-muted">
                  <tr>
                    <th className="py-1">Page</th>
                    <th>Views</th>
                    <th>Median</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.pages.map((page) => (
                    <tr key={page.path} className="border-t border-ah-line">
                      <td className="py-2 font-medium">{page.path}</td>
                      <td className="tabular-nums">{page.views}</td>
                      <td className="tabular-nums text-ah-muted">{page.medianDwellLabel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Panel>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <Panel title="Homepage sections reached" hint="A section counts when about half of it is on screen.">
            {stats.sections.length === 0 ? (
              <Empty>No section views yet.</Empty>
            ) : (
              <ul className="divide-y divide-ah-line">
                {stats.sections.map((row) => (
                  <li key={row.name} className="flex justify-between py-2 text-sm">
                    <span>{row.name}</span>
                    <span className="font-bold tabular-nums">{row.sessions} sessions</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
          <Panel title="Where they came from" hint="UTM source, otherwise the referring host.">
            {stats.sources.length === 0 ? (
              <Empty>No sessions yet.</Empty>
            ) : (
              <ul className="divide-y divide-ah-line">
                {stats.sources.map((row) => (
                  <li key={row.source} className="flex justify-between py-2 text-sm">
                    <span>{row.source}</span>
                    <span className="font-bold tabular-nums">{row.sessions}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </section>

        <Panel title="What stands out" hint="Read this before changing the page.">
          <ul className="space-y-3">
            {stats.insights.map((tip) => (
              <li key={tip.title} className="rounded-2xl bg-ah-bg px-4 py-3">
                <p className={`text-sm font-bold ${tip.severity === "critical" ? "text-ah-red" : tip.severity === "warn" ? "text-amber-700" : "text-ah-ink"}`}>
                  {tip.title}
                </p>
                <p className="mt-1 text-sm text-ah-muted">{tip.detail}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent sessions" hint="Trail of pages, then the furthest step and signup state.">
          {stats.recent.length === 0 ? (
            <Empty>No sessions yet.</Empty>
          ) : (
            <ul className="divide-y divide-ah-line">
              {stats.recent.map((row) => (
                <li key={`${row.id}-${row.when}`} className="py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold">{row.stopped}</span>
                    <span className="text-xs text-ah-muted">
                      {row.when} · {row.durationLabel} · {row.source}
                    </span>
                  </div>
                  <p className="mt-1 text-ah-muted">{row.trail}</p>
                  <p className="mt-1 text-xs font-semibold text-ah-blue">{row.signup}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {stats.events.length > 0 && (
          <Panel title="Other events" hint="Named actions besides page views.">
            <ul className="flex flex-wrap gap-2">
              {stats.events.map((event) => (
                <li key={event.name} className="rounded-full bg-ah-bg px-3 py-1 text-xs font-semibold">
                  {event.name} · {event.count}
                </li>
              ))}
            </ul>
          </Panel>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, tone = "plain" }: { label: string; value: number | string; tone?: "plain" | "good" | "bad" }) {
  const color = tone === "good" ? "text-ah-green-dark" : tone === "bad" ? "text-ah-red" : "text-ah-ink";
  return (
    <div className="rounded-2xl border border-ah-line bg-white p-3 shadow-card">
      <p className={`text-2xl font-extrabold tabular-nums ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-ah-muted">{label}</p>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-ah-line bg-white p-5 shadow-card">
      <h2 className="text-sm font-bold">{title}</h2>
      <p className="mt-1 text-xs text-ah-muted">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-ah-muted">{children}</p>;
}
