import { useEffect, useRef, useState } from "react";
import { Send, Square, RotateCcw, Sparkles, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOllamaStatus } from "@/hooks/useServiceStatus";
import { useOllamaChat } from "@/hooks/useOllamaChat";

export function ChatDemo() {
  const status = useOllamaStatus();
  const models = status.data?.models ?? [];
  const [model, setModel] = useState<string>("");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!model && models.length > 0) setModel(models[0]!.name);
  }, [models, model]);

  const chat = useOllamaChat(model);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chat.messages]);

  const handleSend = () => {
    if (!input.trim() || !model) return;
    chat.send(input);
    setInput("");
  };

  const noModels = !status.isLoading && (!status.data?.ok || models.length === 0);

  return (
    <section id="chat" className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// LIVE INFERENCE</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            تحدّث مع نموذجك الخاص
          </h2>
          <p className="mt-3 text-muted-foreground">
            استدلال مباشر عبر Ollama. كل رمز يُولَّد على معالج السيرفر — لا
            استدعاء خارجي ولا تسرب بيانات.
          </p>
        </div>

        <Card className="overflow-hidden bg-card/60 backdrop-blur border-border/60">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 p-4">
            <div className="flex items-center gap-3 flex-1 min-w-[200px]">
              <Sparkles className="h-4 w-4 text-primary" />
              <Select value={model} onValueChange={setModel} disabled={noModels}>
                <SelectTrigger className="w-full max-w-xs bg-background/40">
                  <SelectValue placeholder={noModels ? "لا توجد نماذج" : "اختر نموذجاً"} />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {chat.stats && (
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <span>{chat.stats.tokens} tok</span>
                <span>{chat.stats.tokensPerSec} tok/s</span>
                <span>{(chat.stats.durationMs / 1000).toFixed(2)}s</span>
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={chat.reset}
              disabled={chat.messages.length === 0}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div
            ref={scrollRef}
            className="min-h-[300px] max-h-[480px] overflow-y-auto p-6 space-y-4"
          >
            {chat.messages.length === 0 && !noModels && (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm">اكتب سؤالك بالأسفل لبدء المحادثة</p>
              </div>
            )}

            {noModels && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 text-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      Ollama غير متاح من هذه البيئة
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      عند تشغيل هذه الصفحة في حاوية Docker على نفس شبكة Ollama،
                      ستظهر النماذج المتاحة هنا تلقائياً ويعمل الـ chat مباشرة.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {chat.messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "flex justify-start"
                    : "flex justify-end"
                }
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-ss-md bg-primary/15 border border-primary/20 px-4 py-3 text-sm leading-relaxed"
                      : "max-w-[85%] rounded-2xl rounded-se-md bg-secondary/60 border border-border/40 px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap"
                  }
                >
                  {m.content || (
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
                  )}
                </div>
              </div>
            ))}

            {chat.error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive font-mono">
                {chat.error}
              </div>
            )}
          </div>

          <div className="border-t border-border/60 p-4">
            <div className="flex items-end gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="اكتب رسالتك… (Enter للإرسال، Shift+Enter لسطر جديد)"
                rows={2}
                className="resize-none bg-background/40"
                disabled={noModels}
              />
              {chat.streaming ? (
                <Button onClick={chat.stop} variant="destructive" size="icon">
                  <Square className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || !model || noModels}
                  size="icon"
                  className="shadow-[var(--shadow-glow)]"
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
