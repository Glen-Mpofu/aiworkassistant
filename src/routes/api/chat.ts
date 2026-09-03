import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import {
  DEFAULT_MODEL,
  createLovableResponsesProvider,
  getLovableApiKey,
} from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `You are Scholia, an AI research and study assistant for graduates, researchers and workplace professionals.
You help with literature exploration, methodology, critical analysis, and clear summarisation.
Be precise, cite reasoning, use markdown with headings and bullet points, and flag uncertainty instead of inventing sources.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: unknown };
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        let gateway;
        try {
          gateway = createLovableResponsesProvider(getLovableApiKey());
        } catch {
          return new Response("AI is not configured", { status: 500 });
        }

        const result = streamText({
          model: gateway(DEFAULT_MODEL),
          system: SYSTEM_PROMPT,
          messages: convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});
