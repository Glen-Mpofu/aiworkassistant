import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Loader2, Send, Bot, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Markdown } from "@/components/Markdown";

const PROMPTS = [
  "Help me sharpen my research question",
  "Critique this methodology",
  "Turn these findings into a stakeholder update",
];

export function ChatPanel() {
  const [input, setInput] = useState("");
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status } = useChat({
    transport,
    onError: (error) => toast.error(error.message || "The assistant couldn't respond."),
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const send = (text: string) => {
    if (!text.trim() || isLoading) return;
    void sendMessage({ text: text.trim() });
    setInput("");
  };

  return (
    <section className="panel flex h-[70vh] min-h-[480px] flex-col p-5">
      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <Bot className="size-8 text-primary" />
            <p className="max-w-md text-sm text-muted-foreground">
              Ask anything about your research, notes or workplace analysis. The assistant keeps the
              full thread in context.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {PROMPTS.map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const text = message.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("");
          const isUser = message.role === "user";
          return (
            <div key={message.id} className="flex gap-3">
              <div
                className={`mt-1 flex size-7 shrink-0 items-center justify-center rounded-full ${
                  isUser ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                }`}
              >
                {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  {isUser ? "You" : "Scholia"}
                </p>
                {isUser ? (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/90">{text}</p>
                ) : (
                  <Markdown>{text}</Markdown>
                )}
              </div>
            </div>
          );
        })}

        {status === "submitted" && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Thinking…
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="mt-4 flex gap-2 border-t border-border pt-4"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message the research assistant…"
          className="h-11 bg-input/40"
        />
        <Button type="submit" disabled={!input.trim() || isLoading} className="glow h-11">
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </form>
    </section>
  );
}
