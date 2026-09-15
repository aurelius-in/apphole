import { nanoid } from "nanoid";
import type { Category, Disposition, Evidence, Finding, Severity } from "@/lib/scans/types";

export function finding(input: {
  category: Category;
  title: string;
  observed: string;
  expected: string;
  disposition: Disposition;
  severity: Severity;
  confidence: number;
  url?: string;
  viewport?: string;
  evidence?: Evidence[];
  whyItMatters: string;
  recommendedPlug: string;
  retest?: string;
}): Finding {
  return {
    id: `finding_${nanoid(10)}`,
    browser: "http-crawler",
    evidence: input.evidence ?? [],
    retest: input.retest ?? "Re-run this AppHole Check after the change and compare this finding.",
    viewport: input.viewport,
    ...input,
  };
}
