import { ScanProgress } from "@/components/ScanProgress";

export default async function ScanPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <ScanProgress id={id} />
    </div>
  );
}
