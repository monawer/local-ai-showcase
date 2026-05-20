import { useState } from "react";

const CASES = [
  {
    title: "تحليل العقود القانونية",
    desc: "مراجعة آلاف الصفحات في ثوانٍ لاستخراج المخاطر والبنود الحرجة بخصوصية تامة.",
    demo: "استخرج من هذا العقد: الأطراف، مدة الاتفاقية، شروط الإنهاء، وبنود الغرامات.",
  },
  {
    title: "مساعد قاعدة المعرفة",
    desc: "حوّل وثائق مؤسستك الداخلية إلى مرجع تفاعلي يجيب على استفسارات الموظفين بدقة.",
    demo: "اشرح سياسة الإجازات المعتمدة لدينا، وحدد فروقات سياسة العمل عن بُعد بين الأقسام.",
  },
  {
    title: "أتمتة تقارير الأداء",
    desc: "استخلاص الـ KPIs من البيانات غير المهيكلة وصياغة ملخصات تنفيذية فورية.",
    demo: "كيف يمكننا تحسين كفاءة سلاسل الإمداد بناءً على تقارير الربع الثالث؟",
  },
];

type Props = {
  onTryDemo?: (example: string) => void;
};

export function UseCases({ onTryDemo: _onTryDemo }: Props = {}) {
  const [active, setActive] = useState(0);
  const current = CASES[active]!;

  return (
    <section
      id="use-cases"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Left: list */}
        <div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-8 leading-tight">
            صُمّم لمواجهة تحديات
            <br />
            المؤسسة الكبرى
          </h2>
          <div className="space-y-4">
            {CASES.map((c, i) => (
              <button
                key={c.title}
                onClick={() => setActive(i)}
                className={`block w-full text-start p-6 rounded-2xl transition-all ${
                  active === i
                    ? "bg-secondary/60 border-r-4 border-primary"
                    : "hover:bg-secondary/40 border-r-4 border-transparent"
                }`}
              >
                <h4 className="font-display font-bold text-xl mb-2">
                  {c.title}
                </h4>
                <p className="text-foreground/60 leading-relaxed">{c.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Right: mock chat */}
        <div className="relative">
          <div className="aspect-square bg-secondary rounded-3xl overflow-hidden border border-primary/20 shadow-2xl relative">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom right, oklch(0.553 0.099 246 / 0.20), transparent)",
              }}
            />
            <div className="p-6 md:p-8 flex flex-col h-full relative">
              <div className="flex gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-destructive/80" />
                <div className="w-3 h-3 rounded-full bg-warning/80" />
                <div className="w-3 h-3 rounded-full bg-success/80" />
              </div>

              <div className="space-y-4 flex-1 overflow-hidden">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex-shrink-0" />
                  <div className="bg-background p-4 rounded-xl rounded-tr-none text-sm leading-relaxed max-w-[85%]">
                    {current.demo}
                  </div>
                </div>
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-lg bg-foreground/20 flex-shrink-0" />
                  <div className="bg-secondary border border-primary/30 p-4 rounded-xl rounded-tl-none text-sm leading-relaxed max-w-[85%]">
                    بناءً على تحليل البيانات الداخلية، إليك الملخص التنفيذي
                    والتوصيات التشغيلية ذات الأولوية…
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="h-12 bg-background rounded-xl flex items-center px-4 text-xs text-foreground/40 border border-primary/20">
                  اسأل نموذجك الخاص…
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
