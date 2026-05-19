import { Settings as SettingsIcon, BrainCircuit, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "الرئيسية", href: "#hero" },
  { label: "الخدمات", href: "#services" },
  { label: "العروض التجريبية", href: "#demos" },
  { label: "حالات الاستخدام", href: "#use-cases" },
  { label: "البنية التقنية", href: "#architecture" },
];

function scrollToSection(id: string) {
  document.getElementById(id.replace("#", ""))?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 navbar-glass">
      <div className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/20 p-1.5 border border-primary/30">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <span className="font-bold text-base tracking-tight">
            منصة الذكاء الاصطناعي
            <span className="text-primary"> المحلية</span>
          </span>
        </div>

        {/* Center nav links — hidden on small screens */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-white/5"
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="bg-primary hover:bg-primary/90 shadow-[var(--shadow-glow)] gap-1.5 hidden sm:inline-flex"
          >
            <a href="http://webui.localhost" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              مساعد الذكاء
            </a>
          </Button>
          <Button asChild variant="ghost" size="icon" aria-label="الإعدادات" className="text-muted-foreground hover:text-foreground">
            <Link to="/settings">
              <SettingsIcon className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
