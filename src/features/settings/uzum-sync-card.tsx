"use client";

import * as React from "react";
import { CheckCircle2, Clock, Database, RefreshCw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError, fetchSyncState, syncEverything } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SyncState } from "@/lib/types";

/** "2 daqiqa oldin" ko'rinishidagi nisbiy vaqt. */
function ago(iso: string | null): string {
  if (!iso) return "hali yo'q";
  const minutes = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (minutes < 1) return "hozirgina";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.round(hours / 24)} kun oldin`;
}

/**
 * Uzum sync — normally nothing to do here.
 *
 * Catalog and sales refresh on a schedule, so this section exists to *show* that
 * it is happening, and to give a way out when something needs pulling right now.
 * The buttons are the exception, not the workflow.
 */
export function UzumSyncCard() {
  const [state, setState] = React.useState<SyncState | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setState(await fetchSyncState());
    } catch {
      /* magazin hali yo'q bo'lishi mumkin — jim o'tamiz */
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Sinxronizatsiya ketayotganda tez-tez, aks holda kamdan-kam so'raymiz.
  const running = Boolean(state?.catalogRunning || state?.salesRunning);
  React.useEffect(() => {
    const timer = setInterval(() => void load(), running ? 4000 : 60000);
    return () => clearInterval(timer);
  }, [running, load]);

  const onSyncNow = async () => {
    setBusy(true);
    try {
      const result = await syncEverything(30);
      toast.success(result.message);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yangilab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4" /> Uzum ma&apos;lumoti
            </CardTitle>
            <CardDescription>
              Katalog va sotuvlar avtomatik yangilanadi — hech narsa bosish shart
              emas. Bu yerdagi tugma faqat &quot;hoziroq kerak&quot; bo&apos;lgan
              holatlar uchun.
            </CardDescription>
          </div>
          <Button size="sm" onClick={onSyncNow} disabled={busy || running}>
            <RefreshCw className={cn("h-3.5 w-3.5", (busy || running) && "animate-spin")} />
            {running ? "Yangilanmoqda..." : "Hoziroq yangilash"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Row
          icon={Database}
          label="Katalog (tovarlar, narxlar)"
          running={state?.catalogRunning}
          count={state ? `${formatNumber(state.productCount)} tovar` : "—"}
          when={ago(state?.catalogSyncedAt ?? null)}
          interval={state?.catalogIntervalMinutes}
        />
        <Row
          icon={ShoppingCart}
          label="Sotuvlar"
          running={state?.salesRunning}
          count={state ? `${formatNumber(state.saleCount)} sotuv` : "—"}
          when={ago(state?.salesSyncedAt ?? null)}
          interval={state?.salesIntervalMinutes}
          extra={
            state?.salesSyncedFrom
              ? `tarix: ${state.salesSyncedFrom} … ${state.salesSyncedTo}`
              : undefined
          }
        />

        <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
          Ikki marta bosilsa ham dublikat chiqmaydi: har bir yozuv Uzum&apos;ning o&apos;z
          identifikatori bilan saqlanadi va bir vaqtda bitta import ishlaydi.
        </p>
      </CardContent>
    </Card>
  );
}

function Row({
  icon: Icon,
  label,
  running,
  count,
  when,
  interval,
  extra,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  running?: boolean;
  count: string;
  when: string;
  interval?: number;
  extra?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium">
            {label}
            {running ? (
              <Badge variant="info" className="text-[10px]">yangilanmoqda</Badge>
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {count} · {when}
            {extra ? ` · ${extra}` : ""}
          </div>
        </div>
      </div>
      {interval ? (
        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          har {interval < 60 ? `${interval} daq` : `${Math.round(interval / 60)} soat`}
        </span>
      ) : null}
    </div>
  );
}
