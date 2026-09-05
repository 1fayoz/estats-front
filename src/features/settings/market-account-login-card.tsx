"use client";

import * as React from "react";
import { CheckCircle2, Loader2, MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError, fetchMarketAutoRefresh, startMarketLogin,
} from "@/lib/api";
import type { MarketAutoRefresh } from "@/lib/types";
import { MarketVncDialog } from "./market-vnc-dialog";

const STATUS_LABEL: Record<string, string> = {
  ok: "faol",
  needs_login: "sessiya tugagan",
  captcha: "CAPTCHA chiqdi",
  error: "xato",
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

  const load = React.useCallback(async () => {
    try {
      const next = await fetchMarketAutoRefresh();
      setState(next);
      setForbidden(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
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
    setBusy(true);
    try {
      const result = await startMarketLogin();
      if (result.status === "busy") {
        toast.error(
          "Hozir ekran boshqa ish bilan band — bir necha daqiqadan keyin qayta urinib ko'ring.",
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
  const badgeVariant =
    !connected ? "secondary" : lastStatus === "ok" || lastStatus === null ? "success" : "warning";
  const badgeText = !connected
    ? "ulanmagan"
    : lastStatus
      ? STATUS_LABEL[lastStatus] ?? lastStatus
      : "kutilmoqda";

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4" /> Bozor hisobiga ulanish
            </CardTitle>
            <CardDescription>
              Raqobatchilar narxi uchun Uzum mijoz hisobi — bir marta ulang, token
              o&apos;zi har {state?.intervalSeconds ? Math.round(state.intervalSeconds / 60) : 3}{" "}
              daqiqada yangilanaveradi.
            </CardDescription>
          </div>
          <Badge variant={badgeVariant}>{badgeText}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {connected && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {state?.connectedAt &&
                `${new Date(state.connectedAt).toLocaleString("uz-UZ")} da ulangan. `}
              {lastStatus === "ok" && state?.lastRunAt
                ? `Oxirgi yangilanish: ${new Date(state.lastRunAt).toLocaleTimeString("uz-UZ")}.`
                : null}
              {lastStatus === "needs_login" &&
                "Sessiya tugagan ko'rinadi — qayta ulaning."}
              {lastStatus === "captcha" &&
                "Uzum CAPTCHA so'radi — qayta ulanib, o'zingiz yeching."}
              {lastStatus === "error" && state?.lastMessage && ` Xato: ${state.lastMessage}`}
            </span>
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Bosganingizda brauzer oynasi shu sahifada ochiladi (VNC orqali) — parolingiz
          eStats serveriga hech qachon yuborilmaydi. Bitta hisob — barcha do&apos;konlar
          uchun umumiy.
        </p>
        <Button size="sm" onClick={onConnect} disabled={busy}>
          {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {connected ? "Qayta ulash" : "Ulash"}
        </Button>
      </CardContent>

      <MarketVncDialog
        open={vncOpen}
        onOpenChange={setVncOpen}
        onConnected={(next) => setState(next)}
      />
    </Card>
  );
}
