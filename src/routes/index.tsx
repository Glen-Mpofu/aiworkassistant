import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  BookOpenCheck,
  CalendarClock,
  Compass,
  GraduationCap,
  Mail,
  MessagesSquare,
  ShieldCheck,
} from "lucide-react";
import { SummarizerPanel } from "@/components/SummarizerPanel";
import { ResearchPanel } from "@/components/ResearchPanel";
import { ChatPanel } from "@/components/ChatPanel";
import { EmailPanel } from "@/components/EmailPanel";
import { PlannerPanel } from "@/components/PlannerPanel";
import { ResponsibleAI } from "@/components/ResponsibleAI";

const TITLE = "Scholia — AI Workplace Productivity Assistant";
const DESCRIPTION =
  "Summarize meeting notes, draft professional emails, plan your week, run research briefs and chat with an AI assistant built for graduates, researchers and workplace professionals.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const TABS = [
  { id: "summarize", label: "Notes summarizer", icon: BookOpenCheck },
  { id: "email", label: "Email generator", icon: Mail },
  { id: "planner", label: "Task planner", icon: CalendarClock },
  { id: "research", label: "Research assistant", icon: Compass },
  { id: "chat", label: "AI chat", icon: MessagesSquare },
  { id: "responsible", label: "Responsible AI", icon: ShieldCheck },
] as const;

type TabId = (typeof TABS)[number]["id"];

function Index() {
  const [tab, setTab] = useState<TabId>("summarize");

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <header className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
          <GraduationCap className="size-3.5 text-primary" />
          For graduates, researchers and workplace professionals
        </span>
        <h1 className="mt-5 text-4xl font-semibold sm:text-5xl">
          Your AI-powered <span className="text-primary">workplace assistant</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Five tools that remove the repetitive work: summarize notes, draft emails, plan your
          workload, research any topic, and think out loud with an AI assistant.
        </p>
      </header>

      <nav className="mt-9 flex flex-wrap justify-center gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
              tab === id
                ? "border-primary/60 bg-primary/15 text-foreground"
                : "border-border bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "summarize" && <SummarizerPanel />}
        {tab === "email" && <EmailPanel />}
        {tab === "planner" && <PlannerPanel />}
        {tab === "research" && <ResearchPanel />}
        {tab === "chat" && <ChatPanel />}
        {tab === "responsible" && <ResponsibleAI />}
      </div>

      <footer className="mt-12 space-y-2 text-center text-xs text-muted-foreground">
        <p>
          AI output can be imperfect — verify facts, figures and sources before sending, citing or
          acting on them.
        </p>
        <button onClick={() => setTab("responsible")} className="underline hover:text-foreground">
          Read how this assistant uses AI responsibly
        </button>
      </footer>
    </main>
  );
}
