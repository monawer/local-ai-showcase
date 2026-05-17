import { useQuery } from "@tanstack/react-query";

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

export type SystemStats = {
  ok: boolean;
  available: boolean;
  platform?: string;
  hostname?: string;
  uptime?: number;
  memory?: { total: number; free: number; usedPct: number };
  cpu?: { count: number; model: string; load1: number };
};

async function fetchJSON<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json() as Promise<T>;
}

export function useOllamaStatus() {
  return useQuery({
    queryKey: ["status", "ollama"],
    queryFn: () => fetchJSON<OllamaStatus>("/api/ollama/tags"),
    refetchInterval: 15000,
    retry: false,
  });
}

export function useN8nStatus() {
  return useQuery({
    queryKey: ["status", "n8n"],
    queryFn: () => fetchJSON<N8nStatus>("/api/n8n/workflows"),
    refetchInterval: 15000,
    retry: false,
  });
}

export function useSupabaseStatus() {
  return useQuery({
    queryKey: ["status", "supabase"],
    queryFn: () => fetchJSON<SupabaseStatus>("/api/supabase/health"),
    refetchInterval: 15000,
    retry: false,
  });
}

export function useSystemStats() {
  return useQuery({
    queryKey: ["status", "system"],
    queryFn: () => fetchJSON<SystemStats>("/api/system/stats"),
    refetchInterval: 10000,
    retry: false,
  });
}
