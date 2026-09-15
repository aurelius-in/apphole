import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { brand } from "@/lib/brand";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://apphole.pro"),
  title: brand.title,
  description: brand.description,
  applicationName: "AppHole",
  openGraph: {
    title: brand.title,
    description: brand.description,
    url: "/",
    siteName: "AppHole",
    type: "website",
    images: [{ url: "/og.jpg", alt: "AppHole wordmark" }],
  },
  twitter: {
    card: "summary_large_image",
    title: brand.title,
    description: brand.description,
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/ah-logo.png",
    apple: "/ah-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen font-sans">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
