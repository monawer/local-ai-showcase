import { createFileRoute } from "@tanstack/react-router";
import { serviceConfig, fetchWithTimeout } from "@/lib/service-config";

export const Route = createFileRoute("/api/ollama/tags")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const r = await fetchWithTimeout(`${serviceConfig.ollamaUrl}/api/tags`, {}, 4000);
          if (!r.ok) {
            return Response.json(
              { ok: false, error: `Ollama returned ${r.status}`, models: [] },
              { status: 200 },
            );
          }
          const data = (await r.json()) as { models?: Array<{ name: string; size: number; modified_at: string }> };
          return Response.json({ ok: true, models: data.models ?? [] });
        } catch (e) {
          return Response.json(
            {
              ok: false,
              error: e instanceof Error ? e.message : "تعذّر الاتصال بـ Ollama",
              models: [],
            },
            { status: 200 },
          );
        }
      },
    },
  },
});
