import { Users, Gavel, Headphones, BarChart3, Cog, Briefcase } from "lucide-react";

const CASES = [
  {
    icon: Users,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    dept: "الموارد البشرية",
    uses: ["تصنيف وتقييم السير الذاتية", "الإجابة على استفسارات الموظفين", "صياغة وصف الوظائف"],
    demo: "صنّف هذه السيرة الذاتية لمنصب مدير مشاريع وقيّم مدى توافقها مع متطلبات الوظيفة.",
  },
  {
    icon: Gavel,
    color: "text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/20",
    dept: "الشؤون القانونية",
    uses: ["مراجعة العقود واستخلاص البنود المهمة", "تلخيص الوثائق القانونية", "تحديد المخاطر في الاتفاقيات"],
    demo: "استخرج من هذا العقد: الأطراف، مدة الاتفاقية، شروط الإنهاء، وبنود الغرامات.",
  },
  {
    icon: Headphones,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    dept: "خدمة العملاء",
    uses: ["تصنيف الشكاوى حسب الأولوية والقسم", "صياغة ردود مهنية ومتسقة", "تحليل مشاعر العملاء"],
    demo: "صنّف هذه الشكوى: 'لم أستلم طلبيتي منذ أسبوعين ولا أحد يرد' وحدد الأولوية والقسم المعني.",
  },
  {
    icon: BarChart3,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    dept: "المالية والحسابات",
    uses: ["تلخيص التقارير المالية", "استخلاص الأرقام من الفواتير", "إعداد ملخصات للمديرين"],
    demo: "لخّص هذا التقرير المالي الفصلي في نقاط رئيسية للإدارة العليا مع أبرز المؤشرات.",
  },
  {
    icon: Cog,
    color: "text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    dept: "العمليات والإنتاج",
    uses: ["تحليل تقارير الحوادث والمخاطر", "اقتراح خطوات إجراءات تصحيحية", "توثيق إجراءات العمل"],
    demo: "حلّل هذا تقرير الحادثة وقترح الإجراءات التصحيحية والوقائية المناسبة.",
  },
  {
    icon: Briefcase,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    dept: "الإدارة العليا",
    uses: ["ملخصات الاجتماعات ونقاط العمل", "تقارير تنفيذية من البيانات الخام", "إعداد العروض التقديمية"],
    demo: "لخّص محضر هذا الاجتماع واستخرج قرارات المجلس ونقاط العمل مع المسؤولين والمواعيد.",
  },
];

type UseCasesProps = {
  onTryDemo?: (example: string) => void;
};

export function UseCases({ onTryDemo }: UseCasesProps) {
  return (
    <section id="use-cases" className="relative py-20 md:py-28">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-mono text-primary mb-3">// USE CASES</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            كيف تستخدمه مؤسستك؟
          </h2>
          <p className="mt-3 text-muted-foreground">
            حالات استخدام حقيقية عبر كل أقسام المؤسسة — جاهزة للتطبيق من اليوم الأول.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CASES.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.dept}
                className={`rounded-xl border p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${c.bg} bg-card/40 backdrop-blur`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${c.bg}`}>
                    <Icon className={`h-5 w-5 ${c.color}`} />
                  </div>
                  <h3 className="font-bold">{c.dept}</h3>
                </div>

                <ul className="space-y-1.5">
                  {c.uses.map((u) => (
                    <li key={u} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className={`mt-0.5 text-xs ${c.color}`}>◆</span>
                      {u}
                    </li>
                  ))}
                </ul>

                {onTryDemo && (
                  <button
                    onClick={() => onTryDemo(c.demo)}
                    className={`mt-auto text-xs font-medium ${c.color} hover:opacity-80 transition-opacity text-start`}
                  >
                    جرّب مثالاً ←
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
