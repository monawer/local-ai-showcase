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
import { serviceConfig, joinUrl } from "@/lib/service-config";
import { fetchKnowledgeBase } from "@/lib/supabase";
import { getSettingsSnapshot } from "@/context/SettingsContext";

type DemoId = "summarize" | "classify" | "extract" | "qa";

type Demo = {
  id: DemoId;
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
    title: "مساعد قاعدة المعرفة",
    description:
      "اطرح أي سؤال عن سياسات الشركة أو إجراءاتها وسيُجيب النموذج من قاعدة المعرفة الداخلية.",
    icon: MessageSquare,
    badge: "الموارد البشرية",
    placeholder: "اكتب سؤالك عن سياسات الشركة…",
    example: "ما هي سياسة الإجازات السنوية ومتى يحق للموظف الجديد الحصول عليها؟",
  },
];

const SYSTEM_PROMPTS: Record<DemoId, string> = {
  summarize:
    "أنت محلل تنفيذي. لخّص النص التالي بالعربية الفصحى في صورة: ملخص تنفيذي من سطرين، ثم 3-5 نقاط رئيسية، ثم توصيات عملية. كن موجزاً ومباشراً.",
  classify:
    "أنت مصنّف مراسلات. حلّل الرسالة التالية وأعِد النتيجة بالعربية بهذا التنسيق فقط:\nالأولوية: (عالية/متوسطة/منخفضة)\nالقسم المعني: ...\nالنية: ...\nالإجراء المقترح: ...",
  extract:
    "أنت مستخلص بيانات. حوّل النص التالي إلى JSON منظّم فقط (بدون أي شرح). استخرج الحقول المفهومة من السياق مثل: contract_number, date, parties, duration, amount, currency, payment_terms.",
  qa: "أنت مساعد موارد بشرية. أجب عن سؤال الموظف بالعربية معتمداً حصراً على قاعدة المعرفة المرفقة. إذا لم تجد الإجابة فيها، قُل ذلك صراحةً. كن موجزاً ومهنياً.",
};

function extractReply(data: unknown): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data) && data.length > 0) return extractReply(data[0]);
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["response", "output", "reply", "text", "answer", "message", "result"]) {
      const v = obj[key];
      if (typeof v === "string" && v.trim()) return v;
      if (v && typeof v === "object") {
        const nested = extractReply(v);
        if (nested) return nested;
      }
    }
    return JSON.stringify(data, null, 2);
  }
  return String(data ?? "");
}

async function resolveModel(ollamaUrl: string): Promise<string> {
  const s = getSettingsSnapshot();
  const preferred = (s.services.ollama as { defaultModel?: string }).defaultModel?.trim();
  try {
    const r = await fetch(joinUrl(ollamaUrl, "api/tags"));
    if (r.ok) {
      const j = (await r.json()) as { models?: Array<{ name?: string; model?: string }> };
      const names = (j.models ?? [])
        .map((m) => m.name || m.model)
        .filter((n): n is string => !!n);
      if (preferred && names.includes(preferred)) return preferred;
      if (names.length > 0) return names[0];
    }
  } catch {
    // fall through
  }
  if (preferred) return preferred;
  throw new Error(
    "لا توجد نماذج مثبّتة في Ollama.\n\nثبّت نموذجاً عبر: ollama pull llama3.2",
  );
}

function buildPrompt(demoId: DemoId, input: string, context?: string): string {
  const system = SYSTEM_PROMPTS[demoId];
  if (demoId === "qa" && context) {
    return `${system}\n\n=== قاعدة المعرفة ===\n${context}\n\n=== سؤال الموظف ===\n${input}\n\n=== الإجابة ===`;
  }
  return `${system}\n\n=== النص ===\n${input}\n\n=== الناتج ===`;
}

export type DemoTilesHandle = {
  setInput: (text: string) => void;
};

type DemoCardProps = {
  demo: Demo;
  injectedText?: string;
  index: number;
};

function DemoCard({ demo, injectedText, index }: DemoCardProps) {
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
      const text = input.trim() || demo.example;

      // بطاقة "مساعد قاعدة المعرفة" تمر عبر n8n
      if (demo.id === "qa") {
        let context = "";
        try {
          const rows = await fetchKnowledgeBase();
          if (rows.length > 0) {
            context = rows
              .map((r) => `• [${r.category}] ${r.question}\n  ${r.answer}`)
              .join("\n");
          }
        } catch (e) {
          console.warn("knowledge base unavailable", e);
        }

        const url = joinUrl(serviceConfig.n8nWebhookBase, "qa");
        const resp = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: text, context }),
        });

        if (!resp.ok) {
          if (resp.status === 404) {
            throw new Error(
              "Webhook غير موجود (404).\n\nتأكد من استيراد وتفعيل workflow الـ qa في n8n.",
            );
          }
          const body = await resp.text().catch(() => "");
          throw new Error(`n8n أعاد HTTP ${resp.status}${body ? `: ${body}` : ""}`);
        }

        const data = await resp.json().catch(async () => await resp.text());
        const reply = extractReply(data) || "(لا توجد إجابة)";
        setResult(reply);
        return;
      }

      // باقي البطاقات: Ollama مباشرة
      const ollamaUrl = serviceConfig.ollamaUrl;
      const model = await resolveModel(ollamaUrl);
      const prompt = buildPrompt(demo.id, text);

      const resp = await fetch(joinUrl(ollamaUrl, "api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: false }),
      });

      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`Ollama أعاد HTTP ${resp.status}${body ? `: ${body}` : ""}`);
      }

      const data = await resp.json();
      const reply = extractReply(data) || "(لا توجد إجابة)";
      setResult(reply);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        if (demo.id === "qa") {
          setError(
            "تعذّر الاتصال بـ n8n.\n\nتحقق من:\n• n8n يعمل ويمكن الوصول إليه عبر " +
              serviceConfig.n8nWebhookBase +
              "\n• استيراد وتفعيل workflow الـ qa",
          );
        } else {
          setError(
            "تعذّر الاتصال بـ Ollama.\n\nتحقق من:\n• Ollama يعمل ويمكن الوصول إليه عبر " +
              serviceConfig.ollamaUrl +
              "\n• وجود نموذج مثبّت (ollama pull llama3.2)\n• إعدادات CORS عند الوصول المباشر",
          );
        }
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };


  const Icon = demo.icon;
  const seq = String(index + 1).padStart(2, "0");

  return (
    <Card className="relative bg-card/70 backdrop-blur border-border/60 p-7 flex flex-col transition-all duration-300 hover:border-primary/40 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <span
        className="absolute top-5 left-6 font-heading text-5xl font-light text-primary/15 select-none leading-none"
        aria-hidden
      >
        {seq}
      </span>

      <div className="flex items-start justify-between gap-3 mb-4 relative">
        <div className="flex items-center gap-3">
          <div className="rounded-md border border-primary/30 bg-primary/5 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="font-heading font-semibold text-lg tracking-tight">{demo.title}</h3>
        </div>
        <span className="text-[10px] font-medium tracking-[0.18em] uppercase text-muted-foreground/80 border border-border/60 px-2 py-1 rounded-sm whitespace-nowrap shrink-0">
          {demo.badge}
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{demo.description}</p>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={demo.placeholder}
        rows={4}
        className="bg-background/50 text-sm resize-none mb-4 leading-relaxed border-border/60 focus-visible:border-primary/40"
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          onClick={run}
          disabled={loading}
          size="sm"
          variant="outline"
          className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin ms-2" />
              جارٍ المعالجة…
            </>
          ) : (
            <>
              <Play className="h-3.5 w-3.5 ms-2" />
              تشغيل النموذج
            </>
          )}
        </Button>
        <button
          onClick={() => setInput(demo.example)}
          className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
        >
          <Sparkles className="h-3 w-3" />
          جرّب مثالاً
        </button>
      </div>

      {(result || error) && (
        <div className="mt-5">
          <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70 mb-2 font-mono">
            {error ? "ERROR" : "OUTPUT"}
          </div>
          <div
            className={
              error
                ? "border-l-2 border-destructive ps-4 py-1 text-xs font-mono text-destructive whitespace-pre-wrap"
                : "border-l-2 border-primary ps-4 py-1 text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed"
            }
          >
            {error ?? result}
          </div>
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
          <div className="grid md:grid-cols-12 gap-8 items-end mb-10">
            <div className="md:col-span-7">
              <p className="text-[11px] font-mono tracking-[0.25em] uppercase text-primary mb-4">
                · Ollama · Local Inference
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                أربع منصّات ذكاء تعمل
                <br />
                <span className="text-primary">داخل جدرانكم</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:border-s md:border-border/50 md:ps-8">
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                كل بطاقة تستدعي نموذج Ollama محلياً مباشرة —
                لا اشتراك، لا API خارجي، ولا بيانات تغادر شبكتكم.
              </p>
            </div>
          </div>

          <div className="h-px bg-border/40 mb-10" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 border border-border/40 rounded-lg overflow-hidden mb-10">
            {[
              { k: "نماذج جاهزة", v: "4", s: "summarize · classify · extract · qa" },
              { k: "زمن استجابة", v: "<2s", s: "متوسط على GPU محلي" },
              { k: "تكلفة API", v: "0 ﷼", s: "لا رسوم استهلاك" },
              { k: "خروج بيانات", v: "صفر", s: "Air-gapped بالكامل" },
            ].map((kpi) => (
              <div key={kpi.k} className="bg-card/60 backdrop-blur p-5">
                <div className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/80 mb-2 font-mono">
                  {kpi.k}
                </div>
                <div className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {kpi.v}
                </div>
                <div className="text-xs text-muted-foreground">{kpi.s}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {DEMOS.map((d, idx) => (
              <DemoCard
                key={d.id}
                demo={d}
                index={idx}
                injectedText={idx === 0 ? injectedText : undefined}
              />
            ))}
          </div>
        </div>
      </section>
    );
  },
);
