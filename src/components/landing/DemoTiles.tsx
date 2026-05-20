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
  const r = await fetch("/proxy/ollama/api/tags");
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
          // proceed without context — Ollama will answer from training knowledge
        }
      }

      const prompt = buildPrompt(demo.id, text, context);

      const resp = await fetch("/proxy/ollama/api/generate", {
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
              : "mt-4 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm whitespace-pre-wrap text-foreground/90 leading-relaxed"
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
              كل عرض يعالج البيانات محلياً عبر Ollama — لا إنترنت، لا بيانات تغادر شبكتك.
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
