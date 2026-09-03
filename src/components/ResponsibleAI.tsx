import { AlertTriangle, ShieldCheck, ScanEye, UserCheck } from "lucide-react";

const ITEMS = [
  {
    icon: AlertTriangle,
    title: "Limitations",
    body: "The models generate fluent text, not verified truth. Research briefs may contain outdated or contested claims, and the assistant is instructed never to fabricate citations, DOIs or URLs — anything uncertain is marked 'verify'.",
  },
  {
    icon: ScanEye,
    title: "Bias & fairness",
    body: "Training data carries cultural and linguistic bias. Prompts avoid demographic inference, and drafts about people (candidates, colleagues) use neutral language with [placeholders] rather than assumed details.",
  },
  {
    icon: UserCheck,
    title: "Human in the loop",
    body: "Every email draft ships with a 'Before sending' checklist, and every plan states its assumptions. Nothing is sent, scheduled or published automatically — a person reviews and approves each output.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy",
    body: "Notes are processed for the length of a single request through the Lovable AI gateway and are not stored in a database by this app. Avoid pasting confidential client data, ID numbers or credentials.",
  },
];

export function ResponsibleAI() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {ITEMS.map(({ icon: Icon, title, body }) => (
        <section key={title} className="panel p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Icon className="size-4 text-primary" />
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
        </section>
      ))}
      <section className="panel p-5 sm:col-span-2">
        <h2 className="text-base font-semibold">Validation steps we recommend</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          <li>Cross-check every factual claim and figure against the source material.</li>
          <li>Confirm names, dates and commitments before an email leaves your outbox.</li>
          <li>Re-run with a sharper prompt when the output is vague — compare the two versions.</li>
          <li>Never use output as legal, medical, financial or HR decision-making advice.</li>
        </ol>
      </section>
    </div>
  );
}
