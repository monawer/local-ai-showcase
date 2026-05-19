import { useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/context/SettingsContext";
import { fetchWithTimeout, joinUrl } from "@/lib/service-config";

type TestResult = { ok: boolean; message: string } | null;

async function testService(
  kind: "ollama" | "n8n" | "supabase",
  url: string,
  apiKey?: string,
): Promise<TestResult> {
  try {
    let path = "";
    const headers: Record<string, string> = {};
    if (kind === "ollama") path = "/api/tags";
    if (kind === "n8n") {
      path = "/api/v1/workflows";
      if (apiKey) headers["X-N8N-API-KEY"] = apiKey;
    }
    if (kind === "supabase") path = "/auth/v1/health";

    const r = await fetchWithTimeout(joinUrl(url, path), { headers });
    if (r.ok) return { ok: true, message: `OK · HTTP ${r.status}` };
    if (r.status === 401) return { ok: false, message: "401 — مفتاح API مفقود أو خاطئ" };
    if (r.status === 403) return { ok: false, message: "403 — CORS مرفوض (فعّل OLLAMA_ORIGINS=*)" };
    return { ok: false, message: `HTTP ${r.status}` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      message: msg.includes("aborted")
        ? "انتهت المهلة"
        : `فشل الاتصال — ${msg} (غالبًا CORS أو الخدمة متوقفة)`,
    };
  }
}

function ServiceRow({ title, kind }: { title: string; kind: "ollama" | "n8n" | "supabase" }) {
  const { settings, update } = useSettings();
  const cfg = settings.services[kind];
  const [result, setResult] = useState<TestResult>(null);
  const [testing, setTesting] = useState(false);

  const setField = <K extends keyof typeof cfg>(key: K, value: (typeof cfg)[K]) => {
    update((s) => ({
      ...s,
      services: {
        ...s.services,
        [kind]: { ...s.services[kind], [key]: value },
      },
    }));
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${kind}-en`} className="text-xs text-muted-foreground">
            مفعّل
          </Label>
          <Switch
            id={`${kind}-en`}
            checked={cfg.enabled}
            onCheckedChange={(v) => setField("enabled", v)}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-xs">URL</Label>
          <Input
            value={cfg.url}
            onChange={(e) => setField("url", e.target.value)}
            placeholder="/proxy/... أو http://..."
            dir="ltr"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            المسارات النسبية مثل <code>/proxy/{kind}</code> تمرّ عبر nginx (نفس الأصل، بلا CORS).
            الروابط المطلقة تتطلّب ضبط CORS في الخدمة نفسها.
          </p>
        </div>

        {kind === "n8n" && (
          <>
            <div>
              <Label className="text-xs">Webhook Base (اختياري)</Label>
              <Input
                value={(cfg as typeof cfg & { webhookBase?: string }).webhookBase ?? ""}
                onChange={(e) => setField("webhookBase" as never, e.target.value as never)}
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-xs">X-N8N-API-KEY</Label>
              <Input
                type="password"
                value={cfg.apiKey ?? ""}
                onChange={(e) => setField("apiKey", e.target.value)}
                dir="ltr"
              />
            </div>
          </>
        )}

        {kind === "supabase" && (
          <div>
            <Label className="text-xs">Anon Key</Label>
            <Input
              type="password"
              value={(cfg as typeof cfg & { anonKey?: string }).anonKey ?? ""}
              onChange={(e) => setField("anonKey" as never, e.target.value as never)}
              dir="ltr"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <Button
            size="sm"
            variant="outline"
            disabled={testing}
            onClick={async () => {
              setTesting(true);
              setResult(null);
              const r = await testService(kind, cfg.url, cfg.apiKey);
              setResult(r);
              setTesting(false);
            }}
          >
            {testing && <Loader2 className="me-2 h-3 w-3 animate-spin" />}
            اختبار الاتصال
          </Button>
          {result && (
            <span
              className={`inline-flex items-center gap-1 text-xs ${
                result.ok ? "text-success" : "text-destructive"
              }`}
            >
              {result.ok ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {result.message}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ServicesForm() {
  return (
    <div className="grid gap-4">
      <ServiceRow title="Ollama" kind="ollama" />
      <ServiceRow title="n8n" kind="n8n" />
      <ServiceRow title="Supabase" kind="supabase" />
      <p className="text-xs text-muted-foreground">
        ⚠ المفاتيح تُخزَّن في localStorage في متصفحك المحلي فقط — لا تستخدم هذه الصفحة على جهاز عام.
      </p>
    </div>
  );
}
