import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSettingsSnapshot } from "@/context/SettingsContext";

const DEFAULT_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzc5MjE1NTQxLCJleHAiOjE5MzY4OTU1NDF9.ygWrlYmfeazfiM3rHf7RGUBp_ertR86s6pkDvxz1MnY";

let cached: { url: string; key: string; client: SupabaseClient } | null = null;

export function getSupabase(): SupabaseClient {
  const s = getSettingsSnapshot();
  // Use proxy path for same-origin (avoids CORS), or direct URL if configured
  const url = s.services.supabase.url || "/proxy/supabase";
  // Resolve relative proxy URL to absolute for supabase-js
  const absoluteUrl = url.startsWith("/") ? `${window.location.origin}${url}` : url;
  const key = s.services.supabase.anonKey || DEFAULT_ANON_KEY;

  if (cached && cached.url === absoluteUrl && cached.key === key) {
    return cached.client;
  }
  const client = createClient(absoluteUrl, key, {
    auth: { persistSession: false },
  });
  cached = { url: absoluteUrl, key, client };
  return client;
}

export type KnowledgeRow = {
  id: string;
  category: string;
  question: string;
  answer: string;
};

export async function fetchKnowledgeBase(): Promise<KnowledgeRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("id,category,question,answer")
    .limit(50);
  if (error) throw new Error(error.message);
  return data ?? [];
}
