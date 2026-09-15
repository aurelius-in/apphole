export type Disposition =
  | "FIX_BEFORE_SELLING"
  | "TEST_BEFORE_BUILDING"
  | "NOT_BLOCKING_A_SALE"
  | "COULDNT_VERIFY"
  | "PASS";

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export type Category =
  | "core_functionality"
  | "signup_login"
  | "first_run"
  | "activation"
  | "mobile"
  | "browser"
  | "payment"
  | "purchase_moment"
  | "pricing"
  | "trust"
  | "support"
  | "privacy"
  | "terms"
  | "security"
  | "data_integrity"
  | "email"
  | "error_handling"
  | "navigation"
  | "copy"
  | "promise_consistency"
  | "plan_gating"
  | "cancellation"
  | "accessibility"
  | "performance"
  | "production_hygiene";

export type Evidence = {
  type: "http" | "html" | "header" | "link" | "screenshot" | "console_error" | "note";
  label: string;
  value: string;
  url?: string;
};

export type Finding = {
  id: string;
  category: Category;
  title: string;
  observed: string;
  expected: string;
  disposition: Disposition;
  severity: Severity;
  confidence: number;
  url?: string;
  viewport?: string;
  browser: string;
  evidence: Evidence[];
  whyItMatters: string;
  recommendedPlug: string;
  retest: string;
};

export type PageSnapshot = {
  url: string;
  finalUrl: string;
  status: number;
  ok: boolean;
  title: string;
  metaDescription: string;
  elapsedMs: number;
  headers: Record<string, string>;
  contentType: string;
  bytes: number;
  error?: string;
};

export type ScanProgress = {
  percent: number;
  step: string;
  message: string;
};

export type ReadinessVerdict =
  | "READY_TO_FACE_CUSTOMERS"
  | "PLUG_THESE_FIRST"
  | "NOT_READY_FOR_CUSTOMERS"
  | "INCOMPLETE_CHECK";

export type ScanReport = {
  url: string;
  startedAt: string;
  completedAt: string;
  plan: "free" | "pro";
  mode: "http" | "http+playwright";
  pagesCrawled: PageSnapshot[];
  findings: Finding[];
  verdict: ReadinessVerdict;
  verdictSummary: string;
  holeCount: number;
  blockerCount: number;
  testBeforeCount: number;
  notBlockingCount: number;
  unverifiedCount: number;
  passCount: number;
  checked: string[];
  couldNotVerify: string[];
};

export type ScanRecord = {
  id: string;
  url: string;
  authorized: boolean;
  status: "queued" | "running" | "complete" | "failed";
  plan: "free" | "pro";
  userId?: string;
  anonymousId: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  progress: ScanProgress;
  report?: ScanReport;
  error?: string;
  parentScanId?: string;
};

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
  plan: "free" | "pro";
  planStatus: "inactive" | "active" | "past_due" | "canceled";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
};

export const DISPOSITION_LABEL: Record<Disposition, string> = {
  FIX_BEFORE_SELLING: "FIX BEFORE SELLING",
  TEST_BEFORE_BUILDING: "TEST BEFORE BUILDING",
  NOT_BLOCKING_A_SALE: "NOT BLOCKING A SALE",
  COULDNT_VERIFY: "COULDN'T VERIFY",
  PASS: "PASS",
};

export const VERDICT_LABEL: Record<ReadinessVerdict, string> = {
  READY_TO_FACE_CUSTOMERS: "READY TO FACE CUSTOMERS",
  PLUG_THESE_FIRST: "PLUG THESE FIRST",
  NOT_READY_FOR_CUSTOMERS: "NOT READY FOR CUSTOMERS",
  INCOMPLETE_CHECK: "INCOMPLETE CHECK",
};
