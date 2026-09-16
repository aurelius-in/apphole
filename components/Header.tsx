"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { GoProLink } from "@/components/GoProLink";
import { PayProButton } from "@/components/PayProButton";
import { CTA_GO_PRO, CTA_UPGRADE } from "@/lib/pricing";

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Free vs Pro" },
  { href: "/#faq", label: "FAQ" },
];

type MeResponse = {
  user: { id: string; email: string; plan: string } | null;
  plan: string;
};

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const onDashboard = pathname.startsWith("/dashboard");
  const loggedIn = Boolean(me?.user);
  const isPro = me?.plan === "pro";

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: MeResponse) => {
        if (!cancelled) setMe(data);
      })
      .catch(() => {
        if (!cancelled) setMe({ user: null, plan: "free" });
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  function close() {
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ah-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={close}>
          <Image src="/ah-logo.png" alt="" className="h-10 w-10 shrink-0 object-contain" width={40} height={40} />
          <Image
            src="/ah-title.png"
            alt="AppHole"
            className="h-8 w-auto max-w-[140px] object-contain object-left sm:max-w-[220px]"
            width={220}
            height={48}
          />
        </Link>
        {!onDashboard && (
          <nav className="hidden items-center gap-6 text-sm font-medium text-ah-muted lg:flex" aria-label="Primary">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ah-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="hidden items-center gap-3 lg:flex">
          {loggedIn ? (
            <Link href="/dashboard" className="text-sm font-medium text-ah-muted hover:text-ah-ink">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-ah-muted hover:text-ah-ink">
                Log in
              </Link>
              <Link href="/signup" className="text-sm font-medium text-ah-muted hover:text-ah-ink">
                Sign up
              </Link>
            </>
          )}
          {!isPro &&
            (loggedIn ? (
              <PayProButton
                compact
                label={CTA_UPGRADE}
                className="inline-flex rounded-full bg-ah-green px-4 py-2 text-sm font-semibold text-ah-ink hover:bg-ah-green-dark hover:text-white disabled:opacity-60"
              />
            ) : (
              <GoProLink className="inline-flex rounded-full bg-ah-green px-4 py-2 text-sm font-semibold text-ah-ink hover:bg-ah-green-dark hover:text-white">
                {CTA_GO_PRO}
              </GoProLink>
            ))}
          {!onDashboard && (
            <Link
              href="/check"
              className="inline-flex rounded-full bg-ah-blue px-4 py-2 text-sm font-semibold text-white shadow-brand hover:bg-ah-blue-dark"
            >
              Check my AppHole
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          {!isPro &&
            (loggedIn ? (
              <PayProButton
                compact
                label={CTA_UPGRADE}
                className="inline-flex rounded-full bg-ah-green px-3 py-2 text-sm font-semibold text-ah-ink disabled:opacity-60"
              />
            ) : (
              <GoProLink className="inline-flex rounded-full bg-ah-green px-3 py-2 text-sm font-semibold text-ah-ink">
                {CTA_GO_PRO}
              </GoProLink>
            ))}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ah-line"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="block h-0.5 w-4 bg-ah-ink" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-ah-line bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium" aria-label="Mobile">
            {!onDashboard &&
              links.map((link) => (
                <Link key={link.href} href={link.href} onClick={close}>
                  {link.label}
                </Link>
              ))}
            <Link href="/check" className="font-semibold text-ah-blue" onClick={close}>
              Check my AppHole
            </Link>
            {!isPro &&
              (loggedIn ? (
                <PayProButton compact label={CTA_UPGRADE} className="font-semibold text-ah-green-dark" />
              ) : (
                <GoProLink className="font-semibold text-ah-green-dark" onNavigate={close}>
                  {CTA_GO_PRO}
                </GoProLink>
              ))}
            {loggedIn ? (
              <Link href="/dashboard" onClick={close}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={close}>
                  Log in
                </Link>
                <Link href="/signup" onClick={close}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
