import { useCallback } from "react";
import { Hero } from "@/components/landing/Hero";
import { ServicesDashboard } from "@/components/landing/ServicesDashboard";
import { ChatDemo } from "@/components/landing/ChatDemo";
import { DemoTiles } from "@/components/landing/DemoTiles";
import { Architecture } from "@/components/landing/Architecture";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function App() {
  const scrollTo = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <main className="min-h-screen">
      <Hero
        onTryChat={() => scrollTo("chat")}
        onShowServices={() => scrollTo("services")}
      />
      <ServicesDashboard />
      <ChatDemo />
      <DemoTiles />
      <Architecture />
      <SiteFooter />
    </main>
  );
}
