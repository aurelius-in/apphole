"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/analytics";
import { trackActivity } from "@/lib/activity-client";
import { safeNextPath, wantsProCheckout, withNextQuery } from "@/lib/safe-next";
import { PRO_PRICE_LABEL } from "@/lib/pricing";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const fallback = mode === "signup" ? "/dashboard?welcome=1" : "/dashboard";
  const next = safeNextPath(params.get("next"), fallback);
  const toPro = wantsProCheckout(next);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [payAfterSignup, setPayAfterSignup] = useState(toPro);
  const [signupNoted, setSignupNoted] = useState(false);

  function noteSignupStart() {
    if (mode !== "signup" || signupNoted) return;
    setSignupNoted(true);
    trackActivity("signup_started");
  }

  const submitNext = mode === "signup" && payAfterSignup ? "/go-pro" : next;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    if (mode === "signup") trackActivity("signup_submitted");
    const res = await fetch(mode === "signup" ? "/api/auth/signup" : "/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    const data = (await res.json()) as { error?: string };
    setBusy(false);
    if (!res.ok) {
      if (mode === "signup") trackActivity("signup_failed");
      setError(data.error || "Could not continue.");
      return;
    }
    if (mode === "signup") trackActivity("signup_completed");
    if (mode === "signup") track("ah_free_signup");
    if (submitNext === "/go-pro") {
      track("ah_pro_click");
      track("ah_checkout_started");
    }
    router.push(submitNext);
    router.refresh();
  }

  const alreadyExists = Boolean(error && /already exists/i.test(error));

  return (
    <>
      <h1 className="text-3xl font-bold">{mode === "signup" ? (toPro ? "Create account, then subscribe" : "Create an account") : "Log in"}</h1>
      <p className="mt-2 text-sm text-ah-muted">
        {mode === "signup" && toPro
          ? `Make a login, then continue to Stripe Checkout for AppHole Pro (${PRO_PRICE_LABEL}).`
          : mode === "signup"
            ? "Email and password. Free checks still work without this. Go Pro after if you want history and retests."
            : toPro
              ? "Log in to continue to AppHole Pro checkout."
              : "Save scans and manage AppHole Pro."}
      </p>
      <div className="mt-8 rounded-3xl border border-ah-line bg-white p-6 shadow-card">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onFocus={noteSignupStart}
              onChange={(e) => {
                noteSignupStart();
                setEmail(e.target.value);
              }}
              className="w-full rounded-xl border border-ah-line px-4 py-3"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ah-line px-4 py-3"
            />
            {mode === "signup" && <p className="mt-1 text-xs text-ah-muted">At least 8 characters.</p>}
          </div>
          {mode === "signup" && !toPro && (
            <label className="flex items-start gap-3 text-sm text-ah-muted">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 accent-ah-green"
                checked={payAfterSignup}
                onChange={(e) => setPayAfterSignup(e.target.checked)}
              />
              <span>Continue to Go Pro checkout after this ({PRO_PRICE_LABEL}).</span>
            </label>
          )}
          {error && (
            <p className="text-sm text-ah-red" role="alert">
              {error}{" "}
              {alreadyExists && (
                <Link href={withNextQuery("/login", next)} className="font-semibold text-ah-blue">
                  Log in instead
                </Link>
              )}
            </p>
          )}
          <button type="submit" disabled={busy} className="w-full rounded-full bg-ah-blue py-3 font-semibold text-white disabled:opacity-60">
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? toPro || payAfterSignup
                  ? "Create account and Go Pro"
                  : "Create account"
                : toPro
                  ? "Log in and Go Pro"
                  : "Log in"}
          </button>
        </form>
      </div>
      <p className="mt-4 text-sm">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href={withNextQuery("/login", next)} className="font-semibold text-ah-blue">
              Log in
            </Link>
          </>
        ) : (
          <>
            No account?{" "}
            <Link href={withNextQuery("/signup", next)} className="font-semibold text-ah-blue">
              Sign up
            </Link>
          </>
        )}
      </p>
    </>
  );
}
