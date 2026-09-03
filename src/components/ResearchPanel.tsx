import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { Compass, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { runResearch } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/Markdown";

const EXAMPLES = [
  "Impact of hybrid work on team cohesion",
  "Mixed-methods designs for small-N studies",
  "Retrieval-augmented generation in clinical settings",
];

export function ResearchPanel() {
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"overview" | "deep">("overview");
  const research = useServerFn(runResearch);

  const mutation = useMutation({
    mutationFn: (input: { topic: string; depth: "overview" | "deep" }) =>
      research({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "Research request failed. Please try again."),
  });

  const submit = (value = topic) => {
    if (value.trim().length < 3) return;
    setTopic(value);
    mutation.mutate({ topic: value, depth });
  };

  return (
    <div className="space-y-5">
      <section className="panel p-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What do you want to research?"
            className="h-11 bg-input/40"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant={depth === "overview" ? "default" : "secondary"}
              onClick={() => setDepth("overview")}
              className="h-11"
            >
              Overview
            </Button>
            <Button
              type="button"
              variant={depth === "deep" ? "default" : "secondary"}
              onClick={() => setDepth("deep")}
              className="h-11"
            >
              Deep dive
            </Button>
            <Button
              type="submit"
              disabled={topic.trim().length < 3 || mutation.isPending}
              className="glow h-11"
            >
              {mutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Compass className="size-4" />
              )}
              Research
            </Button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => submit(e)}
              className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
            >
              {e}
            </button>
          ))}
        </div>
      </section>

      <section className="panel min-h-[320px] p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Research brief</h2>
          {mutation.data?.report && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mutation.data.report);
                toast.success("Brief copied");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
          )}
        </div>
        <div className="mt-4">
          {mutation.isPending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Gathering perspectives and structuring the
              brief…
            </p>
          )}
          {!mutation.isPending && !mutation.data && (
            <p className="text-sm text-muted-foreground">
              Ask a question and get a structured brief: background, current knowledge, debates,
              gaps and where to look next. Always verify suggested sources.
            </p>
          )}
          {mutation.data?.report && <Markdown>{mutation.data.report}</Markdown>}
        </div>
      </section>
    </div>
  );
}
