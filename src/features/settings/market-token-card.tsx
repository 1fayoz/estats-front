"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, KeyRound, MousePointerClick, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError, fetchMarketTokenStatus, fetchMarketUploader, updateMarketToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { MarketTokenStatus, MarketUploader } from "@/lib/types";

/**
 * Uzum market token — short-lived, so replacing it is a routine action.
 *
 * The token itself is never read back from the server; only whether one is set and
 * when it expires. Echoing a live credential into the page would put it in the DOM,
 * in screenshots and in browser history for no benefit.
 */
export function MarketTokenCard({ collapsible = false }: { collapsible?: boolean }) {
  const [status, setStatus] = React.useState<MarketTokenStatus | null>(null);
  const [uploader, setUploader] = React.useState<MarketUploader | null>(null);
  const [token, setToken] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [forbidden, setForbidden] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [next, up] = await Promise.all([
        fetchMarketTokenStatus(),
        fetchMarketUploader().catch(() => null),
      ]);
      setStatus(next);
      setUploader(up);
      setForbidden(false);
      setLoadError(null);
    } catch (err) {
      // Admin bo'lmaganlarga bu blok umuman ko'rinmaydi.
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
      else setLoadError(err instanceof ApiError ? err.message : "Token holatini yuklab bo'lmadi.");
    } finally {
      setLoading(false);
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
    if (saving) return;
    const clean = token.trim();
    if (clean.length < 20) {
      toast.error("Token juda qisqa ko'rinadi");
      return;
    }
    setSaving(true);
    try {
      const next = await updateMarketToken(clean);
      setStatus(next);
      setLoadError(null);
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

  const content = (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight"><KeyRound className="size-4 text-muted-foreground" /> Bozor API tokeni</h3>
            <CardDescription className="leading-relaxed">
              Token bilan qo&apos;lda ulash. Avtomatik ulanish ishlayotgan bo&apos;lsa, bu qadam kerak emas.
            </CardDescription>
          </div>
          {status && !loadError && (
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
                ? "Kiritilmagan"
                : status.isExpired
                  ? "Muddati o'tgan"
                  : status.expiresInMinutes == null ? "Faol" : `${status.expiresInMinutes} daq qoldi`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadError && <div role="alert" className="flex flex-col gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm leading-relaxed">{loadError}</p><Button variant="outline" className="min-h-11 rounded-xl" disabled={loading} onClick={() => { setLoading(true); void load(); }}><RefreshCw className={cn("size-4", loading && "animate-spin")} />Qayta urinish</Button></div>}
        {status?.configured && !status.isExpired && !loadError && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 text-sm leading-relaxed",
              expiring
                ? "border-amber-500/20 bg-amber-500/5"
                : "border-emerald-500/20 bg-emerald-500/5"
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

        {uploader && (
          <details className="group rounded-xl border bg-muted/15">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden"><span className="flex items-center gap-2"><MousePointerClick className="size-4 text-muted-foreground" /> Xatcho&apos;p orqali yangilash</span><ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
            <div className="space-y-3 border-t p-4">
            <p className="text-xs leading-relaxed text-muted-foreground">Kompyuterda quyidagi tugmani brauzeringizning xatcho&apos;plar qatoriga torting. Keyin Uzum saytida ko&apos;rsatmalarga amal qiling.</p>
            <a
              href={uploader.bookmarklet}
              onClick={(event) => event.preventDefault()}
              draggable
              className="inline-flex min-h-11 cursor-grab items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
            >
              <MousePointerClick className="h-3.5 w-3.5" /> eStats: token
            </a>
            <ol className="ml-4 list-decimal space-y-2 text-xs leading-relaxed text-muted-foreground">
              {uploader.instructions.map((line) => (
                <li key={line} className="break-words">{line}</li>
              ))}
            </ol>
            </div>
          </details>
        )}

        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void onSave(); }}>
          <Label htmlFor="market-token">API token</Label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              id="market-token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder="Bozor tokenini kiriting"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="h-11 min-w-0 rounded-xl"
              disabled={saving}
            />
            <Button type="submit" className="min-h-11 rounded-xl" disabled={saving || !token.trim()}>
              {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : null}
              {saving ? "Saqlanmoqda…" : "Tokenni saqlash"}
            </Button>
          </div>
          <details className="group">
            <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg text-xs font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">Tokenni qayerdan olaman?<ChevronDown className="size-3.5 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
          <p className="rounded-xl bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
            uzum.uz&apos;ga kiring → DevTools → Application → Local Storage →{" "}
            <span className="break-all font-mono">auth_sdk_access_token</span>. &quot;Bearer&quot;
            so&apos;zi bilan nusxalasangiz ham bo&apos;ladi — o&apos;zi olib tashlanadi.
          </p>
          </details>
        </form>
      </CardContent>
    </Card>
  );
  if (!collapsible) return content;
  return (
    <details className="group/manual min-w-0 rounded-2xl border bg-card/60">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-5 [&::-webkit-details-marker]:hidden">
        <span className="rounded-xl bg-muted p-2.5 text-muted-foreground"><Settings2 className="size-4" /></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-medium">Qo‘lda ulash</span><span className="mt-1 block text-xs text-muted-foreground">Avtomatik ulanish ishlamasa, Market tokenini kiriting.</span></span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-open/manual:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="border-t p-3 sm:p-4">{content}</div>
    </details>
  );
}
