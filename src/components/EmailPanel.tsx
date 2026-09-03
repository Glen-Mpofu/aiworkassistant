import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";

const TONES = ["formal", "informal", "persuasive"] as const;
const AUDIENCES = ["client", "manager", "team", "candidate"] as const;

type Tone = (typeof TONES)[number];
type Audience = (typeof AUDIENCES)[number];

export function EmailPanel() {
  const [intent, setIntent] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [audience, setAudience] = useState<Audience>("client");
  const run = useServerFn(generateEmail);

  const mutation = useMutation({
    mutationFn: (input: { intent: string; tone: Tone; audience: Audience }) =>
      run({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "Couldn't draft that email. Please try again."),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="panel p-5">
        <h2 className="text-base font-semibold">What should the email do?</h2>
        <Textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="e.g. Tell the client the analytics dashboard slips to 12 March, apologise, and propose a Thursday call to re-scope."
          className="mt-4 min-h-[180px] resize-y bg-input/40 text-sm leading-relaxed"
        />

        <p className="mt-5 text-xs uppercase tracking-wide text-muted-foreground">Tone</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TONES.map((t) => (
            <Button
              key={t}
              size="sm"
              variant={tone === t ? "default" : "secondary"}
              onClick={() => setTone(t)}
              className="capitalize"
            >
              {t}
            </Button>
          ))}
        </div>

        <p className="mt-5 text-xs uppercase tracking-wide text-muted-foreground">Audience</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {AUDIENCES.map((a) => (
            <Button
              key={a}
              size="sm"
              variant={audience === a ? "default" : "secondary"}
              onClick={() => setAudience(a)}
              className="capitalize"
            >
              {a}
            </Button>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <Button
            onClick={() => mutation.mutate({ intent, tone, audience })}
            disabled={intent.trim().length < 5 || mutation.isPending}
            className="glow"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mail className="size-4" />
            )}
            Draft email
          </Button>
        </div>
      </section>

      <section className="panel flex min-h-[420px] flex-col p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Draft</h2>
          {mutation.data?.email && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mutation.data.email);
                toast.success("Draft copied");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
          )}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {mutation.isPending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Writing your draft…
            </p>
          )}
          {mutation.data?.email && <Markdown>{mutation.data.email}</Markdown>}
          {!mutation.isPending && !mutation.data && (
            <p className="text-sm text-muted-foreground">
              Describe the situation and the assistant drafts a send-ready email with a subject line
              and a verification checklist. Placeholders like [name] mean the AI refused to guess.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
