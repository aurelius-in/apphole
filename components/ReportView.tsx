import { PlugQuoteForm } from "@/components/PlugQuoteForm";
import { descriptionFromFinding } from "@/lib/leads";
import { DISPOSITION_LABEL, VERDICT_LABEL, isAppHole, type Disposition, type Finding, type ReadinessVerdict, type ScanReport } from "@/lib/scans/types";

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

export function FindingCard({ finding, kicker }: { finding: Finding; kicker: string }) {
  return (
    <details className="group rounded-2xl border border-ah-line bg-white p-4 shadow-sm open:shadow-card">
      <summary className="flex cursor-pointer list-none flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-ah-muted">{kicker}</p>
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
  showPlugQuote = true,
}: {
  report: ScanReport;
  example?: boolean;
  scanId?: string;
  showPlugQuote?: boolean;
}) {
  const holes = report.findings.filter((f) => isAppHole(f.disposition));
  const unverified = report.findings.filter((f) => f.disposition === "COULDNT_VERIFY");
  const passes = report.findings.filter((f) => f.disposition === "PASS");
  const holeLabel = holes.length === 1 ? "AppHole found" : "AppHoles found";
  const plugFindings = holes.map((finding, index) => ({
    id: finding.id,
    title: finding.title,
    label: `AppHole #${String(index + 1).padStart(2, "0")}: ${finding.title}`,
    description: descriptionFromFinding(finding),
  }));
  return (
    <div className="space-y-6">
      {example && (
        <p className="ah-badge bg-slate-100 text-slate-700">Example AppHole Report</p>
      )}
      <div className={`rounded-3xl border-2 p-6 ${VERDICT_CLASS[report.verdict]}`}>
        <p className="text-sm font-semibold uppercase tracking-wider">{VERDICT_LABEL[report.verdict]}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          {holes.length} {holeLabel}
        </h2>
        <p className="mt-2 max-w-2xl text-ah-ink/80">{report.verdictSummary}</p>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
          <div>
            <dt className="text-ah-muted">Fix first</dt>
            <dd className="text-xl font-bold text-ah-red">{holes.filter((f) => f.disposition === "FIX_BEFORE_SELLING").length}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Test before building</dt>
            <dd className="text-xl font-bold text-orange-700">{holes.filter((f) => f.disposition === "TEST_BEFORE_BUILDING").length}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Not blocking</dt>
            <dd className="text-xl font-bold text-amber-700">{holes.filter((f) => f.disposition === "NOT_BLOCKING_A_SALE").length}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Couldn&apos;t verify</dt>
            <dd className="text-xl font-bold">{unverified.length}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Passes</dt>
            <dd className="text-xl font-bold text-ah-green-dark">{passes.length}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        {holes.map((finding, index) => (
          <FindingCard key={finding.id} finding={finding} kicker={`AppHole #${String(index + 1).padStart(2, "0")}`} />
        ))}
      </div>

      {showPlugQuote && (
        <PlugQuoteForm
          findings={plugFindings}
          scanId={scanId}
          scanUrl={report.url}
          source={example ? "example" : "report"}
        />
      )}

      {unverified.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Could not verify</h3>
          <p className="text-sm text-ah-muted">These are gaps in the check, not AppHoles on the public site.</p>
          {unverified.map((finding) => (
            <FindingCard key={finding.id} finding={finding} kicker="Could not verify" />
          ))}
        </section>
      )}

      {passes.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Passed checks</h3>
          <p className="text-sm text-ah-muted">Passes are shown so you can see what was actually inspected. They are not AppHoles.</p>
          {passes.map((finding) => (
            <FindingCard key={finding.id} finding={finding} kicker="Passed check" />
          ))}
        </section>
      )}

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
