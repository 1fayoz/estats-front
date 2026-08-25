"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertTriangle, ArrowRight, Camera, Check, Link2, Loader2,
  RefreshCw, Send, Star, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TelegramDialog } from "./telegram-dialog";
import {
  ApiError, disconnectSocialAccount, fetchSocialAccounts, fetchSocialPlatforms,
  refreshSocialAccount, updateSocialAccount,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SocialAccount, SocialPlatformRow } from "@/lib/types";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Camera,
  telegram: Send,
  tiktok: Link2,
  linkedin: Link2,
};

/**
 * Sozlamalardagi "Tarmoqlar" bo'limi.
 *
 * Har tarmoqda BIR NECHTA akkaunt bo'lishi mumkin va bittasi asosiy —
 * "hamma joyga qo'y" degani asosiylarga qo'yiladi degani.
 */
export function NetworksCard() {
  const [platforms, setPlatforms] = React.useState<SocialPlatformRow[]>([]);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [telegramOpen, setTelegramOpen] = React.useState(false);
  const [busy, setBusy] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [rows, list] = await Promise.all([fetchSocialPlatforms(), fetchSocialAccounts()]);
      setPlatforms(rows);
      setAccounts(list);
    } catch {
      /* ulanmagan bo'lsa ham sahifa ishlashi kerak */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const act = async (id: number, fn: () => Promise<unknown>, done: string) => {
    setBusy(id);
    try {
      await fn();
      toast.success(done);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  if (loading) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tarmoqlar</CardTitle>
        <CardDescription>
          Tovarlarni bir tugma bilan bir necha tarmoqqa joylash uchun. Har tarmoqda
          bir nechta akkaunt bo&apos;lishi mumkin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {platforms.map((row) => {
          const Icon = ICONS[row.platform] ?? Link2;
          const mine = accounts.filter((a) => a.platform === row.platform);
          return (
            <div key={row.platform} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-md bg-muted p-2">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{row.label}</span>
                      {mine.length > 0 && (
                        <Badge variant="success">{`${mine.length} ta`}</Badge>
                      )}
                      {row.capabilities.ads && <Badge variant="info">Reklama</Badge>}
                    </div>
                    {row.unavailable ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">{row.unavailable}</p>
                    ) : (
                      <p className="mt-0.5 max-w-lg text-xs text-muted-foreground">{row.hint}</p>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {row.platform === "instagram" ? (
                    <Link
                      href={"/instagram" as Route}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Boshqarish <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  ) : row.unavailable ? (
                    <Button size="sm" variant="outline" disabled>
                      Ulanmaydi
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => setTelegramOpen(true)}>
                      {mine.length ? "Yana qo'shish" : "Ulash"}
                    </Button>
                  )}
                </div>
              </div>

              {mine.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t pt-3">
                  {mine.map((account) => (
                    <div key={account.id} className="flex items-center gap-2 text-sm">
                      {account.isDefault ? (
                        <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" />
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            act(account.id, () => updateSocialAccount(account.id, { isDefault: true }), "Asosiy qilindi")
                          }
                          title="Asosiy qilish"
                          className="shrink-0 text-muted-foreground hover:text-foreground"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {account.name ?? account.username ?? account.externalId}
                        {account.username && account.name ? (
                          <span className="text-muted-foreground">{` · @${account.username}`}</span>
                        ) : null}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {`${formatNumber(account.followers)} obunachi`}
                      </span>
                      {account.tokenExpired && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" /> Muddati tugagan
                        </Badge>
                      )}
                      {!account.canPublish && !account.tokenExpired && (
                        <Badge variant="warning">E&apos;lon qilolmaydi</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => act(account.id, () => refreshSocialAccount(account.id), "Yangilandi")}
                        disabled={busy === account.id}
                        title="Yangilash"
                        className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
                      >
                        {busy === account.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => act(account.id, () => disconnectSocialAccount(account.id), "Uzildi")}
                        disabled={busy === account.id}
                        title="Uzish"
                        className="shrink-0 text-destructive hover:opacity-80 disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {mine.some((a) => a.error) && (
                    <p className="text-xs text-destructive">
                      {mine.find((a) => a.error)?.error}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <p className={cn("text-xs text-muted-foreground")}>
          <Check className="mr-1 inline h-3 w-3" />
          Yulduzcha — asosiy akkaunt. &quot;Hamma joyga qo&apos;y&quot; deganda e&apos;lon
          aynan asosiylariga ketadi.
        </p>
      </CardContent>

      <TelegramDialog open={telegramOpen} onOpenChange={setTelegramOpen} onConnected={load} />
    </Card>
  );
}
