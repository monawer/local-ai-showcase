import { Brain, Workflow, Database } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import {
  useOllamaStatus,
  useN8nStatus,
  useSupabaseStatus,
} from "@/hooks/useServiceStatus";

function formatBytes(n: number) {
  if (!n) return "—";
  const gb = n / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = n / 1024 ** 2;
  return `${mb.toFixed(0)} MB`;
}

export function ServicesDashboard() {
  const ollama = useOllamaStatus();
  const n8n = useN8nStatus();
  const supa = useSupabaseStatus();

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

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// LIVE DASHBOARD</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            حالة الخدمات في الوقت الحقيقي
          </h2>
          <p className="mt-3 text-muted-foreground">
            تتصل الصفحة مباشرة بالخدمات على سيرفرك (Ollama, n8n, Supabase)
            وتُحدّث الحالة كل 15 ثانية. إذا ظهرت "غير متاح"، تحقق من تفعيل
            <code className="mx-1 font-mono">OLLAMA_ORIGINS=*</code>
            ومن أن الخدمات قيد التشغيل.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ServiceCard
            title="Ollama"
            icon={Brain}
            status={ollamaStatus as never}
            primary={ollama.data?.models.length.toString() ?? "0"}
            rows={
              ollama.data?.models.slice(0, 3).map((m) => ({
                label: m.name.split(":")[0] ?? m.name,
                value: formatBytes(m.size),
              })) ?? []
            }
            note={ollama.data?.error ?? "النماذج اللغوية المحلية المتاحة للاستدلال"}
          />

          <ServiceCard
            title="n8n"
            icon={Workflow}
            status={n8nStatus as never}
            primary={`${n8n.data?.active ?? 0}/${n8n.data?.total ?? 0}`}
            rows={[
              { label: "النشطة", value: String(n8n.data?.active ?? 0) },
              { label: "المجموع", value: String(n8n.data?.total ?? 0) },
            ]}
            note={n8n.data?.note ?? n8n.data?.error ?? "أتمتة سير العمل والتكاملات"}
          />

          <ServiceCard
            title="Supabase"
            icon={Database}
            status={supaStatus as never}
            primary={supa.data?.ok ? "OK" : "—"}
            rows={[
              { label: "REST", value: supa.data?.services.rest ? "✓" : "✕" },
              { label: "Gateway", value: supa.data?.services.gateway ? "✓" : "✕" },
            ]}
            note={supa.data?.error ?? "Postgres + Auth + Storage + Realtime"}
          />
        </div>
      </div>
    </section>
  );
}
