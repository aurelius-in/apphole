import { jsPDF } from "jspdf";
import {
  DISPOSITION_LABEL,
  VERDICT_LABEL,
  isAppHole,
  type Disposition,
  type Finding,
  type ReadinessVerdict,
  type ScanReport,
} from "@/lib/scans/types";

type RGB = readonly [number, number, number];

const BLUE: RGB = [0, 140, 255];
const RED: RGB = [227, 27, 35];
const GREEN: RGB = [33, 209, 74];
const GREEN_DARK: RGB = [18, 163, 54];
const INK: RGB = [18, 20, 26];
const MUTED: RGB = [90, 98, 112];
const LINE: RGB = [230, 232, 238];
const WASH: RGB = [246, 247, 249];
const WHITE: RGB = [255, 255, 255];
const ORANGE: RGB = [245, 158, 11];
const AMBER_INK: RGB = [146, 64, 14];
const AMBER_BG: RGB = [254, 243, 199];

const PAGE_W = 215.9;
const PAGE_H = 279.4;
const MX = 16;
const CONTENT_W = PAGE_W - MX * 2;
const BODY_BOTTOM = 258;
const FOOTER_Y = 268;

const VERDICT_COLOR: Record<ReadinessVerdict, RGB> = {
  READY_TO_FACE_CUSTOMERS: GREEN_DARK,
  PLUG_THESE_FIRST: ORANGE,
  NOT_READY_FOR_CUSTOMERS: RED,
  INCOMPLETE_CHECK: MUTED,
};

const DISPOSITION_STYLE: Record<Disposition, { bg: RGB; fg: RGB }> = {
  FIX_BEFORE_SELLING: { bg: RED, fg: WHITE },
  TEST_BEFORE_BUILDING: { bg: ORANGE, fg: INK },
  NOT_BLOCKING_A_SALE: { bg: AMBER_BG, fg: AMBER_INK },
  COULDNT_VERIFY: { bg: LINE, fg: MUTED },
  PASS: { bg: [220, 252, 231], fg: GREEN_DARK },
};

export type ReportPdfOptions = {
  example?: boolean;
  scanId?: string;
  logoDataUrl?: string;
  wordmarkDataUrl?: string;
};

export function pdfSafe(input: string): string {
  return input
    .replace(/[\u2012\u2013\u2014\u2015]/g, "-")
    .replace(/[\u2018\u2019\u201A]/g, "'")
    .replace(/[\u201C\u201D\u201E]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\u0009\u000A\u000D\u0020-\u007E\u00A0-\u00FF]/g, "");
}

export function reportPdfFilename(report: ScanReport, example = false): string {
  let host = "report";
  try {
    host = new URL(report.url).hostname.replace(/^www\./, "") || host;
  } catch {
    host = report.url.replace(/^https?:\/\//i, "").split("/")[0] || host;
  }
  host = host.replace(/[^a-z0-9.-]+/gi, "-").replace(/^-+|-+$/g, "") || "report";
  const day = (report.completedAt || report.startedAt || "").slice(0, 10) || "draft";
  return `${example ? "apphole-example" : "apphole-report"}-${host}-${day}.pdf`;
}

export function formatReportDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export async function fetchAsDataUrl(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url);
    if (!res.ok) return undefined;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    const mime = res.headers.get("content-type")?.split(";")[0] || "image/png";
    const b64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(bytes).toString("base64");
    return `data:${mime};base64,${b64}`;
  } catch {
    return undefined;
  }
}

function imageFormat(dataUrl: string): "PNG" | "JPEG" {
  if (/^data:image\/jpe?g/i.test(dataUrl)) return "JPEG";
  return "PNG";
}

export function buildReportPdf(report: ScanReport, options: ReportPdfOptions = {}): Uint8Array {
  const painter = new ReportPdfPainter(report, options);
  return painter.build();
}

class ReportPdfPainter {
  private readonly doc: jsPDF;
  private y = 0;
  private page = 1;

  constructor(
    private readonly report: ScanReport,
    private readonly options: ReportPdfOptions,
  ) {
    this.doc = new jsPDF({ unit: "mm", format: "letter" });
  }

  build(): Uint8Array {
    this.drawFirstHeader();
    this.drawCover();
    this.drawHoles();
    this.drawQuietSection("Could not verify", "Gaps in the check. Not AppHoles on the public site.", this.unverified());
    this.drawQuietSection("Passed checks", "Inspected and clear in this pass. Not AppHoles.", this.passes());
    this.drawCoverage();
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i += 1) {
      this.doc.setPage(i);
      this.drawFooter(i, total);
    }
    return new Uint8Array(this.doc.output("arraybuffer"));
  }

  private holes(): Finding[] {
    return this.report.findings.filter((f) => isAppHole(f.disposition));
  }

  private unverified(): Finding[] {
    return this.report.findings.filter((f) => f.disposition === "COULDNT_VERIFY");
  }

  private passes(): Finding[] {
    return this.report.findings.filter((f) => f.disposition === "PASS");
  }

  private fill(c: RGB) {
    this.doc.setFillColor(c[0], c[1], c[2]);
  }

  private stroke(c: RGB) {
    this.doc.setDrawColor(c[0], c[1], c[2]);
  }

  private ink(c: RGB = INK) {
    this.doc.setTextColor(c[0], c[1], c[2]);
  }

  private font(style: "normal" | "bold" = "normal", size = 10) {
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
  }

  private wrap(text: string, width: number): string[] {
    const clean = pdfSafe(text).trim();
    if (!clean) return [];
    return this.doc.splitTextToSize(clean, width) as string[];
  }

  private tryImage(dataUrl: string | undefined, x: number, y: number, w: number, h: number) {
    if (!dataUrl) return false;
    try {
      this.doc.addImage(dataUrl, imageFormat(dataUrl), x, y, w, h, undefined, "FAST");
      return true;
    } catch {
      return false;
    }
  }

  private drawTopBar() {
    this.fill(BLUE);
    this.doc.rect(0, 0, PAGE_W, 3.6, "F");
    this.fill(RED);
    this.doc.rect(PAGE_W - 18, 0, 9, 3.6, "F");
    this.fill(GREEN);
    this.doc.rect(PAGE_W - 9, 0, 9, 3.6, "F");
  }

  private drawFirstHeader() {
    this.drawTopBar();
    const logo = 13;
    const hasLogo = this.tryImage(this.options.logoDataUrl, MX, 7.2, logo, logo);
    const textX = hasLogo ? MX + logo + 4 : MX;
    const hasMark = this.tryImage(this.options.wordmarkDataUrl, textX, 8.4, 48, 10.5);
    if (!hasMark) {
      this.font("bold", 18);
      this.ink(BLUE);
      this.doc.text("AppHole", textX, 16);
    }
    this.font("bold", 8);
    this.ink(MUTED);
    this.doc.text("apphole.pro", PAGE_W - MX, 11.2, { align: "right" });
    this.font("normal", 8);
    this.doc.text(this.options.example ? "Example report" : "Scan report", PAGE_W - MX, 15.6, { align: "right" });
    this.stroke(LINE);
    this.doc.setLineWidth(0.35);
    this.doc.line(MX, 22.4, PAGE_W - MX, 22.4);
    this.y = 28;
  }

  private drawContinuedHeader() {
    this.drawTopBar();
    const hasLogo = this.tryImage(this.options.logoDataUrl, MX, 5.4, 8, 8);
    this.font("bold", 10);
    this.ink(INK);
    this.doc.text("AppHole Report", hasLogo ? MX + 11 : MX, 10.8);
    this.font("normal", 8);
    this.ink(MUTED);
    const url = pdfSafe(this.report.url);
    this.doc.text(url.length > 62 ? `${url.slice(0, 59)}...` : url, PAGE_W - MX, 10.8, { align: "right" });
    this.stroke(LINE);
    this.doc.setLineWidth(0.3);
    this.doc.line(MX, 15.2, PAGE_W - MX, 15.2);
    this.y = 20;
  }

  private newPage() {
    this.doc.addPage();
    this.page += 1;
    this.drawContinuedHeader();
  }

  private ensure(height: number) {
    if (this.y + height <= BODY_BOTTOM) return;
    this.newPage();
  }

  private drawCover() {
    const holes = this.holes();
    const holeLabel = holes.length === 1 ? "AppHole found" : "AppHoles found";
    this.font("bold", 8);
    this.ink(BLUE);
    this.doc.text(this.options.example ? "EXAMPLE APPHOLE REPORT" : "APPHOLE REPORT", MX, this.y);
    this.y += 8;

    this.font("bold", 16);
    this.ink(INK);
    const urlLines = this.wrap(this.report.url, CONTENT_W);
    this.ensure(urlLines.length * 7 + 28);
    for (const line of urlLines) {
      this.doc.text(line, MX, this.y);
      this.y += 6.4;
    }

    this.font("normal", 9);
    this.ink(MUTED);
    const when = formatReportDate(this.report.completedAt || this.report.startedAt);
    const meta = [`Completed ${when}`, `Mode ${this.report.mode}`, this.report.plan === "pro" ? "Pro check" : "Free check"];
    if (this.options.scanId) meta.push(`Scan ${this.options.scanId}`);
    this.doc.text(meta.join("  ·  "), MX, this.y);
    this.y += 8;

    const verdict = VERDICT_LABEL[this.report.verdict];
    const accent = VERDICT_COLOR[this.report.verdict];
    const summaryLines = this.wrap(this.report.verdictSummary, CONTENT_W - 12).slice(0, 4);
    const cardH = 28 + summaryLines.length * 4.4;
    this.ensure(cardH + 4);
    this.fill(WASH);
    this.stroke(LINE);
    this.doc.setLineWidth(0.3);
    this.doc.roundedRect(MX, this.y, CONTENT_W, cardH, 3, 3, "FD");
    this.fill(accent);
    this.doc.rect(MX, this.y, 2.2, cardH, "F");

    let cy = this.y + 7;
    this.font("bold", 8);
    this.ink(accent);
    this.doc.text(verdict, MX + 8, cy);
    cy += 7;
    this.font("bold", 16);
    this.ink(INK);
    this.doc.text(`${holes.length} ${holeLabel}`, MX + 8, cy);
    cy += 6.2;
    this.font("normal", 9);
    this.ink(MUTED);
    for (const line of summaryLines) {
      this.doc.text(line, MX + 8, cy);
      cy += 4.4;
    }
    this.y += cardH + 5;

    const stats: [string, string, RGB][] = [
      ["Fix first", String(holes.filter((f) => f.disposition === "FIX_BEFORE_SELLING").length), RED],
      ["Test first", String(holes.filter((f) => f.disposition === "TEST_BEFORE_BUILDING").length), ORANGE],
      ["Not blocking", String(holes.filter((f) => f.disposition === "NOT_BLOCKING_A_SALE").length), AMBER_INK],
      ["Could not verify", String(this.unverified().length), MUTED],
      ["Passes", String(this.passes().length), GREEN_DARK],
    ];
    const gap = 3;
    const cellW = (CONTENT_W - gap * 4) / 5;
    const cellH = 16;
    this.ensure(cellH + 8);
    stats.forEach(([label, value, color], i) => {
      const x = MX + i * (cellW + gap);
      this.fill(WHITE);
      this.stroke(LINE);
      this.doc.roundedRect(x, this.y, cellW, cellH, 2, 2, "FD");
      this.font("bold", 12);
      this.ink(color);
      this.doc.text(value, x + 3.2, this.y + 7.2);
      this.font("normal", 6.5);
      this.ink(MUTED);
      this.doc.text(label, x + 3.2, this.y + 12.4);
    });
    this.y += cellH + 10;
  }

  private drawHoles() {
    const holes = this.holes();
    this.ensure(12);
    this.font("bold", 12);
    this.ink(INK);
    this.doc.text("AppHoles", MX, this.y);
    this.y += 4;
    if (holes.length === 0) {
      this.font("normal", 9);
      this.ink(MUTED);
      this.doc.text("No AppHoles in this public check.", MX, this.y + 4);
      this.y += 12;
      return;
    }
    holes.forEach((finding, index) => this.drawHoleCard(finding, index + 1));
  }

  private evidenceLine(finding: Finding): string {
    const first = finding.evidence[0];
    if (!first) return "";
    return `${first.label}: ${first.value}`;
  }

  private drawHoleCard(finding: Finding, n: number) {
    const innerX = MX + 14;
    const innerW = CONTENT_W - 18;
    const titleLines = this.wrap(finding.title, innerW).slice(0, 3);
    const observedLines = this.wrap(finding.observed, innerW).slice(0, 4);
    const evidence = this.evidenceLine(finding);
    const evidenceLines = evidence ? this.wrap(evidence, innerW - 4).slice(0, 2) : [];
    const urlLines = finding.url ? this.wrap(finding.url, innerW).slice(0, 2) : [];
    const badge = DISPOSITION_LABEL[finding.disposition];
    this.font("bold", 7);
    const badgeW = Math.min(this.doc.getTextWidth(badge) + 5, innerW);
    const h =
      6 +
      titleLines.length * 5.2 +
      8 +
      observedLines.length * 4.2 +
      (evidenceLines.length ? 3 + evidenceLines.length * 3.8 + 3 : 0) +
      (urlLines.length ? urlLines.length * 3.8 + 2 : 0) +
      5;
    this.ensure(h);
    const top = this.y;
    this.fill(WHITE);
    this.stroke(LINE);
    this.doc.setLineWidth(0.35);
    this.doc.roundedRect(MX, top, CONTENT_W, h, 2.5, 2.5, "FD");
    this.fill(DISPOSITION_STYLE[finding.disposition].bg);
    this.doc.roundedRect(MX + 3.2, top + 4.2, 9, 9, 2, 2, "F");
    this.font("bold", 8);
    this.ink(WHITE);
    if (finding.disposition === "NOT_BLOCKING_A_SALE" || finding.disposition === "TEST_BEFORE_BUILDING") {
      this.ink(INK);
    }
    if (finding.disposition === "PASS" || finding.disposition === "COULDNT_VERIFY") {
      this.ink(DISPOSITION_STYLE[finding.disposition].fg);
    }
    this.doc.text(String(n).padStart(2, "0"), MX + 7.7, top + 10.1, { align: "center" });

    let cy = top + 8;
    this.font("bold", 11);
    this.ink(INK);
    for (const line of titleLines) {
      this.doc.text(line, innerX, cy);
      cy += 5.2;
    }
    cy += 1.2;
    const style = DISPOSITION_STYLE[finding.disposition];
    this.fill(style.bg);
    this.doc.roundedRect(innerX, cy - 3.6, badgeW, 5.6, 1.4, 1.4, "F");
    this.font("bold", 7);
    this.ink(style.fg);
    this.doc.text(badge, innerX + 2.4, cy);
    cy += 7.2;
    this.font("normal", 9);
    this.ink(MUTED);
    for (const line of observedLines) {
      this.doc.text(line, innerX, cy);
      cy += 4.2;
    }
    if (evidenceLines.length) {
      cy += 1;
      this.fill(WASH);
      const evH = evidenceLines.length * 3.8 + 4;
      this.doc.roundedRect(innerX, cy - 3, innerW, evH, 1.2, 1.2, "F");
      this.font("normal", 8);
      this.ink(INK);
      for (const line of evidenceLines) {
        this.doc.text(line, innerX + 2, cy + 1.2);
        cy += 3.8;
      }
      cy += 3;
    }
    if (urlLines.length) {
      this.font("normal", 8);
      this.ink(BLUE);
      for (const line of urlLines) {
        this.doc.text(line, innerX, cy);
        cy += 3.8;
      }
    }
    this.y = top + h + 3.2;
  }

  private drawQuietSection(title: string, blurb: string, findings: Finding[]) {
    if (findings.length === 0) return;
    this.ensure(16);
    this.y += 3;
    this.font("bold", 11);
    this.ink(MUTED);
    this.doc.text(title, MX, this.y);
    this.y += 5;
    this.font("normal", 8);
    this.doc.text(pdfSafe(blurb), MX, this.y);
    this.y += 4;
    for (const finding of findings) {
      const innerW = CONTENT_W - 6;
      const titleLines = this.wrap(finding.title, innerW).slice(0, 2);
      const obs = this.wrap(finding.observed, innerW).slice(0, 2);
      const h = 6 + titleLines.length * 4.4 + obs.length * 3.8 + 6;
      this.ensure(h);
      this.stroke(LINE);
      this.doc.setLineWidth(0.25);
      this.fill(WASH);
      this.doc.roundedRect(MX, this.y, CONTENT_W, h, 2, 2, "FD");
      let cy = this.y + 5.5;
      this.font("bold", 9);
      this.ink(INK);
      for (const line of titleLines) {
        this.doc.text(line, MX + 4, cy);
        cy += 4.4;
      }
      this.font("bold", 7);
      this.ink(MUTED);
      this.doc.text(DISPOSITION_LABEL[finding.disposition], MX + 4, cy);
      cy += 4;
      this.font("normal", 8);
      this.ink(MUTED);
      for (const line of obs) {
        this.doc.text(line, MX + 4, cy);
        cy += 3.8;
      }
      this.y += h + 2.4;
    }
  }

  private drawCoverage() {
    this.ensure(28);
    this.y += 4;
    this.font("bold", 11);
    this.ink(INK);
    this.doc.text("What this check covered", MX, this.y);
    this.y += 5;
    this.font("normal", 8);
    this.ink(MUTED);
    for (const item of this.report.checked) {
      const lines = this.wrap(`- ${item}`, CONTENT_W);
      this.ensure(lines.length * 4);
      for (const line of lines) {
        this.doc.text(line, MX, this.y);
        this.y += 4;
      }
    }
    if (this.report.couldNotVerify.length) {
      this.ensure(10);
      this.y += 3;
      this.font("bold", 11);
      this.ink(INK);
      this.doc.text("What it could not verify", MX, this.y);
      this.y += 5;
      this.font("normal", 8);
      this.ink(MUTED);
      for (const item of this.report.couldNotVerify) {
        const lines = this.wrap(`- ${item}`, CONTENT_W);
        this.ensure(lines.length * 4);
        for (const line of lines) {
          this.doc.text(line, MX, this.y);
          this.y += 4;
        }
      }
    }
  }

  private drawFooter(page: number, total: number) {
    this.stroke(LINE);
    this.doc.setLineWidth(0.3);
    this.doc.line(MX, FOOTER_Y - 4.2, PAGE_W - MX, FOOTER_Y - 4.2);
    this.font("normal", 7.5);
    this.ink(MUTED);
    this.doc.text("Don't expose your AppHole in public.", MX, FOOTER_Y);
    this.doc.text(`apphole.pro  ·  ${page} / ${total}`, PAGE_W - MX, FOOTER_Y, { align: "right" });
    this.fill(BLUE);
    this.doc.rect(0, PAGE_H - 2.2, PAGE_W, 2.2, "F");
  }
}
