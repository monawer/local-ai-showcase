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
import { fetchKnowledgeBase } from "@/lib/supabase";
import { serviceConfig, joinUrl } from "@/lib/service-config";

type Demo = {
  id: string;
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

const SYSTEM_PROMPTS: Record<string, string> = {
  summarize:
    "أنت محلل مستندات تنفيذي متخصص. مهمتك استخراج ثلاثة أقسام من النص المُدخَل:\n1. **الملخص التنفيذي** (3 جمل بالضبط)\n2. **أبرز النقاط** (قائمة bullet)\n3. **التوصيات** (قائمة مرقمة)\nالرد بالعربية الفصحى الواضحة فقط.",
  classify:
    "أنت نظام تصنيف ذكي للمراسلات. رُدّ بـ JSON فقط بدون أي نص إضافي، بهذه الحقول:\n{\"priority\": \"عاجل|عالي|متوسط|منخفض\", \"department\": \"اسم القسم\", \"action\": \"الإجراء المقترح\", \"sentiment\": \"إيجابي|سلبي|محايد\", \"summary\": \"ملخص من سطر واحد\"}",
  extract:
    "أنت محرك استخلاص بيانات منظّمة. استخرج جميع الكيانات المهمة من النص (أسماء، تواريخ، مبالغ، أرقام مرجعية، شروط) وأعِد JSON منظّماً فقط بدون أي نص إضافي.",
  qa: "أنت مساعد مؤسسي متخصص في سياسات الشركة والموارد البشرية. أجب على السؤال بناءً على السياق المُقدَّم فقط. إذا لم تجد إجابة كافية في السياق، قل 'لم أجد معلومات كافية في قاعدة المعرفة'. الرد بالعربية الفصحى.",
};

function buildPrompt(demoId: string, userInput: string, context?: string): string {
  const system = SYSTEM_PROMPTS[demoId] ?? SYSTEM_PROMPTS.summarize;
  if (demoId === "qa" && context) {
    return `${system}\n\n--- قاعدة المعرفة ---\n${context}\n--- نهاية قاعدة المعرفة ---\n\nالسؤال: ${userInput}`;
  }
  return `${system}\n\nالنص المُدخَل:\n${userInput}`;
}

async function resolveModel(): Promise<string> {
  const r = await fetch(joinUrl(serviceConfig.ollamaUrl, "api/tags"));
  if (!r.ok) throw new Error(`Ollama HTTP ${r.status}`);
  const j = (await r.json()) as { models?: Array<{ name: string }> };
  const models = j.models ?? [];
  if (models.length === 0) {
    throw new Error(
      "لم يُعثَر على نماذج في Ollama.\n\nشغّل أحد الأوامر التالية:\n  ollama pull llama3.2:3b\n  ollama pull qwen2.5:7b",
    );
  }
  return models[0].name;
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

      let model: string;
      try {
        model = await resolveModel();
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("fetch") || msg.includes("Failed") || msg.includes("NetworkError")) {
          throw new Error(
            "Ollama غير متصل.\n\nتحقق من:\n• Ollama يعمل على Windows (http://localhost:11434)\n• متغير OLLAMA_ORIGINS=* مُعرَّف\n• أعِد تشغيل Ollama بعد ضبط المتغير",
          );
        }
        throw e;
      }

      let context: string | undefined;
      if (demo.id === "qa") {
        try {
          const rows = await fetchKnowledgeBase();
          if (rows.length > 0) {
            context = rows.map((r) => `س: ${r.question}\nج: ${r.answer}`).join("\n\n");
          }
        } catch {
          // proceed without context
        }
      }

      const prompt = buildPrompt(demo.id, text, context);

      const resp = await fetch(joinUrl(serviceConfig.ollamaUrl, "api/generate"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt, stream: false }),
      });

      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        throw new Error(`Ollama أعاد HTTP ${resp.status}${body ? `: ${body}` : ""}`);
      }

      const j = (await resp.json()) as { response?: string; error?: string };
      if (j.error) throw new Error(j.error);
      setResult(j.response ?? "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "خطأ غير معروف");
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
                · AI Workflows · Live
              </p>
              <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                أربع منصّات ذكاء تعمل
                <br />
                <span className="text-primary">داخل جدرانكم</span>
              </h2>
            </div>
            <div className="md:col-span-5 md:border-s md:border-border/50 md:ps-8">
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                كل بطاقة هنا ليست عرضاً تسويقياً، بل سير عمل حقيقي يستهلكه فريقكم اليوم. تُعالج
                البيانات محلياً عبر Ollama؛ لا اشتراك، لا API خارجي، لا بيانات تغادر شبكتكم.
              </p>
            </div>
          </div>

          <div className="h-px bg-border/40 mb-10" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/40 border border-border/40 rounded-lg overflow-hidden mb-10">
            {[
              { k: "نماذج جاهزة", v: "4+", s: "Llama · Qwen · Mistral" },
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
