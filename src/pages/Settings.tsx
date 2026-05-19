import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServicesForm } from "@/components/settings/ServicesForm";
import { CustomLinksManager } from "@/components/settings/CustomLinksManager";
import { AdvancedTab } from "@/components/settings/AdvancedTab";

export default function Settings() {
  return (
    <main className="min-h-screen">
      <div className="container mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-mono text-primary mb-1">// SETTINGS</p>
            <h1 className="text-3xl font-bold tracking-tight">الإعدادات</h1>
          </div>
          <Button asChild variant="ghost">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 me-1" /> رجوع
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="services">
          <TabsList>
            <TabsTrigger value="services">الخدمات</TabsTrigger>
            <TabsTrigger value="links">الروابط السريعة</TabsTrigger>
            <TabsTrigger value="advanced">عام</TabsTrigger>
          </TabsList>
          <TabsContent value="services" className="mt-6">
            <ServicesForm />
          </TabsContent>
          <TabsContent value="links" className="mt-6">
            <CustomLinksManager />
          </TabsContent>
          <TabsContent value="advanced" className="mt-6">
            <AdvancedTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
