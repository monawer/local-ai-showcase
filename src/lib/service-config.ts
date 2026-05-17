/**
 * Server-side configuration for connecting to local Docker services.
 * Values are read from environment variables at runtime (process.env).
 * Defaults match docker-compose service names on the default user network.
 */

export const serviceConfig = {
  ollamaUrl: process.env.OLLAMA_URL ?? "http://ollama:11434",
  n8nUrl: process.env.N8N_URL ?? "http://n8n:5678",
  n8nWebhookBase: process.env.N8N_WEBHOOK_BASE ?? "http://n8n:5678/webhook",
  n8nApiKey: process.env.N8N_API_KEY ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "http://supabase-kong:8000",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
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
