import { useCallback } from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Hero } from "@/components/landing/Hero";
import { QuickLinks } from "@/components/landing/QuickLinks";
import { ServicesDashboard } from "@/components/landing/ServicesDashboard";
import { ChatDemo } from "@/components/landing/ChatDemo";
import { DemoTiles } from "@/components/landing/DemoTiles";
import { Architecture } from "@/components/landing/Architecture";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { Button } from "@/components/ui/button";

export default function App() {
  const scrollTo = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-screen">
      <div className="fixed top-3 end-3 z-50">
        <Button asChild variant="outline" size="icon" aria-label="الإعدادات">
          <Link to="/settings">
            <SettingsIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
      <Hero
        onTryChat={() => scrollTo("chat")}
        onShowServices={() => scrollTo("services")}
      />
      <QuickLinks />
      <ServicesDashboard />
      <ChatDemo />
      <DemoTiles />
      <Architecture />
      <SiteFooter />
    </main>
  );
}
