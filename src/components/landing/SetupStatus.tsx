import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { serviceConfig, joinUrl, fetchWithTimeout } from "@/lib/service-config";
import { useSettings } from "@/context/SettingsContext";

const REQUIRED_WEBHOOKS = ["summarize", "classify", "extract", "qa"] as const;

type WebhookCheck = {
  name: string;
  exists: boolean;
  error?: string;
};

async function checkWebhook(name: string): Promise<WebhookCheck> {
  try {
    const url = joinUrl(serviceConfig.n8nWebhookBase, name);
    // n8n returns 404 if webhook doesn't exist, 200/4xx if it does (with empty POST)
    const r = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input: "__ping__" }),
    });
    // Webhook exists if we get any response other than 404
    return { name, exists: r.status !== 404 };
  } catch (e) {
    return {
      name,
      exists: false,
      error: e instanceof Error ? e.message : "غير معروف",
    };
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
    >
      <Copy className="h-3 w-3" />
      {copied ? "تم النسخ" : "نسخ"}
    </button>
  );
}

export function SetupStatus() {
  const { settings } = useSettings();
  const [expanded, setExpanded] = useState(false);

  const { data: checks, isLoading } = useQuery({
    queryKey: ["setup-status", "webhooks", settings.services.n8n.webhookBase],
    queryFn: async () => Promise.all(REQUIRED_WEBHOOKS.map((w) => checkWebhook(w))),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  if (isLoading || !checks) return null;

  const missing = checks.filter((c) => !c.exists);
  if (missing.length === 0) return null;

  return (
    <section className="relative py-8">
      <div className="container mx-auto max-w-6xl px-6">
        <Card className="border-warning/40 bg-warning/5 backdrop-blur p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-warning/15 p-2 text-warning shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-bold text-foreground">
                    يلزم إعداد {missing.length} من أصل {REQUIRED_WEBHOOKS.length} عروض تجريبية
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    بعض العروض التجريبية لا تعمل لأن workflows مطلوبة لم تُستورد في n8n بعد.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="shrink-0"
                >
                  {expanded ? "إخفاء" : "خطوات الإصلاح"}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </Button>
              </div>

              {/* Status grid */}
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                {checks.map((c) => (
                  <div
                    key={c.name}
                    className={`flex items-center gap-2 text-sm rounded-md px-3 py-2 border ${
                      c.exists
                        ? "border-success/30 bg-success/5 text-success"
                        : "border-destructive/30 bg-destructive/5 text-destructive"
                    }`}
                  >
                    {c.exists ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    <span className="font-mono">{c.name}</span>
                  </div>
                ))}
              </div>

              {expanded && (
                <div className="mt-6 space-y-4 text-sm">
                  <div className="rounded-md border border-border/60 bg-background/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">
                        الخطوة 1 — افتح n8n
                      </h4>
                      <Button asChild size="sm" variant="ghost">
                        <a href="http://n8n.localhost" target="_blank" rel="noreferrer">
                          <ExternalLink className="h-3 w-3" />
                          افتح
                        </a>
                      </Button>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      توجّه إلى n8n على{" "}
                      <code className="font-mono text-primary">http://n8n.localhost</code>{" "}
                      وسجّل دخولك.
                    </p>
                  </div>

                  <div className="rounded-md border border-border/60 bg-background/50 p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      الخطوة 2 — استورد ملفات الـ workflows
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed mb-3">
                      في n8n: <span className="text-foreground">Workflows ← Import from file</span>{" "}
                      ثم اختر كل ملف من الملفات التالية واحداً تلو الآخر:
                    </p>
                    <ul className="space-y-1.5">
                      {missing.map((m) => (
                        <li
                          key={m.name}
                          className="flex items-center justify-between gap-3 font-mono text-xs bg-card/40 px-3 py-1.5 rounded"
                        >
                          <span>n8n-workflows/{m.name}.json</span>
                          <CopyButton text={`n8n-workflows/${m.name}.json`} />
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-md border border-border/60 bg-background/50 p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      الخطوة 3 — فعّل كل workflow
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      بعد الاستيراد، اضغط على زر التفعيل (<span className="text-success">Active</span>)
                      في أعلى يمين كل workflow. بدون التفعيل لن يستجيب الـ webhook.
                    </p>
                  </div>

                  <div className="rounded-md border border-border/60 bg-background/50 p-4">
                    <h4 className="font-semibold text-foreground mb-2">
                      الخطوة 4 — تحقق من إعدادات إضافية
                    </h4>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li>
                        ✓ تأكد أن <code className="font-mono text-primary">OLLAMA_ORIGINS=*</code>{" "}
                        مُعرّفة على Windows (متغير بيئة)
                      </li>
                      <li>
                        ✓ تأكد أن نموذج <code className="font-mono text-primary">llama3.1</code>{" "}
                        مُنزَّل في Ollama (أو عدّل اسم النموذج في الـ workflow)
                      </li>
                      <li>
                        ✓ لعرض Q&A: شغّل <code className="font-mono text-primary">supabase/seed.sql</code>{" "}
                        في Supabase Studio
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
