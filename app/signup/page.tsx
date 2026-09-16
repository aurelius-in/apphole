import { Suspense } from "react";
import { AuthForm } from "@/components/AuthForm";

export const metadata = { title: "Sign up | AppHole" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-14">
      <Suspense fallback={<p className="text-sm text-ah-muted">Loading…</p>}>
        <AuthForm mode="signup" />
      </Suspense>
    </div>
  );
}
