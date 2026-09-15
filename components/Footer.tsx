import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-ah-line bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Image src="/ah-title.png" alt="AppHole" className="h-9 w-auto object-contain object-left" width={200} height={40} />
          <p className="mt-4 text-sm font-semibold text-ah-ink">{brand.footerLine}</p>
          <p className="mt-1 text-sm text-ah-muted">{brand.footerSecondary}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="/#product">Product</Link>
            <Link href="/#how-it-works">How it works</Link>
            <Link href="/pricing">Free vs Pro</Link>
            <Link href="/#faq">FAQ</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/example">Example report</Link>
            <Link href="/methodology">Methodology</Link>
            <Link href="/check">Check my AppHole</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-ah-line py-4 text-center text-xs text-ah-muted">
        AppHole checks readiness, not demand. Not a penetration test.
      </div>
    </footer>
  );
}
