/**
 * Client-side service URLs.
 * Configured at BUILD time via VITE_* env vars (see Dockerfile ARGs).
 * Defaults are tuned for Docker Desktop on Windows with Traefik on .localhost.
 */

export const serviceConfig = {
  ollamaUrl:
    import.meta.env.VITE_OLLAMA_URL ?? "http://localhost:11434",
  n8nUrl: import.meta.env.VITE_N8N_URL ?? "http://n8n.localhost",
  n8nWebhookBase:
    import.meta.env.VITE_N8N_WEBHOOK_BASE ??
    import.meta.env.VITE_N8N_URL ??
    "http://n8n.localhost",
  n8nApiKey: import.meta.env.VITE_N8N_API_KEY ?? "",
  supabaseUrl:
    import.meta.env.VITE_SUPABASE_URL ?? "http://supabase.localhost",
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? "",
};

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
