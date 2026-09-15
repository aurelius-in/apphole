import { ReportView } from "@/components/ReportView";
import { exampleReport } from "@/lib/scans/example";

export const metadata = { title: "Example AppHole Report | AppHole" };

export default function ExamplePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-bold">Example AppHole Report</h1>
      <p className="mt-3 max-w-2xl text-ah-muted">
        Illustrated output so you can see the judgment style. It is labeled as an example and is not from a live customer app.
      </p>
      <div className="mt-8">
        <ReportView report={exampleReport} example />
      </div>
    </div>
  );
}
