"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { GO_PRO_PATH } from "@/lib/pricing";
import { track } from "@/lib/analytics";

export function GoProLink({
  children = "Go Pro",
  className,
  onNavigate,
}: {
  children?: ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={GO_PRO_PATH}
      className={className}
      onClick={() => {
        track("ah_pro_click");
        track("ah_checkout_started");
        onNavigate?.();
      }}
    >
      {children}
    </Link>
  );
}
