import { Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/context/SettingsContext";

export function SiteFooter() {
  const { settings } = useSettings();
  return (
    <footer className="border-t border-border/60 py-10 bg-background/40">
      <div className="container mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div>
          <span className="font-mono text-primary">local-ai-server</span> · يعمل
          بدون اتصال بالإنترنت
        </div>
        <div className="flex items-center gap-5">
          {settings.customLinks.slice(0, 4).map((l) => (
            <a
              key={l.id}
              href={l.url}
              target={l.openInNewTab ? "_blank" : undefined}
              rel={l.openInNewTab ? "noreferrer" : undefined}
              className="hover:text-foreground transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <SettingsIcon className="h-4 w-4" /> الإعدادات
          </Link>
        </div>
      </div>
    </footer>
  );
}
