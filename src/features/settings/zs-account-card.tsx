"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ApiError, completeZsLogin, fetchZsSync, runZsSync, startZsLogin } from "@/lib/api";
import type { ZsSync } from "@/lib/types";
import { MarketVncDialog } from "./market-vnc-dialog";

const STATUS: Record<string, { text: string; variant: "success" | "warning" | "secondary" }> = {
  done: { text: "Yangilangan", variant: "success" },
  partial: { text: "Qisman yangilandi", variant: "warning" },
  running: { text: "Yangilanmoqda", variant: "secondary" },
  needs_login: { text: "Qayta ulash kerak", variant: "warning" },
  error: { text: "Xato", variant: "warning" },
};

function when(value?: string) {
  return value ? new Date(value).toLocaleString("uz-UZ") : "";
}

/**
 * ZoomSelling hisobiga ulanish — «Bozor» sahifalari (kategoriyalar, nishalar,
 * dinamika, narx, raqobat) ZS hisobotidan kuniga bir marta o'zi yangilanadi
 * (`estats-market` `zs_sync.py` → `estats-publish` `zs-pull.js`).
 *
 * Google'ga kirish FAQAT odamning o'zi — VNC ekrani bozor hisobi bilan
 * bir xil. Admin'dan boshqasiga 403 → karta yashiriladi.
 */
export function ZsAccountCard() {
  const [data, setData] = React.useState<ZsSync | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [vncOpen, setVncOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setData(await fetchZsSync());
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
      else setError(err instanceof ApiError ? err.message : "Holatni yuklab bo'lmadi.");
    }
  }, []);

  const running = data?.state.status === "running";
  React.useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), running ? 15_000 : 60_000);
    return () => clearInterval(timer);
  }, [load, running]);

  if (forbidden) return null;

  const state = data?.state ?? {};
  const meta = state.status ? STATUS[state.status] : undefined;

  const onConnect = async () => {
    setBusy(true);
    try {
      const result = await startZsLogin();
      if (result.status === "busy") {
        toast.error("Hozir boshqa ulanish oynasi ochiq. Birozdan keyin qayta urining.");
        return;
      }
      setVncOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ochib bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onRun = async () => {
    setBusy(true);
    try {
      await runZsSync();
      toast.success("Yangilash boshlandi — taxminan 1-2 soat davom etadi.");
      setTimeout(() => void load(), 3_000);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Boshlab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  const attention = state.status === "needs_login" || state.status === "error" || state.status === "partial";

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">ZoomSelling hisobi</h3>
            <CardDescription className="leading-relaxed">
              «Bozor» sahifalari ZoomSelling hisobotidan har kuni avtomatik yangilanadi.
            </CardDescription>
          </div>
          <Badge variant={error ? "secondary" : meta?.variant ?? "secondary"}>
            {error ? "Holat noma'lum" : !data ? "Tekshirilmoqda" : meta?.text ?? "Hali yuritilmagan"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p role="alert" className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">{error}</p>}
        {data && state.status && (
          <div
            className={
              "flex items-start gap-3 rounded-xl border p-4 text-sm " +
              (attention ? "border-amber-500/20 bg-amber-500/5"
                : state.status === "done" ? "border-emerald-500/20 bg-emerald-500/5" : "bg-muted/20")
            }
          >
            {attention ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              : running ? <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-muted-foreground" />
                : state.status === "done" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  : <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
            <div className="min-w-0 space-y-1 leading-relaxed">
              {running && <p className="font-medium">{state.stage || "Yangilanmoqda"}</p>}
              {state.status === "done" && <p className="font-medium">{`${state.as_of} ma'lumoti yuklangan`}</p>}
              {state.status === "needs_login" && <p className="font-medium">Google hisobiga qayta kirish kerak</p>}
              {(state.status === "error" || state.status === "partial") && (
                <p className="break-words">{state.error || (state.csv_failed ?? []).join("; ") || "Sabab noma'lum"}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {running ? `Boshlangan: ${when(state.started_at)}` : state.finished_at ? `Tugagan: ${when(state.finished_at)}` : ""}
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/15 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Avtomatik yangilanish</p>
            <p className="flex items-center gap-2 text-sm font-medium">
              <RefreshCw className="size-4 text-primary" />
              {`Har kuni ${data?.sync_hour ?? 13}:00 dan keyin`}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Oxirgi ma&apos;lumot</p>
            <p className="text-sm font-medium">{state.as_of ?? "—"}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <Button className="min-h-11 rounded-xl" onClick={onConnect} disabled={busy || running}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
            {state.status ? "Qayta ulash" : "Google hisobiga ulanish"}
          </Button>
          <Button variant="outline" className="min-h-11 rounded-xl" onClick={onRun} disabled={busy || running || !data}>
            <RefreshCw className={running ? "size-4 animate-spin" : "size-4"} />
            {running ? "Yangilanmoqda…" : "Hozir yangilash"}
          </Button>
        </div>
      </CardContent>

      <MarketVncDialog
        open={vncOpen}
        onOpenChange={setVncOpen}
        title="ZoomSelling — Google hisobiga kirish"
        description={
          <>
            Quyidagi oynada ZoomSelling hisoboti ochilgan Google hisobiga O&apos;ZINGIZ kiring.
            Hisobot ko&apos;ringach «Kirdim, saqlash»ni bosing — birinchi yangilash darhol boshlanadi.
          </>
        }
        save={async () => {
          const result = await completeZsLogin();
          setTimeout(() => void load(), 3_000);
          return result.status === "closed"
            ? "Sessiya saqlandi — yangilash boshlandi."
            : "Oyna yopildi.";
        }}
      />
    </Card>
  );
}
