import { createFileRoute } from "@tanstack/react-router";
import { serviceConfig } from "@/lib/service-config";

/**
 * Streaming proxy to Ollama's /api/chat endpoint.
 * Forwards the body as-is and streams NDJSON chunks back to the client.
 */
export const Route = createFileRoute("/api/ollama/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();

        try {
          const upstream = await fetch(`${serviceConfig.ollamaUrl}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });

          if (!upstream.ok || !upstream.body) {
            const text = await upstream.text().catch(() => "");
            return new Response(
              JSON.stringify({ error: `Ollama ${upstream.status}: ${text}` }),
              { status: 502, headers: { "Content-Type": "application/json" } },
            );
          }

          return new Response(upstream.body, {
            status: 200,
            headers: {
              "Content-Type": "application/x-ndjson; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              "X-Accel-Buffering": "no",
            },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({
              error: e instanceof Error ? e.message : "تعذّر الاتصال بـ Ollama",
            }),
            { status: 502, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
