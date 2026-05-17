import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Status = "ok" | "warn" | "down" | "loading";

type Props = {
  title: string;
  icon: LucideIcon;
  status: Status;
  primary?: string;
  rows?: Array<{ label: string; value: string }>;
  note?: string;
};

const STATUS_LABEL: Record<Status, string> = {
  ok: "متصل",
  warn: "جزئي",
  down: "غير متاح",
  loading: "جارٍ الفحص…",
};

const STATUS_COLOR: Record<Status, string> = {
  ok: "bg-success",
  warn: "bg-warning",
  down: "bg-destructive",
  loading: "bg-muted-foreground",
};

export function ServiceCard({ title, icon: Icon, status, primary, rows, note }: Props) {
  return (
    <Card className="relative overflow-hidden bg-card/60 backdrop-blur border-border/60 p-6 transition-all hover:border-primary/40 hover:shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/15 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <Badge variant="outline" className="border-border/60 gap-1.5 font-normal">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              STATUS_COLOR[status],
              status === "loading" && "animate-pulse",
              status === "ok" && "animate-pulse",
            )}
          />
          {STATUS_LABEL[status]}
        </Badge>
      </div>

      {primary && (
        <div className="mt-5 text-3xl font-bold tabular-nums">
          {primary}
        </div>
      )}

      {rows && rows.length > 0 && (
        <dl className="mt-4 space-y-2 text-sm">
          {rows.map((r) => (
            <div
              key={r.label}
              className="flex items-center justify-between gap-3 border-b border-border/30 pb-1.5 last:border-0"
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="font-medium font-mono text-foreground/90 truncate max-w-[60%]">
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      {note && (
        <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{note}</p>
      )}
    </Card>
  );
}
