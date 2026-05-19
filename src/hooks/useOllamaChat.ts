import { useCallback, useRef, useState } from "react";
import { joinUrl, serviceConfig } from "@/lib/service-config";

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type ChatStats = {
  durationMs: number;
  tokens: number;
  tokensPerSec: number;
};

export function useOllamaChat(model: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      setError(null);
      setStats(null);

      const userMsg: ChatMessage = { role: "user", content: text };
      const nextMessages = [...messages, userMsg];
      setMessages([...nextMessages, { role: "assistant", content: "" }]);
      setStreaming(true);

      const ctrl = new AbortController();
      abortRef.current = ctrl;
      const t0 = performance.now();
      let tokenCount = 0;

      try {
        const r = await fetch(joinUrl(serviceConfig.ollamaUrl, "api/chat"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model,
            messages: nextMessages,
            stream: true,
          }),
          signal: ctrl.signal,
        });

        if (!r.ok || !r.body) {
          const errText = await r.text().catch(() => "");
          throw new Error(errText || `HTTP ${r.status}`);
        }

        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let acc = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n");
          buf = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const obj = JSON.parse(line) as {
                message?: { content?: string };
                done?: boolean;
                eval_count?: number;
              };
              const chunk = obj.message?.content ?? "";
              if (chunk) {
                acc += chunk;
                tokenCount += 1;
                setMessages((m) => {
                  const copy = m.slice();
                  copy[copy.length - 1] = { role: "assistant", content: acc };
                  return copy;
                });
              }
              if (obj.done) {
                const dt = performance.now() - t0;
                const tk = obj.eval_count ?? tokenCount;
                setStats({
                  durationMs: Math.round(dt),
                  tokens: tk,
                  tokensPerSec: dt > 0 ? Math.round((tk / dt) * 1000) : 0,
                });
              }
            } catch {
              /* ignore parse error on partial chunk */
            }
          }
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          setError(e instanceof Error ? e.message : "خطأ غير معروف");
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, model, streaming],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    setMessages([]);
    setStats(null);
    setError(null);
  }, []);

  return { messages, streaming, stats, error, send, stop, reset };
}
