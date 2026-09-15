import type { Disposition, Finding, ReadinessVerdict, ScanReport } from "@/lib/scans/types";
import { DISPOSITION_LABEL, VERDICT_LABEL } from "@/lib/scans/types";

const DISPOSITION_CLASS: Record<Disposition, string> = {
  FIX_BEFORE_SELLING: "bg-red-100 text-ah-red",
  TEST_BEFORE_BUILDING: "bg-orange-100 text-orange-800",
  NOT_BLOCKING_A_SALE: "bg-amber-100 text-amber-800",
  COULDNT_VERIFY: "bg-slate-100 text-slate-700",
  PASS: "bg-emerald-100 text-emerald-800",
};

const VERDICT_CLASS: Record<ReadinessVerdict, string> = {
  READY_TO_FACE_CUSTOMERS: "border-ah-green bg-emerald-50",
  PLUG_THESE_FIRST: "border-ah-orange bg-amber-50",
  NOT_READY_FOR_CUSTOMERS: "border-ah-red bg-red-50",
  INCOMPLETE_CHECK: "border-slate-300 bg-slate-50",
};

export function DispositionBadge({ value }: { value: Disposition }) {
  return <span className={`ah-badge ${DISPOSITION_CLASS[value]}`}>{DISPOSITION_LABEL[value]}</span>;
}

export function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  return (
    <details className="group rounded-2xl border border-ah-line bg-white p-4 shadow-sm open:shadow-card">
      <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ah-muted">AppHole #{String(index + 1).padStart(2, "0")}</p>
          <h3 className="text-lg font-semibold">{finding.title}</h3>
        </div>
        <DispositionBadge value={finding.disposition} />
      </summary>
      <div className="mt-4 space-y-3 text-sm leading-6 text-ah-muted">
        <p>
          <span className="font-semibold text-ah-ink">Observed. </span>
          {finding.observed}
        </p>
        <p>
          <span className="font-semibold text-ah-ink">Why it matters. </span>
          {finding.whyItMatters}
        </p>
        <p>
          <span className="font-semibold text-ah-ink">Plug. </span>
          {finding.recommendedPlug}
        </p>
        {finding.url && (
          <p>
            <span className="font-semibold text-ah-ink">URL. </span>
            <a className="text-ah-blue break-all" href={finding.url} target="_blank" rel="noreferrer">
              {finding.url}
            </a>
          </p>
        )}
        {finding.evidence.length > 0 && (
          <ul className="space-y-1 rounded-xl bg-ah-bg p-3">
            {finding.evidence.map((item, i) => (
              <li key={i}>
                <span className="font-medium text-ah-ink">{item.label}: </span>
                {item.value}
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs">
          Retest: {finding.retest} Confidence {Math.round(finding.confidence * 100)}%. Category {finding.category.replace(/_/g, " ")}.
        </p>
      </div>
    </details>
  );
}

export function ReportView({
  report,
  example = false,
  scanId,
}: {
  report: ScanReport;
  example?: boolean;
  scanId?: string;
}) {
  const holes = report.findings.filter((f) => f.disposition !== "PASS" && f.disposition !== "COULDNT_VERIFY");
  return (
    <div className="space-y-6">
      {example && (
        <p className="ah-badge bg-slate-100 text-slate-700">Example AppHole Report</p>
      )}
      <div className={`rounded-3xl border-2 p-6 ${VERDICT_CLASS[report.verdict]}`}>
        <p className="text-sm font-semibold uppercase tracking-wider">{VERDICT_LABEL[report.verdict]}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">{report.holeCount} AppHoles found</h2>
        <p className="mt-2 max-w-2xl text-ah-ink/80">{report.verdictSummary}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <div>
            <dt className="text-ah-muted">Fix first</dt>
            <dd className="text-xl font-bold text-ah-red">{report.blockerCount}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Test before building</dt>
            <dd className="text-xl font-bold text-orange-700">{report.testBeforeCount}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Not blocking</dt>
            <dd className="text-xl font-bold text-amber-700">{report.notBlockingCount}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Couldn&apos;t verify</dt>
            <dd className="text-xl font-bold">{report.unverifiedCount}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Passes</dt>
            <dd className="text-xl font-bold text-ah-green-dark">{report.passCount}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        {report.findings.map((finding, index) => (
          <FindingCard key={finding.id} finding={finding} index={index} />
        ))}
      </div>

      <section className="rounded-2xl border border-ah-line bg-white p-5 text-sm">
        <h3 className="font-semibold">What this check covered</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ah-muted">
          {report.checked.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-4 font-semibold">What it could not verify</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-ah-muted">
          {report.couldNotVerify.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {scanId && (
          <p className="mt-4 text-ah-muted">
            Scan id <code>{scanId}</code>. Public HTTP check
            {report.pagesCrawled.length ? ` across ${report.pagesCrawled.length} pages` : ""}. Mode {report.mode}.
          </p>
        )}
      </section>
      {holes.length === 0 && !example && (
        <p className="text-sm text-ah-muted">Few or no public holes does not mean customers will buy. AppHole tests readiness, not demand.</p>
      )}
    </div>
  );
}
