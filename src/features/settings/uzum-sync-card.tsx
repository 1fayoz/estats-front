"use client";

import * as React from "react";
import { AlertCircle, Clock, Database, PackageX, RefreshCw, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
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
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      setState(await fetchSyncState());
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Yangilanish holatini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Sinxronizatsiya ketayotganda tez-tez, aks holda kamdan-kam so'raymiz.
  const running = Boolean(state?.catalogRunning || state?.salesRunning || state?.returnsRunning);
  React.useEffect(() => {
    const timer = setInterval(() => void load(), running ? 4000 : 60000);
    return () => clearInterval(timer);
  }, [running, load]);

  const onSyncNow = async () => {
    if (busy || running) return;
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
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Ma&apos;lumotlar yangilanishi</h3>
            <CardDescription className="leading-relaxed">
              Tovarlar, sotuvlar va qaytarishlar belgilangan vaqtda avtomatik yangilanadi.
            </CardDescription>
          </div>
          <Button variant="outline" className="min-h-11 rounded-xl" onClick={onSyncNow} disabled={busy || running || loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", (busy || running) && "animate-spin")} />
            {busy || running ? "Yangilanmoqda…" : "Hozir yangilash"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-sm leading-relaxed"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />{error}</p>
            <Button variant="outline" className="min-h-11 shrink-0 rounded-xl" disabled={loading} onClick={() => { setLoading(true); void load(); }}><RefreshCw className={cn("size-4", loading && "animate-spin")} />Qayta urinish</Button>
          </div>
        )}
        <div className="grid gap-3 xl:grid-cols-3" aria-busy={loading}>
        <Row
          icon={Database}
          label="Tovarlar katalogi"
          running={state?.catalogRunning}
          count={state ? `${formatNumber(state.productCount)} tovar` : "—"}
          when={ago(state?.catalogSyncedAt ?? null)}
          interval={state?.catalogIntervalMinutes}
          known={Boolean(state) && !error}
          stale={state?.catalogStale}
          synced={Boolean(state?.catalogSyncedAt)}
        />
        <Row
          icon={ShoppingCart}
          label="Sotuvlar"
          running={state?.salesRunning}
          count={state ? `${formatNumber(state.saleCount)} sotuv` : "—"}
          when={ago(state?.salesSyncedAt ?? null)}
          interval={state?.salesIntervalMinutes}
          known={Boolean(state) && !error}
          stale={state?.salesStale}
          synced={Boolean(state?.salesSyncedAt)}
          extra={
            state?.salesSyncedFrom
              ? `Davr: ${state.salesSyncedFrom}${state.salesSyncedTo ? ` — ${state.salesSyncedTo}` : ""}`
              : undefined
          }
        />

        <Row
          icon={PackageX}
          label="Qaytarishlar"
          running={state?.returnsRunning}
          count={state ? `${formatNumber(state.returnCount)} yozuv` : "—"}
          when="Vaqti ko'rsatilmagan"
          interval={state?.returnsIntervalMinutes}
          known={Boolean(state) && !error}
          extra={
            state?.pendingReturnQuantity
              ? `${formatNumber(state.pendingReturnQuantity)} dona yo'lda`
              : undefined
          }
        />
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">«Hozir yangilash» so&apos;nggi 30 kunlik ma&apos;lumotlarni ham tekshiradi. Mavjud yozuvlar takrorlanmaydi.</p>
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
  known,
  stale,
  synced,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  running?: boolean;
  count: string;
  when: string;
  interval?: number;
  extra?: string;
  known: boolean;
  stale?: boolean;
  synced?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4 rounded-2xl border bg-muted/15 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex size-9 items-center justify-center rounded-xl bg-background text-muted-foreground"><Icon className="size-4" /></span>
        <Badge variant={!known ? "secondary" : running ? "info" : stale ? "warning" : synced ? "success" : "secondary"}>
          {!known ? "Holat kutilmoqda" : running ? "Yangilanmoqda" : stale ? "Yangilanish kerak" : synced ? "Yangilangan" : synced === undefined && interval ? "Avtomatik" : "Kutilmoqda"}
        </Badge>
      </div>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="break-words text-xl font-semibold tracking-tight">{count}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{when}</p>
        {extra && <p className="break-words text-xs leading-relaxed text-muted-foreground">{extra}</p>}
      </div>
      <div className="mt-auto flex items-start gap-1.5 border-t pt-3 text-xs leading-relaxed text-muted-foreground">
        <Clock className="mt-0.5 size-3.5 shrink-0" />
        {interval ? `Har ${interval < 60 ? `${interval} daqiqada` : `${Math.round(interval / 60)} soatda`}` : "Yangilanish oralig'i kutilmoqda"}
      </div>
    </div>
  );
}
