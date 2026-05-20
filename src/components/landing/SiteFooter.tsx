import { Settings as SettingsIcon, BrainCircuit } from "lucide-react";
import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-12 px-6 md:px-16 lg:px-24 bg-background/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/20 p-2 border border-primary/30">
            <BrainCircuit className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-display font-bold text-sm">
              منصة الذكاء الاصطناعي المؤسسي
            </div>
            <div className="text-xs text-foreground/50 mt-0.5">
              © {new Date().getFullYear()} — تحت سيطرتك بالكامل.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-foreground/60">
          <a href="#value-prop" className="hover:text-primary transition-colors">
            الالتزام والأمان
          </a>
          <a href="#architecture" className="hover:text-primary transition-colors">
            البنية التقنية
          </a>
          <a href="#use-cases" className="hover:text-primary transition-colors">
            حالات الاستخدام
          </a>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1.5 hover:text-primary transition-colors"
          >
            <SettingsIcon className="h-4 w-4" />
            الإعدادات
          </Link>
        </div>
      </div>
    </footer>
  );
}
