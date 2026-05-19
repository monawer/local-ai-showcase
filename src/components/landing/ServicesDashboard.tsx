import { Brain, Workflow, Database, MessageSquare, ExternalLink } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import {
  useOllamaStatus,
  useN8nStatus,
  useSupabaseStatus,
  useOpenWebUIStatus,
} from "@/hooks/useServiceStatus";

function formatBytes(n: number) {
  if (!n) return "—";
  const gb = n / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = n / 1024 ** 2;
  return `${mb.toFixed(0)} MB`;
}

const SERVICE_LINKS: Record<string, { label: string; url: string } | undefined> = {
  n8n: { label: "افتح n8n", url: "http://n8n.localhost" },
  supabase: { label: "Supabase Studio", url: "http://supabase.localhost" },
  openwebui: { label: "افتح المساعد", url: "http://webui.localhost" },
};

function ServiceLink({ service }: { service: string }) {
  const link = SERVICE_LINKS[service];
  if (!link) return null;
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
    >
      <ExternalLink className="h-3 w-3" />
      {link.label}
    </a>
  );
}

export function ServicesDashboard() {
  const ollama = useOllamaStatus();
  const n8n = useN8nStatus();
  const supa = useSupabaseStatus();
  const webui = useOpenWebUIStatus();

  const ollamaStatus = ollama.isLoading
    ? "loading"
    : ollama.data?.ok && ollama.data.models.length > 0
      ? "ok"
      : ollama.data?.ok
        ? "warn"
        : "down";

  const n8nStatus = n8n.isLoading
    ? "loading"
    : n8n.data?.ok && n8n.data.total > 0
      ? "ok"
      : n8n.data?.ok
        ? "warn"
        : "down";

  const supaStatus = supa.isLoading
    ? "loading"
    : supa.data?.ok
      ? "ok"
      : "down";

  const webuiStatus = webui.isLoading
    ? "loading"
    : webui.data?.ok
      ? "ok"
      : "down";

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// LIVE DASHBOARD</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            حالة الخدمات في الوقت الحقيقي
          </h2>
          <p className="mt-3 text-muted-foreground">
            الصفحة تتصل مباشرة بالخدمات على سيرفرك وتُحدّث الحالة كل 15 ثانية — كل شيء يعمل محلياً
            على شبكتك الداخلية.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col">
            <ServiceCard
              title="Ollama"
              icon={Brain}
              status={ollamaStatus as never}
              primary={
                ollama.data?.models.length
                  ? `${ollama.data.models.length} نموذج`
                  : "0"
              }
              rows={
                ollama.data?.models.slice(0, 3).map((m) => ({
                  label: m.name.split(":")[0] ?? m.name,
                  value: formatBytes(m.size),
                })) ?? []
              }
              note={ollama.data?.error ?? "النماذج اللغوية المحلية"}
            />
          </div>

          <div className="flex flex-col">
            <ServiceCard
              title="OpenWebUI"
              icon={MessageSquare}
              status={webuiStatus as never}
              primary={webui.data?.ok ? "جاهز" : "—"}
              rows={[
                { label: "الواجهة", value: webui.data?.ok ? "✓ متاح" : "✕" },
                { label: "النطاق", value: "webui.localhost" },
              ]}
              note="مساعد الذكاء الاصطناعي الكامل"
            />
            <ServiceLink service="openwebui" />
          </div>

          <div className="flex flex-col">
            <ServiceCard
              title="n8n"
              icon={Workflow}
              status={n8nStatus as never}
              primary={`${n8n.data?.active ?? 0}/${n8n.data?.total ?? 0}`}
              rows={[
                { label: "النشطة", value: String(n8n.data?.active ?? 0) },
                { label: "المجموع", value: String(n8n.data?.total ?? 0) },
              ]}
              note={n8n.data?.note ?? n8n.data?.error ?? "أتمتة سير العمل"}
            />
            <ServiceLink service="n8n" />
          </div>

          <div className="flex flex-col">
            <ServiceCard
              title="Supabase"
              icon={Database}
              status={supaStatus as never}
              primary={supa.data?.ok ? "OK" : "—"}
              rows={[
                { label: "REST", value: supa.data?.services.rest ? "✓" : "✕" },
                { label: "Gateway", value: supa.data?.services.gateway ? "✓" : "✕" },
              ]}
              note={supa.data?.error ?? "Postgres + Auth + Storage"}
            />
            <ServiceLink service="supabase" />
          </div>
        </div>
      </div>
    </section>
  );
}
