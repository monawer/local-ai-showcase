import { ExternalLink, Link as LinkIcon, type LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/context/SettingsContext";

function resolveIcon(name?: string): LucideIcon {
  if (!name) return LinkIcon;
  const Comp = (Icons as unknown as Record<string, LucideIcon>)[name];
  return Comp ?? LinkIcon;
}

export function QuickLinks() {
  const { settings } = useSettings();
  const links = settings.customLinks;

  if (links.length === 0) return null;

  return (
    <section className="container mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-sm font-mono text-primary">// QUICK LINKS</h2>
        <Button asChild variant="ghost" size="sm">
          <Link to="/settings">إدارة الروابط</Link>
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => {
          const Icon = resolveIcon(l.icon);
          return (
            <Button
              key={l.id}
              asChild
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <a
                href={l.url}
                target={l.openInNewTab ? "_blank" : undefined}
                rel={l.openInNewTab ? "noreferrer" : undefined}
              >
                <Icon className="h-4 w-4" />
                {l.label}
                {l.openInNewTab && (
                  <ExternalLink className="h-3 w-3 opacity-60" />
                )}
              </a>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
