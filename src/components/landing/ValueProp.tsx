import { ShieldCheck, TrendingDown, Unplug, Scale } from "lucide-react";

const PROPS = [
  {
    icon: ShieldCheck,
    color: "text-success",
    bg: "bg-success/10 border-success/20",
    title: "خصوصية لا تُساوم عليها",
    desc: "بياناتك وبيانات عملائك لا تغادر شبكتك الداخلية أبداً. لا سحابة، لا خوادم خارجية.",
  },
  {
    icon: TrendingDown,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/20",
    title: "صفر رسوم استخدام شهرية",
    desc: "لا اشتراكات OpenAI أو Azure AI. ادفع مرة واحدة للأجهزة واستخدم النماذج بلا حدود.",
  },
  {
    icon: Unplug,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
    title: "استقلالية تقنية كاملة",
    desc: "لا اعتماد على موردين خارجيين. خدماتك تعمل حتى لو انقطع الإنترنت تماماً.",
  },
  {
    icon: Scale,
    color: "text-accent",
    bg: "bg-accent/10 border-accent/20",
    title: "امتثال تنظيمي مُدمج",
    desc: "متوافق مع متطلبات حماية البيانات المحلية والإقليمية — بياناتك في نطاق اختصاصك القانوني.",
  },
];

export function ValueProp() {
  return (
    <section id="value-prop" className="relative py-16 md:py-20">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="text-center mb-12">
          <p className="text-sm font-mono text-primary mb-3">// WHY LOCAL AI</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            لماذا الذكاء الاصطناعي المحلي؟
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            الذكاء الاصطناعي السحابي مريح، لكنه يكلّف أكثر مما تتوقع — مادياً وأمنياً.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROPS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`rounded-xl border p-6 flex flex-col gap-4 value-card ${p.bg}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.bg}`}>
                  <Icon className={`h-5 w-5 ${p.color}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1.5">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison bar */}
        <div className="mt-10 rounded-xl border border-border/60 bg-card/40 backdrop-blur p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-success mb-1">0 ريال</div>
              <div className="text-sm text-muted-foreground">رسوم API شهرية</div>
            </div>
            <div className="border-x border-border/40">
              <div className="text-3xl font-bold text-primary mb-1">100%</div>
              <div className="text-sm text-muted-foreground">بياناتك تبقى داخلياً</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-warning mb-1">∞</div>
              <div className="text-sm text-muted-foreground">طلبات بلا حدود أو قيود</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
