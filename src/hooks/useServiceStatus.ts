import { useQuery } from "@tanstack/react-query";
import { serviceConfig, fetchWithTimeout, joinUrl } from "@/lib/service-config";
import { useSettings } from "@/context/SettingsContext";

export type OpenWebUIStatus = {
  ok: boolean;
  error?: string;
};

export type OllamaModel = { name: string; size: number; modified_at: string };

export type OllamaStatus = {
  ok: boolean;
  error?: string;
  models: OllamaModel[];
};

export type N8nStatus = {
  ok: boolean;
  total: number;
  active: number;
  workflows: Array<{ id: string; name: string; active: boolean }>;
  error?: string;
  note?: string;
};

export type SupabaseStatus = {
  ok: boolean;
  status?: number;
  services: { rest: boolean; gateway: boolean };
  error?: string;
};

export function useOllamaStatus() {
  const { settings } = useSettings();
  return useQuery<OllamaStatus>({
    queryKey: ["status", "ollama", settings.services.ollama.url],
    queryFn: async () => {
      try {
        const r = await fetchWithTimeout(joinUrl(serviceConfig.ollamaUrl, "api/tags"));
        if (!r.ok) {
          return { ok: false, error: `HTTP ${r.status}`, models: [] };
        }
        const j = (await r.json()) as { models?: OllamaModel[] };
        return { ok: true, models: j.models ?? [] };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "غير متاح",
          models: [],
        };
      }
    },
    refetchInterval: settings.refreshIntervalSec * 1000,
    enabled: settings.services.ollama.enabled,
  });
}

export function useN8nStatus() {
  const { settings } = useSettings();
  return useQuery<N8nStatus>({
    queryKey: ["status", "n8n", settings.services.n8n.url, settings.services.n8n.apiKey],
    queryFn: async () => {
      try {
        const headers: Record<string, string> = {};
        if (serviceConfig.n8nApiKey) {
          headers["X-N8N-API-KEY"] = serviceConfig.n8nApiKey;
        }
        const r = await fetchWithTimeout(joinUrl(serviceConfig.n8nUrl, "api/v1/workflows"), {
          headers,
        });
        if (!r.ok) {
          // n8n مفعّل لكن بدون API key — نعتبره "جزئي"
          return {
            ok: true,
            total: 0,
            active: 0,
            workflows: [],
            note:
              r.status === 401
                ? "n8n متصل، لكن يحتاج VITE_N8N_API_KEY لقراءة workflows"
                : `HTTP ${r.status}`,
          };
        }
        const j = (await r.json()) as {
          data?: Array<{ id: string; name: string; active: boolean }>;
        };
        const workflows = j.data ?? [];
        return {
          ok: true,
          total: workflows.length,
          active: workflows.filter((w) => w.active).length,
          workflows,
        };
      } catch (e) {
        return {
          ok: false,
          total: 0,
          active: 0,
          workflows: [],
          error: e instanceof Error ? e.message : "غير متاح",
        };
      }
    },
    refetchInterval: settings.refreshIntervalSec * 1000,
    enabled: settings.services.n8n.enabled,
  });
}

export function useSupabaseStatus() {
  const { settings } = useSettings();
  return useQuery<SupabaseStatus>({
    queryKey: ["status", "supabase", settings.services.supabase.url],
    queryFn: async () => {
      try {
        const r = await fetchWithTimeout(joinUrl(serviceConfig.supabaseUrl, "auth/v1/health"));
        return {
          ok: r.ok,
          status: r.status,
          services: { rest: r.ok, gateway: r.ok },
        };
      } catch (e) {
        return {
          ok: false,
          services: { rest: false, gateway: false },
          error: e instanceof Error ? e.message : "غير متاح",
        };
      }
    },
    refetchInterval: settings.refreshIntervalSec * 1000,
    enabled: settings.services.supabase.enabled,
  });
}

export function useOpenWebUIStatus() {
  const { settings } = useSettings();
  return useQuery<OpenWebUIStatus>({
    queryKey: ["status", "openwebui"],
    queryFn: async () => {
      try {
        const r = await fetchWithTimeout("/proxy/webui/");
        return { ok: r.ok || r.status === 401 };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "غير متاح",
        };
      }
    },
    refetchInterval: settings.refreshIntervalSec * 1000,
  });
}
