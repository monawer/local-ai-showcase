import { ShieldCheck, WifiOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  onTryChat: () => void;
  onShowServices: () => void;
};

export function Hero({ onTryChat, onShowServices }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "var(--gradient-hero)" }}
        aria-hidden
      />

      <div className="container relative mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <Badge variant="outline" className="border-success/40 bg-success/10 text-success">
            <ShieldCheck className="ms-0 me-1 h-3 w-3" />
            خصوصية كاملة
          </Badge>
          <Badge variant="outline" className="border-primary/40 bg-primary/10 text-foreground">
            <WifiOff className="ms-0 me-1 h-3 w-3" />
            بدون إنترنت
          </Badge>
          <Badge variant="outline" className="border-warning/40 bg-warning/10 text-warning">
            <Zap className="ms-0 me-1 h-3 w-3" />
            بدون رسوم API
          </Badge>
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
          ذكاؤك الاصطناعي…
          <br />
          <span className="text-gradient">داخل جدرانك.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
          منصة متكاملة تشغّل النماذج اللغوية وأتمتة العمليات وقواعد البيانات على
          سيرفر محلي معزول عن الإنترنت. بياناتك لا تغادر شبكتك، ولا تدفع مقابل كل
          استدعاء.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={onTryChat}
            className="bg-primary hover:bg-primary/90 shadow-[var(--shadow-glow)]"
          >
            جرّب النموذج الآن
          </Button>
          <Button size="lg" variant="outline" onClick={onShowServices}>
            استعرض الخدمات
          </Button>
        </div>
      </div>
    </section>
  );
}
