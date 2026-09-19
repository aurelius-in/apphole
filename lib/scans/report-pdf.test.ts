import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { exampleReport } from "@/lib/scans/example";
import { buildReportPdf, formatReportDate, pdfSafe, reportPdfFilename } from "@/lib/scans/report-pdf";

function pngDataUrl(rel: string) {
  const buf = readFileSync(path.join(process.cwd(), rel));
  return `data:image/png;base64,${buf.toString("base64")}`;
}

describe("report PDF", () => {
  it("names the file from host and date", () => {
    expect(reportPdfFilename(exampleReport, true)).toBe("apphole-example-example-app.invalid-2026-09-15.pdf");
    expect(reportPdfFilename(exampleReport)).toBe("apphole-report-example-app.invalid-2026-09-15.pdf");
  });

  it("formats the completed date", () => {
    expect(formatReportDate(exampleReport.completedAt)).toMatch(/Sep 15, 2026/);
  });

  it("strips em dashes and fancy quotes", () => {
    expect(pdfSafe("Don't wait\u2014fix it \u201Cnow\u201D")).toBe("Don't wait-fix it \"now\"");
  });

  it("builds a branded PDF with this report's holes and verdict", () => {
    const bytes = buildReportPdf(exampleReport, {
      example: true,
      logoDataUrl: pngDataUrl("public/ah-logo.png"),
      wordmarkDataUrl: pngDataUrl("public/ah-title.png"),
    });
    expect(Buffer.from(bytes.subarray(0, 5)).toString("latin1")).toBe("%PDF-");
    expect(bytes.byteLength).toBeGreaterThan(20_000);
    const text = Buffer.from(bytes).toString("latin1");
    expect(text).toContain("example-app.invalid");
    expect(text).toContain("PLUG THESE FIRST");
    expect(text).toContain("Checkout fails on mobile");
    expect(text).toContain("FIX BEFORE SELLING");
    expect(text).toContain("Core workflow works");
    expect(text).toContain("Could not verify");
    expect(text).not.toContain("RAIN");
    expect(text).toContain("Don't expose your AppHole in public.");
  });
});
