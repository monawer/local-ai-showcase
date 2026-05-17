import { createFileRoute } from "@tanstack/react-router";
import { useCallback } from "react";
import { Hero } from "@/components/landing/Hero";
import { ServicesDashboard } from "@/components/landing/ServicesDashboard";
import { ChatDemo } from "@/components/landing/ChatDemo";
import { DemoTiles } from "@/components/landing/DemoTiles";
import { Architecture } from "@/components/landing/Architecture";
import { SiteFooter } from "@/components/landing/SiteFooter";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
