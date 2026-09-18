"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAi } from "@/lib/actions/ai";
import { Loader2, Send } from "lucide-react";

type Msg = {
  role: "user" | "assistant";
  content: string;
};

export function AskAiChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setError(null);
    setInput("");
    const nextHistory: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextHistory);
    setLoading(true);

    const res = await askAi({
      message: text,
      history: messages,
    });

    setLoading(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    if (res.reply) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply! },
      ]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex flex-col h-[min(70vh,640px)] rounded-xl border bg-card">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Contoh pertanyaan:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Apa arti skor readiness saya untuk karier ini?</li>
              <li>Skill mana yang harus saya prioritaskan dulu?</li>
              <li>Jalur kuliah apa yang cocok dengan profil saya?</li>
            </ul>
            <p className="text-xs pt-2">
              AI memakai konteks assessment & profilmu. Bukan pengganti counselor.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-foreground text-background"
                  : "bg-muted text-foreground"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Thinking…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="border-t p-3 space-y-2"
      >
        {error && (
          <p className="text-sm text-destructive px-1">{error}</p>
        )}
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya tentang assessment, skill gap, jalur karier…"
            rows={2}
            maxLength={2000}
            className="min-h-[44px] resize-none"
            disabled={loading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}