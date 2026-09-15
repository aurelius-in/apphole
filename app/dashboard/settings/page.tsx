import { DashboardNav } from "@/components/DashboardNav";
import { getSessionUserId } from "@/lib/auth";
import { getUserById } from "@/lib/store";

export const metadata = { title: "Settings | AppHole" };

export default async function SettingsPage() {
  const userId = await getSessionUserId();
  const user = userId ? await getUserById(userId) : null;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[220px_1fr]">
      <DashboardNav />
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div>
            <dt className="text-ah-muted">Email</dt>
            <dd className="font-medium">{user?.email || "Not signed in"}</dd>
          </div>
          <div>
            <dt className="text-ah-muted">Retention</dt>
            <dd>Reports are stored so you can reopen them. Email hello@apphole.pro to delete stored scans.</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
