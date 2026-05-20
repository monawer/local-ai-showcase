import { useCallback, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/landing/Hero";
import { QuickLinks } from "@/components/landing/QuickLinks";
import { ValueProp } from "@/components/landing/ValueProp";
import { ServicesDashboard } from "@/components/landing/ServicesDashboard";
import { ChatDemo } from "@/components/landing/ChatDemo";
import { DemoTiles } from "@/components/landing/DemoTiles";
import type { DemoTilesHandle } from "@/components/landing/DemoTiles";
import { UseCases } from "@/components/landing/UseCases";
import { Architecture } from "@/components/landing/Architecture";
import { SetupStatus } from "@/components/landing/SetupStatus";
import { SiteFooter } from "@/components/landing/SiteFooter";

export default function App() {
  const demoTilesRef = useRef<DemoTilesHandle>(null);

  const scrollTo = useCallback((id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleTryDemo = useCallback((example: string) => {
    demoTilesRef.current?.setInput(example);
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero
        onTryChat={() => scrollTo("chat")}
        onShowServices={() => scrollTo("services")}
      />
      <QuickLinks />
      <ValueProp />
      <ServicesDashboard />
      <SetupStatus />
      <ChatDemo />
      <DemoTiles ref={demoTilesRef} />
      <UseCases onTryDemo={handleTryDemo} />
      <Architecture />
      <SiteFooter />
    </main>
  );
}
