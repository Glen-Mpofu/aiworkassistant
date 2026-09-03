import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Copy, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { summarizeNotes } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";

const STYLES = [
  { id: "meeting", label: "Meeting notes", hint: "Decisions + action items" },
  { id: "study", label: "Study notes", hint: "Concepts + self-test" },
  { id: "executive", label: "Executive brief", hint: "BLUF + next steps" },
] as const;

type StyleId = (typeof STYLES)[number]["id"];

export function SummarizerPanel() {
  const [text, setText] = useState("");
  const [style, setStyle] = useState<StyleId>("meeting");
  const summarize = useServerFn(summarizeNotes);

  const mutation = useMutation({
    mutationFn: (input: { text: string; style: StyleId }) => summarize({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "Couldn't summarize those notes. Please try again."),
  });

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          {STYLES.map((s) => (
            <Button
              key={s.id}
              size="sm"
              variant={style === s.id ? "default" : "secondary"}
              onClick={() => setStyle(s.id)}
              title={s.hint}
            >
              {s.label}
            </Button>
          ))}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your notes here — meeting transcripts, lecture notes, interview write-ups, reading highlights…"
          className="mt-4 min-h-[320px] resize-y bg-input/40 text-sm leading-relaxed"
        />

        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">{words} words</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setText("")}
              disabled={!text || mutation.isPending}
            >
              <Trash2 className="size-4" /> Clear
            </Button>
            <Button
              onClick={() => mutation.mutate({ text, style })}
              disabled={text.trim().length < 20 || mutation.isPending}
              className="glow"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Sparkles className="size-4" />
              )}
              Summarize
            </Button>
          </div>
        </div>
      </section>

      <section className="panel flex min-h-[420px] flex-col p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Summary</h2>
          {mutation.data?.summary && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mutation.data.summary);
                toast.success("Summary copied");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
          )}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {mutation.isPending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Reading and condensing your notes…
            </p>
          )}
          {!mutation.isPending && !mutation.data && (
            <p className="text-sm text-muted-foreground">
              Your structured summary will appear here — TL;DR, key points, decisions and follow-ups.
            </p>
          )}
          {mutation.data?.summary && <Markdown>{mutation.data.summary}</Markdown>}
        </div>
      </section>
    </div>
  );
}
