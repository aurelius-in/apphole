"use client";

import { usePathname } from "next/navigation";

export function SiteFrame({
  header,
  footer,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (pathname.startsWith("/ops")) return <>{children}</>;
  return (
    <>
      {header}
      {children}
      {footer}
    </>
  );
}
