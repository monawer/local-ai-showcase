import { Lock } from "lucide-react";

export function Architecture() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-5xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// ARCHITECTURE</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            كل شيء داخل السيرفر — Air-Gapped
          </h2>
          <p className="mt-3 text-muted-foreground">
            الواجهة والخدمات تعمل كحاويات Docker على شبكة داخلية واحدة. لا توجد
            أي مكالمة شبكة خارجة عن السيرفر.
          </p>
        </div>

        <div className="relative">
          <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-card/30 backdrop-blur p-6 md:p-10">
            <div className="flex items-center gap-2 mb-6 text-sm text-primary font-mono">
              <Lock className="h-4 w-4" />
              <span>local-server (air-gapped)</span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { name: "Ollama", port: ":11434", desc: "LLM Runtime" },
                { name: "n8n", port: ":5678", desc: "Workflow Engine" },
                { name: "Supabase", port: ":8000", desc: "Database + Auth" },
              ].map((s) => (
                <div
                  key={s.name}
                  className="rounded-lg border border-border/60 bg-background/60 p-4"
                >
                  <div className="text-lg font-semibold">{s.name}</div>
                  <div className="text-xs font-mono text-primary mt-1">{s.port}</div>
                  <div className="text-xs text-muted-foreground mt-2">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="my-6 flex items-center justify-center">
              <div className="h-8 w-px bg-gradient-to-b from-primary/60 to-transparent" />
            </div>

            <div className="rounded-lg border border-primary/40 bg-primary/10 p-4 text-center">
              <div className="text-lg font-semibold">واجهة هذه الصفحة</div>
              <div className="text-xs font-mono text-primary mt-1">:8080</div>
              <div className="text-xs text-muted-foreground mt-2">
                Proxy لكل الخدمات عبر <code className="font-mono">/api/*</code>
              </div>
            </div>

            <div className="my-6 flex items-center justify-center">
              <div className="h-8 w-px bg-gradient-to-b from-primary/60 to-transparent" />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              المستخدم على الشبكة المحلية
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
