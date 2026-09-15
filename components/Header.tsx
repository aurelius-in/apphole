"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/#product", label: "Product" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/pricing", label: "Free vs Pro" },
  { href: "/#faq", label: "FAQ" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const interior = pathname.startsWith("/dashboard") || pathname.startsWith("/scan");

  return (
    <header className="sticky top-0 z-40 border-b border-ah-line/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
          <Image src="/ah-logo.png" alt="" className="h-10 w-10 shrink-0 object-contain" width={40} height={40} />
          <Image
            src="/ah-title.png"
            alt="AppHole"
            className="h-8 w-auto max-w-[160px] object-contain object-left sm:max-w-[220px]"
            width={220}
            height={48}
          />
        </Link>
        {!interior && (
          <nav className="hidden items-center gap-6 text-sm font-medium text-ah-muted md:flex" aria-label="Primary">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-ah-ink">
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-2">
          {!interior && (
            <Link
              href="/check"
              className="hidden rounded-full bg-ah-blue px-4 py-2 text-sm font-semibold text-white shadow-brand hover:bg-ah-blue-dark sm:inline-flex"
            >
              Check my AppHole
            </Link>
          )}
          <Link href="/dashboard" className="text-sm font-medium text-ah-muted hover:text-ah-ink">
            Dashboard
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ah-line md:hidden"
            aria-expanded={open}
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Menu</span>
            <span className="block h-0.5 w-4 bg-ah-ink" />
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-ah-line bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3 text-sm font-medium" aria-label="Mobile">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link href="/check" className="font-semibold text-ah-blue" onClick={() => setOpen(false)}>
              Check my AppHole
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
