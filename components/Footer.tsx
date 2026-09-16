import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ah-ink text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Image
            src="/ah-title-on-black.png"
            alt="AppHole"
            className="h-9 w-auto object-contain object-left"
            width={200}
            height={40}
          />
          <p className="mt-4 text-sm font-semibold text-white">{brand.footerLine}</p>
          <p className="mt-1 text-sm text-white/70">{brand.footerSecondary}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm text-white/80 sm:grid-cols-3 [&_a]:hover:text-white">
          <div className="flex flex-col gap-2">
            <Link href="/#product">Product</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/pricing">Free vs Pro</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/example">Example report</Link>
            <Link href="/example#plug-quote">Get a plug quote</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/check">Check my AppHole</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
            <Link href="/go-pro">Go Pro</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        AppHole checks readiness, not demand. Not a penetration test.
      </div>
    </footer>
  );
}
