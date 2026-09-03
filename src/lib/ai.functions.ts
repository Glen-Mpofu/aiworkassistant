import { createServerFn } from "@tanstack/react-start";
import { streamText } from "ai";
import { z } from "zod";

const SummarizeInput = z.object({
  text: z.string().min(20),
  style: z.enum(["meeting", "study", "executive"]).default("meeting"),
});

const ResearchInput = z.object({
  topic: z.string().min(3),
  depth: z.enum(["overview", "deep"]).default("overview"),
});

const styleBrief: Record<string, string> = {
  meeting:
    "These are meeting notes. Produce: a 3-sentence TL;DR, Key Decisions, Discussion Highlights, Action Items (owner + deadline when stated), and Open Questions.",
  study:
    "These are study/lecture/reading notes. Produce: a TL;DR, Core Concepts (term + plain-language definition), Key Arguments & Evidence, Connections to wider theory, and 5 self-test questions.",
  executive:
    "Produce an executive brief: Bottom Line Up Front, Context, Findings, Risks, and Recommended Next Steps. Keep it tight and decision-oriented.",
};

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SummarizeInput.parse(input))
  .handler(async ({ data }) => {
    const { DEFAULT_MODEL, createLovableResponsesProvider, getLovableApiKey } =
      await import("./ai-gateway.server");
    const gateway = createLovableResponsesProvider(getLovableApiKey());

    const result = streamText({
      model: gateway(DEFAULT_MODEL),
      system:
        "You are an expert note summariser for researchers and professionals. Never invent facts that are not in the notes. Output clean markdown with headings and bullets. Keep the whole summary under 500 words.",
      prompt: `${styleBrief[data.style]}\n\nNOTES:\n"""\n${data.text}\n"""`,
    });

    return { summary: await result.text };
  });

export const runResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchInput.parse(input))
  .handler(async ({ data }) => {
    const { DEFAULT_MODEL, createLovableResponsesProvider, getLovableApiKey } =
      await import("./ai-gateway.server");
    const gateway = createLovableResponsesProvider(getLovableApiKey());

    const result = streamText({
      model: gateway(DEFAULT_MODEL),
      system:
        "You are a rigorous research assistant. Structure findings as markdown. Distinguish established consensus from contested claims. Never fabricate citations, DOIs or URLs — instead name well-known works/authors and mark anything uncertain as 'verify'.",
      prompt:
        data.depth === "deep"
          ? `Produce a deep research brief on: ${data.topic}\n\nSections: Scope & framing, Background, Current state of knowledge, Key debates, Methodological approaches, Gaps & research opportunities, Suggested reading directions (authors/works to verify), Next steps.`
          : `Produce a concise research overview on: ${data.topic}\n\nSections: What it is, Why it matters, Key concepts, Main perspectives, Open questions, Where to look next.`,
    });

    return { report: await result.text };
  });
