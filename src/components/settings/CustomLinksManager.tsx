import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings, type CustomLink } from "@/context/SettingsContext";

const TEMPLATES: Array<Omit<CustomLink, "id">> = [
  { label: "Portainer", url: "http://portainer.localhost", icon: "Container", openInNewTab: true },
  { label: "Traefik", url: "http://traefik.localhost", icon: "Network", openInNewTab: true },
  { label: "Grafana", url: "http://grafana.localhost", icon: "LineChart", openInNewTab: true },
  { label: "Prometheus", url: "http://prometheus.localhost", icon: "Activity", openInNewTab: true },
  { label: "Qdrant", url: "http://qdrant.localhost", icon: "Boxes", openInNewTab: true },
  { label: "Open WebUI", url: "http://chat.localhost", icon: "MessageSquare", openInNewTab: true },
  { label: "MinIO", url: "http://minio.localhost", icon: "HardDrive", openInNewTab: true },
  { label: "Uptime Kuma", url: "http://uptime.localhost", icon: "Heart", openInNewTab: true },
];

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function CustomLinksManager() {
  const { settings, update } = useSettings();
  const links = settings.customLinks;
  const [draft, setDraft] = useState<Omit<CustomLink, "id">>({
    label: "",
    url: "",
    icon: "Link",
    openInNewTab: true,
  });

  const setLinks = (next: CustomLink[]) =>
    update((s) => ({ ...s, customLinks: next }));

  const add = (l: Omit<CustomLink, "id">) => {
    if (!l.label.trim() || !l.url.trim()) return;
    setLinks([...links, { ...l, id: uid() }]);
  };

  const remove = (id: string) => setLinks(links.filter((l) => l.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    const i = links.findIndex((l) => l.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= links.length) return;
    const copy = links.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    setLinks(copy);
  };
  const patch = (id: string, p: Partial<CustomLink>) =>
    setLinks(links.map((l) => (l.id === id ? { ...l, ...p } : l)));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_2fr_1fr_auto] items-end">
            <div>
              <Label className="text-xs">الاسم</Label>
              <Input
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                placeholder="Portainer"
              />
            </div>
            <div>
              <Label className="text-xs">الرابط</Label>
              <Input
                value={draft.url}
                onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                placeholder="http://portainer.localhost"
                dir="ltr"
              />
            </div>
            <div>
              <Label className="text-xs">أيقونة (Lucide)</Label>
              <Input
                value={draft.icon}
                onChange={(e) => setDraft({ ...draft, icon: e.target.value })}
                placeholder="Link"
                dir="ltr"
              />
            </div>
            <Button
              onClick={() => {
                add(draft);
                setDraft({ label: "", url: "", icon: "Link", openInNewTab: true });
              }}
            >
              <Plus className="h-4 w-4 me-1" /> إضافة
            </Button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">قوالب جاهزة:</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <Button
                  key={t.label}
                  size="sm"
                  variant="outline"
                  onClick={() => add(t)}
                >
                  + {t.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {links.length === 0 && (
          <p className="text-sm text-muted-foreground">لا توجد روابط بعد.</p>
        )}
        {links.map((l, i) => (
          <Card key={l.id}>
            <CardContent className="pt-4 grid gap-2 sm:grid-cols-[1fr_2fr_1fr_auto_auto] items-center">
              <Input
                value={l.label}
                onChange={(e) => patch(l.id, { label: e.target.value })}
              />
              <Input
                value={l.url}
                onChange={(e) => patch(l.id, { url: e.target.value })}
                dir="ltr"
              />
              <Input
                value={l.icon ?? ""}
                onChange={(e) => patch(l.id, { icon: e.target.value })}
                dir="ltr"
              />
              <div className="flex items-center gap-2">
                <Switch
                  checked={l.openInNewTab}
                  onCheckedChange={(v) => patch(l.id, { openInNewTab: v })}
                />
                <span className="text-xs text-muted-foreground">تبويب جديد</span>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => move(l.id, -1)} disabled={i === 0}>
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => move(l.id, 1)} disabled={i === links.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => remove(l.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
