"use client";

import { useEffect, useState, type ReactNode } from "react";
import { GoProLink } from "@/components/GoProLink";
import { PayProButton } from "@/components/PayProButton";
import { CTA_GO_PRO, CTA_SUBSCRIBE } from "@/lib/pricing";

type MeResponse = {
  user: { id: string } | null;
  plan: string;
};

export function GoProOrPay({
  className,
  children = CTA_GO_PRO,
  onNavigate,
  payLabel = CTA_SUBSCRIBE,
}: {
  className?: string;
  children?: ReactNode;
  onNavigate?: () => void;
  payLabel?: string;
}) {
  const [loggedInFree, setLoggedInFree] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: MeResponse) => {
        if (!cancelled) setLoggedInFree(Boolean(data.user) && data.plan !== "pro");
      })
      .catch(() => {
        if (!cancelled) setLoggedInFree(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loggedInFree) {
    return <PayProButton label={payLabel} compact className={className} />;
  }

  return (
    <GoProLink className={className} onNavigate={onNavigate}>
      {children}
    </GoProLink>
  );
}
