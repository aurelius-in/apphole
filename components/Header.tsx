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
    <header className="sticky top-0 z-40 overflow-x-clip border-b border-ah-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 px-4 py-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-6">
        <Link href="/" className="z-10 col-start-1 row-start-1 justify-self-start" onClick={close} aria-label="AppHole home">
          <Image
            src="/ah-logo.png"
            alt=""
            className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16 lg:h-[120px] lg:w-[120px]"
            width={120}
            height={120}
            priority
          />
        </Link>
        <Link
          href="/"
          className="z-10 col-span-3 row-start-2 flex min-w-0 w-full max-w-full items-center justify-center px-1 pb-1 sm:px-3 lg:col-span-1 lg:col-start-2 lg:row-start-1 lg:w-auto lg:pb-0"
          onClick={close}
        >
          <span className="relative block h-7 w-[176px] max-w-full sm:h-8 sm:w-[220px] lg:h-8 lg:w-[240px]">
            <Image src="/ah-title.png" alt="AppHole" fill className="object-contain object-center" sizes="240px" priority />
          </span>
        </Link>
        <div className="col-start-3 row-start-1 hidden items-center justify-self-end gap-3 lg:flex">
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
        <div className="col-start-3 row-start-1 flex shrink-0 items-center justify-self-end gap-2 lg:hidden">
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
      {!onDashboard && (
        <nav
          className="mx-auto hidden max-w-6xl items-center justify-center gap-6 px-4 pb-2.5 text-sm font-medium text-ah-muted lg:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ah-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      )}
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
