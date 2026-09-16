import { isAppHole, type Finding, type ReadinessVerdict } from "@/lib/scans/types";

export function scoreVerdict(findings: Finding[]): {
  verdict: ReadinessVerdict;
  summary: string;
  holeCount: number;
  blockerCount: number;
  testBeforeCount: number;
  notBlockingCount: number;
  unverifiedCount: number;
  passCount: number;
} {
  const blockerCount = findings.filter((f) => f.disposition === "FIX_BEFORE_SELLING").length;
  const testBeforeCount = findings.filter((f) => f.disposition === "TEST_BEFORE_BUILDING").length;
  const notBlockingCount = findings.filter((f) => f.disposition === "NOT_BLOCKING_A_SALE").length;
  const unverifiedCount = findings.filter((f) => f.disposition === "COULDNT_VERIFY").length;
  const passCount = findings.filter((f) => f.disposition === "PASS").length;
  const holeCount = findings.filter((f) => isAppHole(f.disposition)).length;

  const homepageDead = findings.some(
    (f) => f.disposition === "FIX_BEFORE_SELLING" && /homepage did not load/i.test(f.title),
  );
  const critical = findings.filter((f) => f.disposition === "FIX_BEFORE_SELLING" && (f.severity === "critical" || f.severity === "high"));

  let verdict: ReadinessVerdict;
  let summary: string;
  if (homepageDead) {
    verdict = "INCOMPLETE_CHECK";
    summary = "The public homepage did not load, so AppHole could not honestly finish the rest of the customer path.";
  } else if (critical.length >= 3 || findings.some((f) => f.severity === "critical" && f.disposition === "FIX_BEFORE_SELLING")) {
    verdict = "NOT_READY_FOR_CUSTOMERS";
    summary = `Plug ${blockerCount} AppHole${blockerCount === 1 ? "" : "s"} before putting this in front of buyers. Critical customer-path issues are still open.`;
  } else if (blockerCount > 0) {
    verdict = "PLUG_THESE_FIRST";
    summary = `Plug ${blockerCount} AppHole${blockerCount === 1 ? "" : "s"} before putting this in front of buyers. The rest can wait or be tested with a real conversation.`;
  } else {
    verdict = "READY_TO_FACE_CUSTOMERS";
    summary = "No known blocker in this public check justifies delaying a buyer conversation. That is not a demand forecast.";
  }

  return {
    verdict,
    summary,
    holeCount,
    blockerCount,
    testBeforeCount,
    notBlockingCount,
    unverifiedCount,
    passCount,
  };
}

export function sortFindings(findings: Finding[]): Finding[] {
  const rank: Record<string, number> = {
    FIX_BEFORE_SELLING: 0,
    TEST_BEFORE_BUILDING: 1,
    NOT_BLOCKING_A_SALE: 2,
    COULDNT_VERIFY: 3,
    PASS: 4,
  };
  return [...findings].sort((a, b) => rank[a.disposition] - rank[b.disposition]);
}
