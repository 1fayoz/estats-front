"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Globe, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError, fetchMarketTokenStatus, updateMarketToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { MarketTokenStatus } from "@/lib/types";

/**
 * Uzum market token — short-lived, so replacing it is a routine action.
 *
 * The token itself is never read back from the server; only whether one is set and
 * when it expires. Echoing a live credential into the page would put it in the DOM,
 * in screenshots and in browser history for no benefit.
 */
export function MarketTokenCard() {
  const [status, setStatus] = React.useState<MarketTokenStatus | null>(null);
  const [token, setToken] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [forbidden, setForbidden] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setStatus(await fetchMarketTokenStatus());
      setForbidden(false);
    } catch (err) {
      // Admin bo'lmaganlarga bu blok umuman ko'rinmaydi.
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Muddat sanog'i sahifa ochiq turganda ham haqiqiy qolsin.
  React.useEffect(() => {
    if (status?.expiresInMinutes == null) return;
    const timer = setInterval(() => void load(), 60_000);
    return () => clearInterval(timer);
  }, [status?.expiresInMinutes, load]);

  const onSave = async () => {
    const clean = token.trim();
    if (clean.length < 20) {
      toast.error("Token juda qisqa ko'rinadi");
      return;
    }
    setSaving(true);
    try {
      const next = await updateMarketToken(clean);
      setStatus(next);
      setToken("");
      toast.success(
        next.expiresInMinutes
          ? `Token saqlandi — ${next.expiresInMinutes} daqiqa amal qiladi`
          : "Token saqlandi"
      );
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  if (forbidden) return null;

  const expiring = status?.expiresInMinutes != null && status.expiresInMinutes < 30;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" /> Bozor ma&apos;lumoti
            </CardTitle>
            <CardDescription>
              Raqobatchilar narxini ko&apos;rsatish uchun uzum.uz tokeni. U qisqa
              muddatli (~3 soat), shuning uchun vaqti-vaqti bilan yangilab turasiz.
            </CardDescription>
          </div>
          {status && (
            <Badge
              variant={
                !status.configured || status.isExpired
                  ? "secondary"
                  : expiring
                    ? "warning"
                    : "success"
              }
            >
              {!status.configured
                ? "kiritilmagan"
                : status.isExpired
                  ? "muddati o'tgan"
                  : `${status.expiresInMinutes} daq qoldi`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.configured && !status.isExpired && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 text-sm",
              expiring
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-emerald-500/40 bg-emerald-500/5"
            )}
          >
            {expiring ? (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>
              {expiring
                ? "Token tez orada tugaydi — yangilab qo'ying."
                : "Token faol, bozor narxlari ko'rsatilmoqda."}
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="market-token">Yangi token</Label>
          <div className="flex gap-2">
            <Input
              id="market-token"
              autoComplete="off"
              spellCheck={false}
              placeholder="eyJraWQiOiI…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="font-mono text-sm"
            />
            <Button size="sm" onClick={onSave} disabled={saving}>
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              Saqlash
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            uzum.uz&apos;ga kiring → DevTools → Network → istalgan so&apos;rovning{" "}
            <span className="font-mono">Authorization</span> sarlavhasi.
            &quot;Bearer&quot; so&apos;zi bilan nusxalasangiz ham bo&apos;ladi — o&apos;zi
            olib tashlanadi.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
