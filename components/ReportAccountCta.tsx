"use client";

import Link from "next/link";
import { PlugQuoteForm } from "@/components/PlugQuoteForm";
import { descriptionFromFinding } from "@/lib/leads";
import { isAppHole, type ScanReport } from "@/lib/scans/types";

export function ReportAccountCta({ scanId, report }: { scanId: string; report: ScanReport }) {
  const plugFindings = report.findings.filter((finding) => isAppHole(finding.disposition)).map((finding, index) => ({
    id: finding.id,
    title: finding.title,
    label: `AppHole #${String(index + 1).padStart(2, "0")}: ${finding.title}`,
    description: descriptionFromFinding(finding),
  }));

  return (
    <div className="space-y-3">
      <PlugQuoteForm findings={plugFindings} scanId={scanId} scanUrl={report.url} source="report" />
      <p className="text-center text-sm text-ah-muted">
        Want the $29/month crawl plan instead?{" "}
        <Link href="/pricing" className="font-semibold text-ah-blue hover:underline">
          See Free vs Pro
        </Link>
        .
      </p>
    </div>
  );
}
