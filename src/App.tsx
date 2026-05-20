import { useCallback } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ValueProp } from "@/components/landing/ValueProp";
import { ServicesDashboard } from "@/components/landing/ServicesDashboard";
import { ChatDemo } from "@/components/landing/ChatDemo";
import { TechAdvisorChat } from "@/components/landing/TechAdvisorChat";
import { DemoTiles } from "@/components/landing/DemoTiles";
import { UseCases } from "@/components/landing/UseCases";
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
      <Navbar />
      <Hero
        onTryChat={() => scrollTo("chat")}
        onShowServices={() => scrollTo("use-cases")}
      />
      <ValueProp />
      <ServicesDashboard />
      <ChatDemo />
      <DemoTiles />
      <TechAdvisorChat />
      <UseCases />
      <Architecture />
      <SiteFooter />
    </main>
  );
}
