export const metadata = { title: "Contact | AppHole" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-14">
      <h1 className="text-4xl font-bold">Contact</h1>
      <p className="mt-4 text-ah-muted">
        Product questions, authorized-scan issues, and deletion requests:{" "}
        <a className="font-semibold text-ah-blue" href="mailto:hello@apphole.pro">
          hello@apphole.pro
        </a>
      </p>
      <p className="mt-4 text-ah-muted">
        Want a hole plugged? Open a report and use{" "}
        <a className="font-semibold text-ah-blue" href="/example#plug-quote">
          Get a plug quote
        </a>
        . That is a human quote request, not a Stripe charge.
      </p>
      <p className="mt-4 text-sm text-ah-muted">
        Reports:{" "}
        <a className="font-semibold text-ah-blue" href="mailto:reports@apphole.pro">
          reports@apphole.pro
        </a>
        . Mailboxes go live after DNS and email hosting are connected.
      </p>
    </div>
  );
}
