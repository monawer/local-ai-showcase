import { Button } from "@/components/ui/button";

type Props = {
  onTryChat: () => void;
  onShowServices: () => void;
};

export function Hero({ onTryChat, onShowServices }: Props) {
  return (
    <section
      id="hero"
      className="relative overflow-hidden min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 pt-24 pb-12"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{
          background:
            "linear-gradient(to left, oklch(0.355 0.073 250 / 0.25), transparent)",
        }}
        aria-hidden
      />

      <div className="max-w-6xl w-full mx-auto relative z-10">
        {/* Sovereignty badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-secondary/40 text-sm mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="text-foreground/80">سيادة كاملة على البيانات</span>
        </div>

        {/* Headline */}
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.05] tracking-tight mb-8">
          ذكاء اصطناعي
          <br />
          <span className="text-gradient">مؤسسي، تحت سيطرتك.</span>
        </h1>

        <p className="max-w-2xl text-lg md:text-2xl text-foreground/70 leading-relaxed mb-12 font-light">
          منصة متكاملة لتشغيل النماذج اللغوية المتقدمة على خوادمك الخاصة. خصوصية
          مطلقة، سرعة فائقة، وبدون تكاليف استهلاك متكررة.
        </p>

        {/* CTA */}
        <div className="flex flex-wrap gap-4">
          <Button
            size="lg"
            onClick={onTryChat}
            className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-bold rounded-xl shadow-[var(--shadow-glow)]"
          >
            ابدأ التحول الرقمي الآن
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onShowServices}
            className="px-8 md:px-10 py-5 md:py-6 text-base md:text-lg font-bold rounded-xl border-primary/40 hover:bg-secondary/60"
          >
            استعرض حالات الاستخدام
          </Button>
        </div>

        {/* KPIs */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-10">
          <Kpi value="0 ريال" label="رسوم استهلاك (API)" />
          <Kpi value="100%" label="سيادة على البيانات" />
          <Kpi value="24/7" label="عمل بدون إنترنت" />
          <Kpi value="Offline" label="استقلالية تقنية تامة" />
        </div>
      </div>
    </section>
  );
}

function Kpi({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-3xl md:text-4xl font-bold mb-1">
        {value}
      </div>
      <div className="text-sm text-foreground/50">{label}</div>
    </div>
  );
}
