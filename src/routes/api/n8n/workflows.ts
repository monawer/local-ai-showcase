import { createFileRoute } from "@tanstack/react-router";
import { serviceConfig, fetchWithTimeout } from "@/lib/service-config";

export const Route = createFileRoute("/api/n8n/workflows")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const headers: Record<string, string> = { Accept: "application/json" };
          if (serviceConfig.n8nApiKey) {
            headers["X-N8N-API-KEY"] = serviceConfig.n8nApiKey;
          }

          // Try API endpoint first (requires API key)
          const apiUrl = `${serviceConfig.n8nUrl}/api/v1/workflows`;
          const r = await fetchWithTimeout(apiUrl, { headers }, 4000);

          if (r.ok) {
            const data = (await r.json()) as { data?: Array<{ id: string; name: string; active: boolean }> };
            const workflows = (data.data ?? []).map((w) => ({
              id: w.id,
              name: w.name,
              active: w.active,
            }));
            return Response.json({
              ok: true,
              total: workflows.length,
              active: workflows.filter((w) => w.active).length,
              workflows,
            });
          }

          // Fall back to a simple health check on n8n root
          const health = await fetchWithTimeout(`${serviceConfig.n8nUrl}/healthz`, {}, 3000);
          return Response.json({
            ok: health.ok,
            total: 0,
            active: 0,
            workflows: [],
            note: health.ok
              ? "n8n يعمل لكن API key غير مُعد"
              : `n8n غير متاح (${health.status})`,
          });
        } catch (e) {
          return Response.json({
            ok: false,
            total: 0,
            active: 0,
            workflows: [],
            error: e instanceof Error ? e.message : "تعذّر الاتصال بـ n8n",
          });
        }
      },
    },
  },
});
