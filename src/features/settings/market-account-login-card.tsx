"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Clock3, Puzzle, RefreshCw, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { ApiError, fetchMarketAutoRefresh, fetchMarketTokenStatus } from "@/lib/api";
import { EXTENSION_HREF } from "@/lib/cabinet-extension";
import { formatDateTime } from "@/lib/format";
import type { MarketAutoRefresh, MarketTokenStatus } from "@/lib/types";

/**
 * Uzum MIJOZ (bozor) tokeni — raqobatchilar narxi, qidiruvdagi o'rin va bozor
 * tahlili shunga tayanadi. APP darajasida BITTA, faqat administrator ko'radi
 * (403 — karta yashiriladi, `MarketTokenCard` bilan bir xil).
 *
 * 2026-11-24 dan tokenni server brauzer ochib OLMAYDI (uzum.uz server IP'sini
 * Cloudflare tekshiruviga tushirgan edi, token 17-noyabrdan beri o'lik
 * qolgan). Uni administrator brauzeridagi eStats Lens — «Sotuvchi kabineti
 * vazifalari» yoqilgan bo'lsa — uzum.uz dan o'zi oladi va yuboradi. Qo'lda
 * kiritish (`MarketTokenCard`) zaxira bo'lib qoladi.
 */
export function MarketAccountLoginCard() {
  const [state, setState] = React.useState<MarketAutoRefresh | null>(null);
  const [token, setToken] = React.useState<MarketTokenStatus | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [next, status] = await Promise.all([fetchMarketAutoRefresh(), fetchMarketTokenStatus()]);
      setState(next);
      setToken(status);
      setForbidden(false);
      setError(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
      else setError(err instanceof ApiError ? err.message : "Token holatini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [load]);

  if (forbidden) return null;

  const minutes = token?.expiresInMinutes ?? null;
  const alive = Boolean(token?.configured && !token.isExpired && (minutes === null || minutes > 0));
  const waiting = Boolean(state?.wanted) || !alive;
  const badge = error
    ? { variant: "secondary" as const, text: "Holat noma'lum" }
    : !token
      ? { variant: "secondary" as const, text: "Tekshirilmoqda" }
      : !token.configured
        ? { variant: "warning" as const, text: "Token yo'q" }
        : !alive
          ? { variant: "warning" as const, text: "Muddati o'tgan" }
          : state?.wanted
            ? { variant: "warning" as const, text: "Yangilanish kutilmoqda" }
            : { variant: "success" as const, text: "Faol" };
  const pushedAt = state?.source === "extension" ? state.extensionPushedAt ?? null : state?.lastRunAt ?? null;

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Bozor hisobi (uzum.uz tokeni)</h3>
            <CardDescription className="leading-relaxed">
              Raqobatchilar narxi, qidiruvdagi o&apos;rin va bozor tahlili uchun. Tokenni administrator brauzeridagi
              eStats Lens o&apos;zi yangilaydi — server brauzer ochmaydi.
            </CardDescription>
          </div>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed">{error}</p>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={loading} onClick={() => { setLoading(true); void load(); }}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} /> Qayta urinish
            </Button>
          </div>
        )}

        {token && !error && (
          <div
            className={
              "flex items-start gap-3 rounded-xl border p-4 text-sm " +
              (waiting ? "border-[var(--warn)]/30 bg-[var(--warn)]/5" : "border-[var(--ok)]/25 bg-[var(--ok)]/5")
            }
          >
            {waiting
              ? <TriangleAlert className="mt-0.5 size-4 shrink-0 text-[var(--warn)]" aria-hidden />
              : <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--ok)]" aria-hidden />}
            <div className="min-w-0 space-y-1 leading-relaxed">
              <p className="font-medium">
                {!waiting
                  ? "Bozor ma'lumotlari yangilanmoqda"
                  : alive
                    ? "Token tez orada tugaydi — kengaytmadan yangisi kutilmoqda"
                    : "Bozor tokeni ishlamayapti — raqobatchi narxlari va o'rinlar yangilanmaydi"}
              </p>
              {waiting && (
                <p className="text-xs text-muted-foreground">
                  Administrator brauzerida eStats Lens o&apos;rnatilgan, eStats&apos;ga ulangan va «Sotuvchi kabineti vazifalari»
                  yoqilgan bo&apos;lsin, brauzer ochiq tursin — token bir necha daqiqada o&apos;zi yangilanadi. Shoshilinch bo&apos;lsa,
                  pastdagi kartadan qo&apos;lda kiriting.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/15 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Token muddati</p>
            <p className="flex items-center gap-2 text-sm font-medium">
              <Clock3 className="size-4 text-primary" aria-hidden />
              {!token?.configured || !token.expiresAt
                ? "—"
                : `${formatDateTime(token.expiresAt)}${alive && minutes !== null ? ` · ${minutes >= 60 ? `${Math.floor(minutes / 60)} soat ${minutes % 60} daq` : `${minutes} daq`} qoldi` : ""}`}
            </p>
          </div>
          <div className="rounded-xl border bg-muted/15 p-4">
            <p className="mb-1 text-xs text-muted-foreground">Oxirgi yangilanish</p>
            <p className="text-sm font-medium">
              {pushedAt ? formatDateTime(pushedAt) : "—"}
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {state?.source === "server" ? "· server (eski yo'l)" : "· eStats Lens (administrator brauzeri)"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <Button asChild variant="outline" className="min-h-11 rounded-xl">
            <Link href={EXTENSION_HREF as Route}>
              <Puzzle className="size-4" /> Kengaytma sozlamalari
            </Link>
          </Button>
          <p className="text-xs leading-relaxed text-muted-foreground">Hisob barcha do&apos;konlar uchun umumiy.</p>
        </div>
      </CardContent>
    </Card>
  );
}
