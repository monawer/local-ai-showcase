import { useState } from "react";
import { FileText, Mail, Database, MessageSquare, Play, Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { serviceConfig } from "@/lib/service-config";

type Demo = {
  id: string;
  webhook: string;
  title: string;
  description: string;
  icon: LucideIcon;
  placeholder: string;
  example: string;
};

const DEMOS: Demo[] = [
  {
    id: "summarize",
    webhook: "summarize",
    title: "تلخيص مستند",
    description: "ألصق نصاً طويلاً وسيُلخّصه النموذج المحلي في 3 جمل.",
    icon: FileText,
    placeholder: "ألصق هنا أي نص تريد تلخيصه…",
    example:
      "اجتمع مجلس الإدارة اليوم لمناقشة الميزانية السنوية، وتم الاتفاق على زيادة الاستثمار في البنية التحتية بنسبة 30%، مع تخصيص ميزانية إضافية للتدريب التقني.",
  },
  {
    id: "classify",
    webhook: "classify",
    title: "تصنيف بريد",
    description: "أدخل نص رسالة وسيُصنّفها (مهم / عادي / سبام).",
    icon: Mail,
    placeholder: "نص الرسالة البريدية…",
    example:
      "تهانينا! لقد ربحت رحلة مجانية إلى دبي. اضغط على الرابط أدناه لتأكيد جائزتك خلال 24 ساعة.",
  },
  {
    id: "extract",
    webhook: "extract",
    title: "استخراج بيانات",
    description: "حوّل نصاً حراً إلى JSON منظّم (اسم، تاريخ، مبلغ…).",
    icon: Database,
    placeholder: "نص يحتوي على معلومات للاستخراج…",
    example:
      "فاتورة رقم INV-2025-0418 صادرة بتاريخ 14 مايو 2025 لصالح شركة الأفق التقنية بمبلغ 12,500 ريال.",
  },
  {
    id: "qa",
    webhook: "qa",
    title: "إجابة من قاعدة المعرفة",
    description: "اطرح سؤالاً وسيُجيب النموذج بالاعتماد على Supabase.",
    icon: MessageSquare,
    placeholder: "اكتب سؤالك…",
    example: "ما هي سياسة الإجازات لدينا؟",
  },
];

function DemoCard({ demo }: { demo: Demo }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const url = `${serviceConfig.n8nWebhookBase}/webhook/${demo.webhook}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input || demo.example }),
      });
      const text = await r.text();
      if (!r.ok) {
        try {
          const j = JSON.parse(text);
          throw new Error(j.hint || j.error || text);
        } catch {
          throw new Error(text || `HTTP ${r.status}`);
        }
      }
      try {
        const j = JSON.parse(text);
        setResult(
          typeof j === "string"
            ? j
            : j.output ?? j.result ?? j.text ?? JSON.stringify(j, null, 2),
        );
      } catch {
        setResult(text);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
    } finally {
      setLoading(false);
    }
  };

  const Icon = demo.icon;
  return (
    <Card className="bg-card/60 backdrop-blur border-border/60 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-lg bg-primary/15 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="font-semibold">{demo.title}</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {demo.description}
      </p>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={demo.placeholder}
        rows={3}
        className="bg-background/40 text-sm resize-none mb-3"
      />

      <Button
        onClick={run}
        disabled={loading}
        size="sm"
        variant="secondary"
        className="self-start"
      >
        {loading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin ms-2" />
            جارٍ التشغيل…
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 ms-2" />
            تشغيل عبر n8n
          </>
        )}
      </Button>

      {(result || error) && (
        <div
          className={
            error
              ? "mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs font-mono text-destructive whitespace-pre-wrap"
              : "mt-4 rounded-md border border-success/30 bg-success/5 p-3 text-xs whitespace-pre-wrap text-foreground/90"
          }
        >
          {error ?? result}
        </div>
      )}
    </Card>
  );
}

export function DemoTiles() {
  return (
    <section className="relative py-20 md:py-28 bg-background/40">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// SCENARIOS</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            سيناريوهات جاهزة عبر n8n
          </h2>
          <p className="mt-3 text-muted-foreground">
            كل بطاقة تستدعي workflow في n8n يستخدم Ollama و Supabase لإتمام
            المهمة. تأكد من استيراد ملفات الـ workflows من مجلد{" "}
            <code className="font-mono text-foreground/90">n8n-workflows/</code>{" "}
            وتفعيلها.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {DEMOS.map((d) => (
            <DemoCard key={d.id} demo={d} />
          ))}
        </div>
      </div>
    </section>
  );
}
