"use client";

import { track } from "@/lib/analytics";
import { PRO_PRICE_LABEL } from "@/lib/pricing";

const FULL_CLASS =
  "inline-flex w-full items-center justify-center rounded-full bg-ah-green px-6 py-4 text-lg font-bold text-ah-ink shadow-sm hover:bg-ah-green-dark hover:text-white disabled:opacity-60";
const COMPACT_CLASS =
  "inline-flex rounded-full bg-ah-green px-4 py-2 text-sm font-semibold text-ah-ink hover:bg-ah-green-dark hover:text-white disabled:opacity-60";

export function PayProButton({
  label = `Pay ${PRO_PRICE_LABEL}`,
  compact = false,
  className,
  initialError,
}: {
  label?: string;
  compact?: boolean;
  className?: string;
  initialError?: string;
}) {
  return (
    <form
      action="/api/stripe/checkout"
      method="get"
      className={compact ? "inline-flex" : "flex w-full flex-col"}
      onSubmit={() => {
        track("ah_pro_click");
        track("ah_checkout_started");
      }}
    >
      <button type="submit" className={className || (compact ? COMPACT_CLASS : FULL_CLASS)}>
        {label}
      </button>
      {initialError && !compact && (
        <p className="mt-3 text-sm font-medium text-ah-red" role="alert">
          {initialError}
        </p>
      )}
    </form>
  );
}
