import { User, Server } from "lucide-react";

export function Architecture() {
  return (
    <section
      id="architecture"
      className="relative py-24 md:py-32 px-6 md:px-16 lg:px-24"
      style={{
        background:
          "linear-gradient(to bottom, var(--color-background), oklch(0.355 0.073 250 / 0.5))",
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display text-4xl md:text-5xl font-bold mb-12">
          هندسة عازلة تماماً (Air-Gapped)
        </h2>

        <div className="relative p-8 md:p-12 bg-background/60 rounded-[2.5rem] border border-primary/30 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center border border-primary mb-4">
                <User className="w-10 h-10 text-primary" strokeWidth={1.5} />
              </div>
              <p className="font-display font-bold">المستخدم</p>
              <span className="text-xs text-foreground/40 mt-1">
                داخل الشبكة المحلية
              </span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent relative">
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary"
                  style={{ boxShadow: "0 0 18px oklch(0.553 0.099 246 / 0.9)" }}
                />
              </div>
              <span className="mt-4 text-[10px] uppercase tracking-widest text-primary font-bold">
                Encrypted · On-Premise
              </span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center border border-foreground/30 mb-4">
                <Server className="w-10 h-10 text-primary-foreground" strokeWidth={1.5} />
              </div>
              <p className="font-display font-bold">مركز البيانات الخاص</p>
              <span className="text-xs text-foreground/40 mt-1">
                معزول عن الإنترنت الخارجي
              </span>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-foreground/60 italic font-display text-lg">
            "السيادة الرقمية تبدأ من المكان الذي تضع فيه خوادمك."
          </div>
        </div>
      </div>
    </section>
  );
}
