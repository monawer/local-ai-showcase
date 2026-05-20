import { Lock, Cloud, Server, CheckCircle2, XCircle } from "lucide-react";

const SERVICES = [
  { name: "Ollama", port: ":11434", desc: "نماذج اللغة (LLM)" },
  { name: "OpenWebUI", port: ":80", desc: "واجهة المساعد" },
  { name: "n8n", port: ":5678", desc: "أتمتة العمليات" },
  { name: "Supabase", port: ":8000", desc: "قاعدة البيانات + Auth" },
];

const COMPARE = [
  { feature: "خصوصية البيانات", cloud: false, local: true },
  { feature: "يعمل بدون إنترنت", cloud: false, local: true },
  { feature: "رسوم الاستخدام الشهري", cloud: false, local: true },
  { feature: "سرعة الاستجابة", cloud: false, local: true },
  { feature: "التحكم الكامل في النماذج", cloud: false, local: true },
  { feature: "الامتثال التنظيمي المحلي", cloud: false, local: true },
];

export function Architecture() {
  return (
    <section id="architecture" className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// ARCHITECTURE</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            كل شيء داخل شبكتك — Air-Gapped
          </h2>
          <p className="mt-3 text-muted-foreground">
            جميع الخدمات تعمل كحاويات Docker على شبكة داخلية معزولة. لا يوجد أي اتصال خارجي.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Architecture diagram */}
          <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/30 backdrop-blur p-6">
            <div className="flex items-center gap-2 mb-5 text-sm text-primary font-mono">
              <Lock className="h-4 w-4" />
              <span>شبكتك الداخلية (معزولة تماماً)</span>
            </div>

            {/* User */}
            <div className="mb-4 rounded-lg border border-border/40 bg-background/40 px-4 py-3 text-center text-sm">
              <div className="font-medium">المستخدم / المتصفح</div>
              <div className="text-xs text-muted-foreground mt-0.5">على الشبكة الداخلية</div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center mb-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-px h-4 bg-primary/50" />
                <div className="text-primary text-xs">▼</div>
              </div>
            </div>

            {/* Traefik */}
            <div className="mb-2 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-center text-sm">
              <div className="font-medium">Traefik</div>
              <div className="text-xs text-muted-foreground mt-0.5">إدارة الشبكة والمسارات</div>
            </div>

            {/* Arrow down */}
            <div className="flex justify-center mb-2">
              <div className="flex flex-col items-center gap-0.5">
                <div className="w-px h-4 bg-primary/50" />
                <div className="text-primary text-xs">▼</div>
              </div>
            </div>

            {/* Services grid */}
            <div className="grid grid-cols-2 gap-2">
              {SERVICES.map((s) => (
                <div
                  key={s.name}
                  className="rounded-lg border border-border/60 bg-background/60 p-3"
                >
                  <div className="text-sm font-semibold">{s.name}</div>
                  <div className="text-xs font-mono text-primary mt-0.5">{s.port}</div>
                  <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison table */}
          <div>
            <h3 className="text-lg font-bold mb-4">محلي مقابل السحابة</h3>
            <div className="rounded-xl border border-border/60 overflow-hidden">
              <div className="grid grid-cols-3 bg-muted/40 px-4 py-2.5 text-xs font-mono text-muted-foreground">
                <div>الميزة</div>
                <div className="flex items-center justify-center gap-1.5 text-destructive">
                  <Cloud className="h-3 w-3" /> السحابة
                </div>
                <div className="flex items-center justify-center gap-1.5 text-success">
                  <Server className="h-3 w-3" /> محلي
                </div>
              </div>
              {COMPARE.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-3 px-4 py-3 text-sm border-t border-border/40 ${
                    i % 2 === 0 ? "bg-card/20" : ""
                  }`}
                >
                  <div className="text-muted-foreground">{row.feature}</div>
                  <div className="flex justify-center">
                    {row.cloud ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive/70" />
                    )}
                  </div>
                  <div className="flex justify-center">
                    {row.local ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <XCircle className="h-4 w-4 text-destructive/70" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
