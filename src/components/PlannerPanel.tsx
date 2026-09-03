import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CalendarClock, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { planTasks } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/Markdown";

const HORIZONS = [
  { id: "day", label: "Daily plan" },
  { id: "week", label: "Weekly plan" },
] as const;

type Horizon = (typeof HORIZONS)[number]["id"];

export function PlannerPanel() {
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("day");
  const [hours, setHours] = useState(8);
  const run = useServerFn(planTasks);

  const mutation = useMutation({
    mutationFn: (input: { tasks: string; horizon: Horizon; hours: number }) =>
      run({ data: input }),
    onError: (error: Error) =>
      toast.error(error.message || "Couldn't build that plan. Please try again."),
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="panel p-5">
        <div className="flex flex-wrap items-center gap-2">
          {HORIZONS.map((h) => (
            <Button
              key={h.id}
              size="sm"
              variant={horizon === h.id ? "default" : "secondary"}
              onClick={() => setHorizon(h.id)}
            >
              {h.label}
            </Button>
          ))}
        </div>

        <Textarea
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
          placeholder={"One task per line, with any deadlines you know:\nFinish Q3 report — due Friday\nInterview two candidates\nReview PR backlog"}
          className="mt-4 min-h-[240px] resize-y bg-input/40 text-sm leading-relaxed"
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            Focus hours / day
            <input
              type="number"
              min={1}
              max={16}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value) || 1)}
              className="w-16 rounded-md border border-border bg-input/40 px-2 py-1 text-sm text-foreground"
            />
          </label>
          <Button
            onClick={() => mutation.mutate({ tasks, horizon, hours })}
            disabled={tasks.trim().length < 10 || mutation.isPending}
            className="glow"
          >
            {mutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <CalendarClock className="size-4" />
            )}
            Build plan
          </Button>
        </div>
      </section>

      <section className="panel flex min-h-[420px] flex-col p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Your plan</h2>
          {mutation.data?.plan && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(mutation.data.plan);
                toast.success("Plan copied");
              }}
            >
              <Copy className="size-4" /> Copy
            </Button>
          )}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {mutation.isPending && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Prioritising and time-boxing…
            </p>
          )}
          {mutation.data?.plan && <Markdown>{mutation.data.plan}</Markdown>}
          {!mutation.isPending && !mutation.data && (
            <p className="text-sm text-muted-foreground">
              Tasks are prioritised with the urgent/important matrix, time-boxed against your
              available hours, and returned with optimisation strategies and stated assumptions.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
