"use client";

import { useState } from "react";
import type { ScanReport } from "@/lib/scans/types";

export function DownloadReportPdf({
  report,
  example = false,
  scanId,
}: {
  report: ScanReport;
  example?: boolean;
  scanId?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDownload() {
    setBusy(true);
    setError(null);
    try {
      const { buildReportPdf, fetchAsDataUrl, reportPdfFilename } = await import("@/lib/scans/report-pdf");
      const [logoDataUrl, wordmarkDataUrl] = await Promise.all([
        fetchAsDataUrl("/ah-logo.png"),
        fetchAsDataUrl("/ah-title.png"),
      ]);
      const bytes = buildReportPdf(report, { example, scanId, logoDataUrl, wordmarkDataUrl });
      const copy = new Uint8Array(bytes.byteLength);
      copy.set(bytes);
      const blob = new Blob([copy.buffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = reportPdfFilename(report, example);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not build this PDF.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-stretch sm:items-end">
      <button
        type="button"
        disabled={busy}
        aria-label="Download PDF"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-ah-blue px-4 py-2.5 text-sm font-semibold text-white shadow-brand hover:bg-ah-blue-dark disabled:opacity-60"
        onClick={() => void onDownload()}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 2v8.2M5.2 7.8 8 10.6l2.8-2.8M3 13.2h10"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {busy ? "Preparing PDF..." : "Download PDF"}
      </button>
      {error ? <p className="mt-2 max-w-[14rem] text-xs text-ah-red">{error}</p> : null}
    </div>
  );
}
