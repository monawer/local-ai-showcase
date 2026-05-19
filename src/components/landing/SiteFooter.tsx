import { Settings as SettingsIcon, BrainCircuit, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";

const POWERED_BY = [
  { name: "Ollama", url: null },
  { name: "OpenWebUI", url: "http://webui.localhost" },
  { name: "n8n", url: "http://n8n.localhost" },
  { name: "Supabase", url: "http://supabase.localhost" },
];

export function SiteFooter() {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-border/60 py-12 bg-background/40">
      <div className="container mx-auto max-w-6xl px-6">
        <div className="flex flex-col md:flex-row items-start justify-between gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg bg-primary/20 p-1.5 border border-primary/30">
                <BrainCircuit className="h-4 w-4 text-primary" />
              </div>
              <span className="font-bold text-sm">منصة الذكاء الاصطناعي المحلية</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
              تعمل بالكامل على شبكتك الداخلية — بدون إنترنت، بدون رسوم، بدون مخاطر خصوصية.
            </p>
          </div>

          {/* Powered by */}
          <div>
            <div className="text-xs font-mono text-muted-foreground mb-3">مدعوم بـ</div>
            <div className="flex flex-wrap gap-3">
              {POWERED_BY.map((s) =>
                s.url ? (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {s.name}
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                ) : (
                  <span key={s.name} className="text-xs text-muted-foreground">
                    {s.name}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Quick links + settings */}
          <div>
            <div className="text-xs font-mono text-muted-foreground mb-3">روابط سريعة</div>
            <div className="flex flex-wrap gap-4">
              {settings.customLinks.slice(0, 4).map((l) => (
                <a
                  key={l.id}
                  href={l.url}
                  target={l.openInNewTab ? "_blank" : undefined}
                  rel={l.openInNewTab ? "noreferrer" : undefined}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <Link
                to="/settings"
                className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <SettingsIcon className="h-3 w-3" />
                الإعدادات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
