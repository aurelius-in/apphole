import { Suspense } from "react";
import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up | AppHole" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-3xl font-bold">Sign up</h1>
      <p className="mt-2 text-sm text-ah-muted">Optional. You can run a Free check without an account.</p>
      <div className="mt-8 rounded-3xl border border-ah-line bg-white p-6 shadow-card">
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </div>
      <p className="mt-4 text-sm">
        Already have an account? <Link href="/login" className="font-semibold text-ah-blue">Log in</Link>
      </p>
    </div>
  );
}
