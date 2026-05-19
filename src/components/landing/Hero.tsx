import { ShieldCheck, WifiOff, Scale, ArrowDown, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  onTryChat: () => void;
  onShowServices: () => void;
};

export function Hero({ onTryChat, onShowServices }: Props) {
  return (
    <section id="hero" className="relative overflow-hidden pt-16">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />

      <div className="container relative mx-auto max-w-6xl px-6 py-24 md:py-36">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success px-3 py-1">
            <ShieldCheck className="ms-0 me-1.5 h-3.5 w-3.5" />
            بياناتك لا تغادر شبكتك
          </Badge>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-foreground px-3 py-1">
            <WifiOff className="ms-0 me-1.5 h-3.5 w-3.5" />
            يعمل بدون إنترنت
          </Badge>
          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning px-3 py-1">
            <Scale className="ms-0 me-1.5 h-3.5 w-3.5" />
            ممتثل للوائح الخصوصية
          </Badge>
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight max-w-4xl">
          ذكاء اصطناعي مؤسسي…
          <br />
          <span className="text-gradient">آمن، محلي، تحت سيطرتك.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          منصة متكاملة تُشغّل النماذج اللغوية المتقدمة على سيرفرك الداخلي — بدون إرسال أي بيانات
          للخارج، وبدون رسوم اشتراك شهرية. قرارك، خوادمك، بياناتك.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={onTryChat}
            className="bg-primary hover:bg-primary/90 shadow-[var(--shadow-glow)] text-base px-7"
          >
            جرّب النموذج الآن
          </Button>
          <Button size="lg" variant="outline" onClick={onShowServices} className="text-base px-7">
            استعرض الخدمات
          </Button>
          <Button size="lg" variant="ghost" asChild className="text-base px-5 gap-2">
            <a href="http://webui.localhost" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              افتح مساعد الذكاء الكامل
            </a>
          </Button>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-3 gap-4 max-w-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">0 ريال</div>
            <div className="text-xs text-muted-foreground mt-1">رسوم API شهرية</div>
          </div>
          <div className="text-center border-x border-border/40">
            <div className="text-2xl font-bold text-primary">100%</div>
            <div className="text-xs text-muted-foreground mt-1">خصوصية البيانات</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">24/7</div>
            <div className="text-xs text-muted-foreground mt-1">توفر بلا انقطاع</div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex justify-center">
          <button
            onClick={onShowServices}
            className="flex flex-col items-center gap-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors animate-bounce"
            aria-label="مرر للأسفل"
          >
            <ArrowDown className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
