import { useState, useImperativeHandle, forwardRef, useEffect } from "react";
import {
  FileText,
  Mail,
  Database,
  MessageSquare,
  Play,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { joinUrl, serviceConfig } from "@/lib/service-config";

type Demo = {
  id: string;
  webhook: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge: string;
  placeholder: string;
  example: string;
};

const DEMOS: Demo[] = [
  {
    id: "summarize",
    webhook: "summarize",
    title: "تحليل المستندات",
    description:
      "ألصق أي وثيقة أو تقرير وسيستخلص النموذج الملخص التنفيذي والنقاط الرئيسية والتوصيات.",
    icon: FileText,
    badge: "الأكثر استخداماً",
    placeholder: "ألصق هنا نص أي وثيقة، تقرير، أو عقد…",
    example:
      "اجتمع مجلس الإدارة في الربع الأول من العام الحالي لمناقشة الأداء المالي للمجموعة. أظهرت البيانات نمواً في الإيرادات بنسبة 18% مقارنة بالفترة ذاتها من العام الماضي، مدفوعاً بتوسع قطاع التجزئة الذي حقق مبيعات بلغت 245 مليون ريال. في المقابل، ارتفعت تكاليف التشغيل بنسبة 12% نتيجة ارتفاع أسعار المواد الخام. وأوصى المجلس بمراجعة استراتيجية سلسلة التوريد وإطلاق برنامج لخفض التكاليف بنسبة 8% خلال السنة القادمة.",
  },
  {
    id: "classify",
    webhook: "classify",
    title: "تصنيف المراسلات",
    description:
      "أدخل نص رسالة أو بريد إلكتروني ليحدد النموذج الأولوية والقسم المعني والإجراء المقترح.",
    icon: Mail,
    badge: "خدمة العملاء",
    placeholder: "نص الرسالة أو البريد الإلكتروني…",
    example:
      "السلام عليكم، أنا عميل لديكم منذ ثلاث سنوات وللأسف تعرضت لتجربة سيئة جداً. قمت بشراء جهاز قبل أسبوعين وتوقف عن العمل بشكل كامل. تواصلت مع فريق الدعم ثلاث مرات ولم يصلني أي رد. أريد استبدال الجهاز فوراً أو استرداد المبلغ كاملاً، وإلا سأضطر لرفع شكوى رسمية لحماية المستهلك.",
  },
  {
    id: "extract",
    webhook: "extract",
    title: "استخلاص البيانات",
    description:
      "حوّل نصاً حراً — عقداً أو فاتورة أو نموذجاً — إلى بيانات JSON منظّمة وجاهزة للأنظمة.",
    icon: Database,
    badge: "أتمتة البيانات",
    placeholder: "نص العقد أو الفاتورة أو النموذج…",
    example:
      "عقد خدمات رقم CSA-2025-0892 المبرم بتاريخ الثاني من يناير 2025 بين شركة الأفق للتقنية (الطرف الأول) وشركة النخبة للاستشارات (الطرف الثاني). تتعهد الشركة الأولى بتقديم خدمات تطوير البرمجيات لمدة اثني عشر شهراً بقيمة إجمالية قدرها 480,000 ريال، تُسدَّد على أقساط شهرية متساوية.",
  },
  {
    id: "qa",
    webhook: "qa",
    title: "مساعد قاعدة المعرفة",
    description:
      "اطرح أي سؤال عن سياسات الشركة أو إجراءاتها وسيُجيب النموذج من قاعدة المعرفة الداخلية.",
    icon: MessageSquare,
    badge: "الموارد البشرية",
    placeholder: "اكتب سؤالك عن سياسات الشركة…",
    example: "ما هي سياسة الإجازات السنوية ومتى يحق للموظف الجديد الحصول عليها؟",
  },
];

export type DemoTilesHandle = {
  setInput: (text: string) => void;
};

type DemoCardProps = {
  demo: Demo;
  injectedText?: string;
};

function DemoCard({ demo, injectedText }: DemoCardProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (injectedText) {
      setInput(injectedText);
      setResult(null);
      setError(null);
    }
  }, [injectedText]);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const url = joinUrl(serviceConfig.n8nWebhookBase, demo.webhook);
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: input || demo.example }),
      });
      const text = await r.text();
      if (!r.ok) {
        try {
          const j = JSON.parse(text) as { hint?: string; error?: string };
          throw new Error(j.hint ?? j.error ?? text);
        } catch {
          throw new Error(text || `HTTP ${r.status}`);
        }
      }
      try {
        const j = JSON.parse(text) as Record<string, unknown>;
        setResult(
          typeof j === "string"
            ? j
            : String(j.output ?? j.result ?? j.text ?? JSON.stringify(j, null, 2)),
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
    <Card className="bg-card/60 backdrop-blur border-border/60 p-6 flex flex-col transition-all duration-200 hover:border-primary/30">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-semibold">{demo.title}</h3>
        </div>
        <span className="text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
          {demo.badge}
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{demo.description}</p>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={demo.placeholder}
        rows={4}
        className="bg-background/40 text-sm resize-none mb-3 leading-relaxed"
      />

      <div className="flex items-center gap-2">
        <Button onClick={run} disabled={loading} size="sm" className="bg-primary hover:bg-primary/90">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin ms-2" />
              جارٍ المعالجة…
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 ms-2" />
              تشغيل
            </>
          )}
        </Button>
        <button
          onClick={() => setInput(demo.example)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          جرّب مثالاً
        </button>
      </div>

      {(result || error) && (
        <div
          className={
            error
              ? "mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-xs font-mono text-destructive whitespace-pre-wrap"
              : "mt-4 rounded-md border border-success/30 bg-success/5 p-3 text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed"
          }
        >
          {error ?? result}
        </div>
      )}
    </Card>
  );
}

export const DemoTiles = forwardRef<DemoTilesHandle, Record<string, never>>(
  function DemoTilesInner(_props, ref) {
    const [injectedText, setInjectedText] = useState<string | undefined>(undefined);

    useImperativeHandle(ref, () => ({
      setInput(text: string) {
        setInjectedText(text);
        document.getElementById("demos")?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    }));

    return (
      <section id="demos" className="relative py-20 md:py-28 bg-background/40">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-mono text-primary mb-3">// LIVE DEMOS</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              عروض تجريبية تعمل الآن
            </h2>
            <p className="mt-3 text-muted-foreground">
              كل عرض يعالج البيانات محلياً عبر Ollama و n8n — لا إنترنت، لا بيانات تغادر شبكتك.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {DEMOS.map((d, idx) => (
              <DemoCard
                key={d.id}
                demo={d}
                injectedText={idx === 0 ? injectedText : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    );
  },
);
