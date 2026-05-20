import { Layers, MessageSquare, Database, Workflow } from "lucide-react";
import {
  useOllamaStatus,
  useN8nStatus,
  useSupabaseStatus,
  useOpenWebUIStatus,
} from "@/hooks/useServiceStatus";

type CardProps = {
  label: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  active: boolean;
  footer: React.ReactNode;
};

function ServiceTile({ label, icon: Icon, title, subtitle, active, footer }: CardProps) {
  return (
    <div className="bg-background border border-primary/40 p-6 rounded-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" strokeWidth={1.8} />
        </div>
        <span
          className={`text-xs font-bold ${active ? "text-success" : "text-destructive/80"}`}
        >
          {active ? "نشط" : "غير متاح"}
        </span>
      </div>
      <h4 className="font-display text-xl font-bold mb-1">{label}</h4>
      <div className="text-2xl font-bold text-foreground mb-4">{title}</div>
      <div className="text-xs text-foreground/50 mb-1">{subtitle}</div>
      <div className="mt-2">{footer}</div>
    </div>
  );
}

export function ServicesDashboard() {
  const ollama = useOllamaStatus();
  const n8n = useN8nStatus();
  const supa = useSupabaseStatus();
  const webui = useOpenWebUIStatus();

  const ollamaModel =
    ollama.data?.models?.[0]?.name?.split(":")[0] ??
    (ollama.data?.ok ? "جاهز" : "—");
  const ollamaCount = ollama.data?.models?.length ?? 0;

  return (
    <section
      id="services"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
          <div>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
              حالة الخدمات الحية
            </h2>
            <p className="text-foreground/60 max-w-xl">
              مراقبة فورية لأداء النماذج والبنية التحتية داخل مركز بياناتك.
            </p>
          </div>
          <div className="px-4 py-2 bg-secondary rounded-lg border border-primary/30 text-xs font-mono uppercase tracking-widest text-primary">
            System Health: Optimal
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ServiceTile
            label="Ollama"
            icon={Layers}
            title={ollamaModel}
            subtitle={`${ollamaCount} نموذج محلي`}
            active={!!ollama.data?.ok}
            footer={
              <>
                <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{ width: ollama.data?.ok ? "75%" : "0%" }}
                  />
                </div>
                <div className="mt-2 text-[10px] text-foreground/40 flex justify-between uppercase">
                  <span>Inference Engine</span>
                  <span>{ollama.data?.ok ? "75%" : "—"}</span>
                </div>
              </>
            }
          />

          <ServiceTile
            label="OpenWebUI"
            icon={MessageSquare}
            title={webui.data?.ok ? "جاهز" : "—"}
            subtitle="واجهة المساعد التنفيذية"
            active={!!webui.data?.ok}
            footer={
              <div className="flex -space-x-2 space-x-reverse">
                <div className="w-8 h-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-bold">
                  EX
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold">
                  +
                </div>
              </div>
            }
          />

          <ServiceTile
            label="Supabase"
            icon={Database}
            title={supa.data?.ok ? "متصلة" : "—"}
            subtitle="قاعدة بيانات محلية مؤمّنة"
            active={!!supa.data?.ok}
            footer={
              <div className="text-xs text-foreground/50">
                Vector Search Optimized · AES-256
              </div>
            }
          />

          <ServiceTile
            label="n8n"
            icon={Workflow}
            title={`${n8n.data?.active ?? 0}/${n8n.data?.total ?? 0}`}
            subtitle="مسارات أتمتة ذكية"
            active={!!n8n.data?.ok}
            footer={
              <div className="text-xs text-foreground/50">
                {n8n.data?.active ?? 0} Workflow{(n8n.data?.active ?? 0) === 1 ? "" : "s"}{" "}
                Active
              </div>
            }
          />
        </div>
      </div>
    </section>
  );
}
