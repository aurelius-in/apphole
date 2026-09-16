"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ReportAccountCta } from "@/components/ReportAccountCta";
import { ReportView } from "@/components/ReportView";
import { GoProLink } from "@/components/GoProLink";
import { track } from "@/lib/analytics";
import type { ScanRecord } from "@/lib/scans/types";

function CheckAgainLinks({ className = "" }: { className?: string }) {
  return (
    <p className={className}>
      <Link href="/" className="font-semibold text-ah-blue hover:underline">
        Check a new URL
      </Link>
      {" · "}
      <Link href="/check" className="font-semibold text-ah-blue hover:underline">
        Check my AppHole
      </Link>
    </p>
  );
}

export function ScanProgress({ id }: { id: string }) {
  const [scan, setScan] = useState<ScanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    let misses = 0;
    async function tick() {
      try {
        const res = await fetch(`/api/scans/${encodeURIComponent(id)}`, { cache: "no-store" });
        const data = (await res.json()) as ScanRecord & { error?: string };
        if (!res.ok) {
          if (res.status === 404 && misses < 6) {
            misses += 1;
            timer = setTimeout(tick, 500);
            return;
          }
          throw new Error(data.error || "Scan not found.");
        }
        misses = 0;
        if (!cancelled) setScan(data);
        if (data.status === "complete") track("ah_scan_completed", { id });
        if (data.status === "failed") track("ah_scan_failed", { id });
        if (data.status === "queued" || data.status === "running") {
          timer = setTimeout(tick, 900);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load scan");
      }
    }
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [id]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-ah-red">
        <p>{error}</p>
        <CheckAgainLinks className="mt-3 text-sm" />
      </div>
    );
  }
  if (!scan) {
    return <p className="text-ah-muted">Loading check…</p>;
  }
  if (scan.status === "failed") {
    return (
      <div className="rounded-2xl border border-ah-red bg-red-50 p-6">
        <h1 className="text-2xl font-bold">Check failed</h1>
        <p className="mt-2 text-sm">{scan.error || "The scan stopped before a report could be produced."}</p>
        <CheckAgainLinks className="mt-4 text-sm" />
      </div>
    );
  }
  if (scan.status !== "complete" || !scan.report) {
    return (
      <div className="rounded-3xl border border-ah-line bg-white p-6 shadow-card">
        <p className="text-sm font-semibold uppercase tracking-wider text-ah-blue">Checking {scan.url}</p>
        <h1 className="mt-2 text-3xl font-bold">Bobbing for AppHoles…</h1>
        <p className="mt-2 text-ah-muted">{scan.progress.message}</p>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-ah-bg">
          <div className="h-full rounded-full bg-ah-blue transition-[width] duration-500" style={{ width: `${scan.progress.percent}%` }} />
        </div>
        <p className="mt-2 text-xs text-ah-muted">{scan.progress.percent}% · {scan.progress.step}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-ah-blue">AppHole Report</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">{scan.url}</h1>
      </div>
      <ReportView report={scan.report} scanId={scan.id} showPlugQuote={false} />
      <ReportAccountCta scanId={scan.id} report={scan.report} />
      <RetestButton id={scan.id} />
    </div>
  );
}

function RetestButton({ id }: { id: string }) {
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={busy}
        className="rounded-full border border-ah-line px-4 py-2 text-sm font-semibold hover:bg-white disabled:opacity-60"
        onClick={async () => {
          setBusy(true);
          setMsg(null);
          track("ah_retest_started", { id });
          const res = await fetch(`/api/scans/${id}/retest`, { method: "POST" });
          const data = (await res.json()) as { id?: string; error?: string };
          setBusy(false);
          if (!res.ok) {
            setMsg(data.error || "Retest requires AppHole Pro.");
            return;
          }
          if (data.id) window.location.href = `/scan/${data.id}`;
        }}
      >
        {busy ? "Starting retest…" : "Retest (Pro)"}
      </button>
      {msg && (
        <p className="text-sm text-ah-muted">
          {msg}{" "}
          <GoProLink className="font-semibold text-ah-green-dark">Go Pro</GoProLink>
        </p>
      )}
    </div>
  );
}
