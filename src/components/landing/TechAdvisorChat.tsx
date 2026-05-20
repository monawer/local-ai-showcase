import { useEffect, useRef, useState } from "react";
import { Send, RotateCcw, Wrench, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { joinUrl, serviceConfig } from "@/lib/service-config";

type Message = { role: "user" | "assistant"; content: string };

function extractReply(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data.length > 0) return extractReply(data[0]);
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["reply", "output", "text", "answer", "message", "response", "result"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v;
      if (v && typeof v === "object") {
        const nested = extractReply(v);
        if (nested) return nested;
      }
    }
    return JSON.stringify(data, null, 2);
  }
  return String(data ?? "");
}

export function TechAdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    setInput("");
    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setLoading(true);

    try {
      const url = joinUrl(serviceConfig.n8nUrl, "webhook/tech-advisor");
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(t || `HTTP ${r.status}`);
      }
      const ct = r.headers.get("content-type") ?? "";
      const data = ct.includes("application/json") ? await r.json() : await r.text();
      const reply = extractReply(data) || "(لا توجد إجابة)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <section
      id="tech-advisor"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            المستشار التقني
          </h2>
          <p className="text-foreground/60 max-w-2xl">
            مساعد تقني مدعوم بمسار n8n مؤسسي. اطرح سؤالك التقني وستصل الإجابة عبر
            الـ webhook المخصص داخل شبكتك.
          </p>
        </div>

        <Card className="overflow-hidden bg-secondary border-primary/20">
          <div className="flex items-center justify-between gap-3 border-b border-primary/20 p-4">
            <div className="flex items-center gap-2 text-sm text-foreground/60">
              <Wrench className="h-4 w-4 text-primary" />
              <span className="font-mono text-xs">webhook-test/tech-advisor</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={reset}
              disabled={messages.length === 0 || loading}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className="min-h-[300px] max-h-[480px] overflow-y-auto p-6 space-y-4"
          >
            {messages.length === 0 && (
              <div className="text-center py-12 text-foreground/40">
                <Wrench className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">اطرح سؤالك التقني لبدء الاستشارة</p>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-start" : "flex justify-end"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-ss-md bg-primary/20 border border-primary/30 px-4 py-3 text-sm leading-relaxed"
                      : "max-w-[85%] rounded-2xl rounded-se-md bg-background border border-border px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-se-md bg-background border border-border px-4 py-3">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce" />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-foreground/60 animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    />
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-mono flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="border-t border-primary/20 p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="اكتب سؤالك التقني… (Enter للإرسال، Shift+Enter لسطر جديد)"
                rows={2}
                className="resize-none bg-background"
                disabled={loading}
              />
              <Button
                onClick={send}
                disabled={!input.trim() || loading}
                size="icon"
                className="shadow-[var(--shadow-glow)]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
