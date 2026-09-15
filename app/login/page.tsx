import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Log in | AppHole" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-2 text-sm text-ah-muted">Save scans and manage AppHole Pro.</p>
      <div className="mt-8 rounded-3xl border border-ah-line bg-white p-6 shadow-card">
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
      <p className="mt-4 text-sm">
        No account? <Link href="/signup" className="font-semibold text-ah-blue">Sign up</Link>
      </p>
    </div>
  );
}
