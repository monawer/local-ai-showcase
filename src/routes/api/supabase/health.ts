import { createFileRoute } from "@tanstack/react-router";
import { serviceConfig, fetchWithTimeout } from "@/lib/service-config";

export const Route = createFileRoute("/api/supabase/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          // Kong gateway exposes /rest/v1/ — a HEAD or GET returns 200 if healthy
          const r = await fetchWithTimeout(
            `${serviceConfig.supabaseUrl}/rest/v1/`,
            {
              headers: serviceConfig.supabaseAnonKey
                ? { apikey: serviceConfig.supabaseAnonKey }
                : {},
            },
            4000,
          );
          return Response.json({
            ok: r.ok || r.status === 401, // 401 = gateway reachable but anon key missing
            status: r.status,
            services: {
              rest: r.ok || r.status === 401,
              gateway: true,
            },
          });
        } catch (e) {
          return Response.json({
            ok: false,
            services: { rest: false, gateway: false },
            error: e instanceof Error ? e.message : "تعذّر الاتصال بـ Supabase",
          });
        }
      },
    },
  },
});
