import { getSettingsSnapshot } from "@/context/SettingsContext";

/**
 * Live, settings-aware service config.
 * Values come from localStorage (via SettingsContext) and fall back to VITE_* envs.
 * Access via the `serviceConfig` proxy — it always returns the latest values.
 */
export const serviceConfig = new Proxy(
  {} as {
    ollamaUrl: string;
    n8nUrl: string;
    n8nWebhookBase: string;
    n8nApiKey: string;
    supabaseUrl: string;
    supabaseAnonKey: string;
  },
  {
    get(_t, prop) {
      const s = getSettingsSnapshot();
      switch (prop) {
        case "ollamaUrl":
          return s.services.ollama.url;
        case "n8nUrl":
          return s.services.n8n.url;
        case "n8nWebhookBase":
          return s.services.n8n.webhookBase || s.services.n8n.url;
        case "n8nApiKey":
          return s.services.n8n.apiKey ?? "";
        case "supabaseUrl":
          return s.services.supabase.url;
        case "supabaseAnonKey":
          return s.services.supabase.anonKey ?? "";
        default:
          return undefined;
      }
    },
  },
);

export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 5000,
): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}
