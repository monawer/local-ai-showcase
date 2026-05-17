import { Brain, Workflow, Database, Cpu } from "lucide-react";
import { ServiceCard } from "./ServiceCard";
import {
  useOllamaStatus,
  useN8nStatus,
  useSupabaseStatus,
  useSystemStats,
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
  const sys = useSystemStats();

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

  const sysStatus = sys.isLoading ? "loading" : sys.data?.available ? "ok" : "warn";

  return (
    <section id="services" className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// LIVE DASHBOARD</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            حالة الخدمات في الوقت الحقيقي
          </h2>
          <p className="mt-3 text-muted-foreground">
            تتصل الصفحة مباشرة بالخدمات المركّبة على السيرفر عبر شبكة Docker
            الداخلية، وتُحدّث الحالة كل بضع ثوانٍ.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              {
                label: "REST",
                value: supa.data?.services.rest ? "✓" : "✕",
              },
              {
                label: "Gateway",
                value: supa.data?.services.gateway ? "✓" : "✕",
              },
            ]}
            note={supa.data?.error ?? "Postgres + Auth + Storage + Realtime"}
          />

          <ServiceCard
            title="النظام"
            icon={Cpu}
            status={sysStatus as never}
            primary={sys.data?.memory ? `${sys.data.memory.usedPct}%` : "—"}
            rows={
              sys.data?.available
                ? [
                    { label: "المعالج", value: `${sys.data.cpu?.count ?? "—"} نواة` },
                    {
                      label: "الذاكرة",
                      value: sys.data.memory
                        ? `${formatBytes(sys.data.memory.total - sys.data.memory.free)} / ${formatBytes(sys.data.memory.total)}`
                        : "—",
                    },
                    {
                      label: "الجهاز",
                      value: sys.data.hostname ?? "—",
                    },
                  ]
                : []
            }
            note={
              sys.data?.available
                ? `${sys.data.platform} • تشغيل منذ ${Math.round((sys.data.uptime ?? 0) / 3600)} ساعة`
                : "إحصائيات النظام غير متاحة في هذه البيئة"
            }
          />
        </div>
      </div>
    </section>
  );
}
