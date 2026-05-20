import { ShieldCheck, TrendingUp, Zap } from "lucide-react";

const PROPS = [
  {
    icon: ShieldCheck,
    title: "الامتثال والخصوصية",
    desc: "بيانات مؤسستك هي أثمن أصولك. لا تغادر شبكتك أبداً، متوافقة مع أعلى معايير الحوكمة الوطنية والدولية.",
  },
  {
    icon: TrendingUp,
    title: "عائد استثمار حقيقي",
    desc: "وداعاً للفواتير الشهرية المتزايدة. استثمار واحد في البنية التحتية يمنحك استخداماً غير محدود لجميع الموظفين.",
  },
  {
    icon: Zap,
    title: "استقلالية تكنولوجية",
    desc: "لا تعتمد على مقدمي خدمة خارجيين. أنظمتك تعمل بكفاءة حتى في أكثر البيئات انعزالاً وأماناً.",
  },
];

export function ValueProp() {
  return (
    <section
      id="value-prop"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24 bg-secondary/20"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 md:mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            لماذا الذكاء الاصطناعي المحلي؟
          </h2>
          <div className="w-24 h-1 bg-primary" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {PROPS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="p-8 md:p-10 bg-secondary border border-primary/20 rounded-3xl value-card"
              >
                <div className="text-primary mb-6">
                  <Icon className="w-10 h-10" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">
                  {p.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
