import { createFileRoute } from "@tanstack/react-router";
import { serviceConfig, fetchWithTimeout } from "@/lib/service-config";

/**
 * Triggers an n8n webhook by name. The webhook path inside n8n must match
 * the :name segment (e.g. /webhook/summarize -> POST /api/n8n/trigger/summarize).
 */
export const Route = createFileRoute("/api/n8n/trigger/$name")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const body = await request.text();
        const url = `${serviceConfig.n8nWebhookBase}/${params.name}`;

        try {
          const r = await fetchWithTimeout(
            url,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
            },
            30000,
          );
          const text = await r.text();
          return new Response(text, {
            status: r.status,
            headers: { "Content-Type": r.headers.get("content-type") ?? "application/json" },
          });
        } catch (e) {
          return Response.json(
            {
              ok: false,
              error: e instanceof Error ? e.message : "تعذّر تشغيل الـ workflow",
              hint: "تأكد من تفعيل workflow في n8n وأن مسار الـ Webhook مطابق.",
            },
            { status: 502 },
          );
        }
      },
    },
  },
});
