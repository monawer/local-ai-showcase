import { useRef } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/context/SettingsContext";
import { toast } from "sonner";

export function AdvancedTab() {
  const { settings, setSettings, update, reset } = useSettings();
  const fileRef = useRef<HTMLInputElement>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lovable-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (f: File) => {
    try {
      const text = await f.text();
      const parsed = JSON.parse(text);
      setSettings(parsed);
      toast.success("تم استيراد الإعدادات");
    } catch {
      toast.error("ملف غير صالح");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div>
            <Label className="text-xs">فترة تحديث لوحة الحالة (ثانية)</Label>
            <Input
              type="number"
              min={5}
              max={300}
              value={settings.refreshIntervalSec}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  refreshIntervalSec: Math.max(5, Number(e.target.value) || 15),
                }))
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportJson}>
            <Download className="h-4 w-4 me-1" /> تصدير JSON
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 me-1" /> استيراد JSON
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importJson(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="outline"
            onClick={() => {
              if (confirm("إعادة الإعدادات للقيم الافتراضية؟")) reset();
            }}
          >
            <RotateCcw className="h-4 w-4 me-1" /> استعادة الافتراضي
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
