import Image from "next/image";
import {
  AlertOctagon,
  ArrowDown,
  ArrowUp,
  Bell,
  ChevronsUp,
  DollarSign,
  Edit3,
  MessageSquare,
  Package2,
  RefreshCw,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { MONITORING_EVENTS } from "@/data/monitoring";
import { cn } from "@/lib/utils";

const TYPE_META = {
  price_change: { label: "Narx o'zgardi", icon: DollarSign, color: "text-amber-600 dark:text-amber-400 bg-amber-500/15" },
  stock_change: { label: "Qoldiq o'zgardi", icon: Package2, color: "text-sky-600 dark:text-sky-400 bg-sky-500/15" },
  content_change: { label: "Kontent yangilandi", icon: Edit3, color: "text-violet-600 dark:text-violet-400 bg-violet-500/15" },
  rank_change: { label: "Pozitsiya o'zgardi", icon: ChevronsUp, color: "text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-500/15" },
  new_review: { label: "Yangi sharh", icon: MessageSquare, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15" },
};

const SEVERITY = {
  info: { label: "Info", variant: "info" as const },
  warning: { label: "E'tibor", variant: "warning" as const },
  alert: { label: "Diqqat!", variant: "destructive" as const },
};

function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const mins = Math.floor((now - then) / 60_000);
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function MonitoringPage() {
  const alerts = MONITORING_EVENTS.filter((e) => e.severity === "alert").length;
  const warnings = MONITORING_EVENTS.filter((e) => e.severity === "warning").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Monitoring"
        description="Mahsulotlaringizdagi har bir o'zgarish — narx, qoldiq, sarlavha, pozitsiya — har 4 soatda."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4" /> Bildirishnoma sozlash
            </Button>
            <Button size="sm">
              <RefreshCw className="h-4 w-4" /> Yangilash
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Jami hodisalar
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{MONITORING_EVENTS.length}</div>
          <div className="text-xs text-muted-foreground">oxirgi 4 kun</div>
        </Card>
        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-card p-4">
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-rose-600 dark:text-rose-400">
            <AlertOctagon className="h-3.5 w-3.5" /> Diqqat
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {alerts}
          </div>
          <div className="text-xs text-muted-foreground">muhim hodisa</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-amber-600 dark:text-amber-400">
            E'tibor talab qiluvchi
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums text-amber-600 dark:text-amber-400">
            {warnings}
          </div>
          <div className="text-xs text-muted-foreground">o'rta darajadagi</div>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Keyingi tekshiruv
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">2:18</div>
          <div className="text-xs text-muted-foreground">soat:daq</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hodisalar oqimi</CardTitle>
          <CardDescription>
            Eng yangidan eski tomonga · Telegram bot orqali ham olish mumkin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative space-y-3">
            <div className="absolute bottom-2 left-[18px] top-2 w-px bg-border" />
            {MONITORING_EVENTS.map((e) => {
              const meta = TYPE_META[e.type];
              const sev = SEVERITY[e.severity];
              const positive = (e.delta ?? 0) >= 0;
              return (
                <div key={e.id} className="relative flex items-start gap-3 pl-0">
                  <div
                    className={cn(
                      "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-background",
                      meta.color
                    )}
                  >
                    <meta.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 rounded-xl border bg-card p-3 transition-colors hover:border-primary/40">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={sev.variant}>{sev.label}</Badge>
                        <span className="text-sm font-medium">{meta.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{relativeTime(e.detectedAt)}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <Image
                        src={e.productImage}
                        alt={e.productTitle}
                        width={40}
                        height={40}
                        className="h-10 w-10 rounded-md border object-cover"
                        unoptimized
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{e.productTitle}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="line-through">{e.before}</span>
                          <span>→</span>
                          <span className="font-semibold text-foreground">{e.after}</span>
                          {e.delta !== undefined && Math.abs(e.delta) > 0.1 && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 rounded px-1 text-[10px] font-semibold",
                                positive
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                              )}
                            >
                              {positive ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
                              {Math.abs(e.delta).toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
