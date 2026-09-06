"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Clock3, ExternalLink, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import {
  ApiError, fetchMarketAutoRefresh, startMarketLogin,
} from "@/lib/api";
import type { MarketAutoRefresh } from "@/lib/types";
import { MarketVncDialog } from "./market-vnc-dialog";

const STATUS_LABEL: Record<string, string> = {
  ok: "Faol",
  needs_login: "Qayta ulash kerak",
  captcha: "Tasdiqlash kerak",
  error: "Ulanishda xato",
};

/**
 * Uzum MIJOZ (bozor) hisobiga ulanish — bir marta VNC bilan kirilgach,
 * bozor tokeni (`market-token-card.tsx`dagi qo'lda/bookmarklet
 * usuliga ZAXIRA sifatida) endi AVTOMATIK, har ~3 daqiqada
 * yangilanadi (`estats-publish`dagi `market-token-refresh.js`,
 * backend jadvali `market/auto_refresh.py`).
 *
 * `UzumSellerLoginCard` bilan bir xil naqsh, faqat do'konga bog'liq
 * emas — APP darajasida BITTA hisob, shuning uchun faqat admin
 * ko'radi (`fetchMarketAutoRefresh` 403 bo'lsa karta yashiriladi,
 * `MarketTokenCard`dagi bilan bir xil).
 */
export function MarketAccountLoginCard() {
  const [state, setState] = React.useState<MarketAutoRefresh | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [vncOpen, setVncOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchMarketAutoRefresh();
      setState(next);
      setForbidden(false);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
      else setError(err instanceof ApiError ? err.message : "Ulanish holatini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Fon jadvali 3 daqiqada bir yangilaydi — sahifa ochiq turganda
  // shuni ko'rish uchun o'zimiz ham shuncha vaqtda bir so'raymiz.
  React.useEffect(() => {
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  if (forbidden) return null;

  const onConnect = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await startMarketLogin();
      if (result.status === "busy") {
        toast.error(
          "Hozir boshqa ulanish davom etmoqda. Birozdan keyin qayta urining.",
        );
        return;
      }
      setVncOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ulanib bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  const connected = state?.connected ?? false;
  const lastStatus = state?.lastStatus ?? null;
  const anonymous = lastStatus === "ok" && state?.lastMode === "anonymous";
  const healthy = connected && lastStatus === "ok" && !anonymous;
  const needsAttention = connected && (anonymous || Boolean(lastStatus && lastStatus !== "ok"));
  const badgeVariant = !state || error || !connected
    ? "secondary"
    : lastStatus === "ok"
      ? (anonymous ? "warning" : "success")
      : lastStatus === null
        ? "secondary"
        : "warning";
  const badgeText = error
    ? "Holat noma'lum"
    : !state
      ? "Tekshirilmoqda"
      : !connected
    ? "Ulanmagan"
    : anonymous
      ? "Mehmon rejimi"
      : lastStatus
        ? STATUS_LABEL[lastStatus] ?? lastStatus
        : "Kutilmoqda";

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Bozor hisobi</h3>
            <CardDescription className="leading-relaxed">
              Raqobatchilar narxini kuzatish uchun Uzum mijoz hisobingizni ulang.
            </CardDescription>
          </div>
          <Badge variant={badgeVariant}>{badgeText}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-relaxed">{error}</p><Button variant="outline" className="min-h-11 rounded-xl" disabled={loading} onClick={() => { setLoading(true); void load(); }}><RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} />Qayta urinish</Button></div>}
        {connected && !error && (
          <div
            className={
              "flex items-start gap-3 rounded-xl border p-4 text-sm " +
              (needsAttention
                ? "border-amber-500/20 bg-amber-500/5"
                : healthy ? "border-emerald-500/20 bg-emerald-500/5" : "bg-muted/20")
            }
          >
            {needsAttention ? <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" /> : healthy ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
            <div className="min-w-0 space-y-1 leading-relaxed">
              <p className="font-medium">{healthy ? "Bozor ma'lumotlari yangilanmoqda" : needsAttention ? "Ulanishni tekshiring" : "Birinchi yangilanish kutilmoqda"}</p>
              <p className="text-xs text-muted-foreground">
              {healthy && state?.lastRunAt && `Oxirgi yangilanish: ${new Date(state.lastRunAt).toLocaleString("uz-UZ")}.`}
              {!lastStatus && state?.connectedAt && `${new Date(state.connectedAt).toLocaleString("uz-UZ")} da ulangan.`}
              {anonymous &&
                "Hozir mehmon rejimi ishlayapti. Shaxsiy hisobingizga qaytish uchun qayta ulang."}
              {lastStatus === "needs_login" &&
                "Hisobga kirish muddati tugagan. Davom etish uchun qayta ulang."}
              {lastStatus === "captcha" &&
                "Uzum qo'shimcha tasdiqlashni so'radi. Qayta ulanib, tekshiruvdan o'ting."}
              {lastStatus === "error" && (state?.lastMessage || "Hisobni yangilab bo'lmadi. Qayta ulab ko'ring.")}
              </p>
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/15 p-4"><p className="mb-1 text-xs text-muted-foreground">Avtomatik yangilanish</p><p className="flex items-center gap-2 text-sm font-medium"><RefreshCw className="size-4 text-primary" />Har {state?.intervalSeconds ? Math.round(state.intervalSeconds / 60) : 3} daqiqada</p></div>
          <div className="rounded-xl border bg-muted/15 p-4"><p className="mb-1 text-xs text-muted-foreground">Hisob doirasi</p><p className="text-sm font-medium">Barcha do&apos;konlar uchun umumiy</p></div>
        </div>
        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <Button className="min-h-11 rounded-xl" onClick={onConnect} disabled={busy || loading}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
            {busy ? "Ochilmoqda…" : connected ? "Qayta ulash" : "Bozor hisobini ulash"}
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">Ochilgan oynada Uzum hisobingizga kiring.</p>
        </div>
      </CardContent>

      <MarketVncDialog
        open={vncOpen}
        onOpenChange={setVncOpen}
        onConnected={(next) => setState(next)}
      />
    </Card>
  );
}
