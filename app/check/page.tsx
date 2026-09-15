import { CheckForm } from "@/components/CheckForm";

export const metadata = { title: "Check my AppHole | AppHole" };

export default function CheckPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ah-blue">AppHole Check</p>
      <h1 className="mt-3 text-4xl font-bold">Check my AppHole</h1>
      <p className="mt-3 text-ah-muted">
        Public pages only. You must own the app or be authorized to test it. AppHole will not try exploits, will not submit real payments, and will not change your data.
      </p>
      <div className="mt-8 rounded-3xl border border-ah-line bg-white p-6 shadow-card">
        <CheckForm />
      </div>
    </div>
  );
}
