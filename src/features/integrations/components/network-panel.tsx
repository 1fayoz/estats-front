"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, Check, DownloadCloud, Loader2, Lock,
  Plus, RefreshCw, Star, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError, disconnectSocialAccount, refreshSocialAccount,
  syncSocialAccount, updateSocialAccount,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { NetworkIcon } from "@/components/brand/network-icons";
import { PLATFORM_TINT } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type { SocialAccount, SocialPlatformRow } from "@/lib/types";

/**
 * Bitta tarmoqning ulanish paneli.
 *
 * Har tarmoq alohida tabda, chunki ular bir-biriga o'xshamaydi: birida
 * OAuth, birida bot tokeni, uchinchisi hali ochilmagan. Bitta umumiy
 * ro'yxatda bu farqlar ko'rinmay qolardi.
 *
 * Akkauntlar RO'YXAT: bir tarmoqqa bir nechta akkaunt ulanadi (ikkita
 * do'kon, uchta kanal) va ulardan bittasi asosiy — "hamma joyga qo'y"
 * degani aynan asosiylariga qo'yiladi.
 */
export function NetworkPanel({
  row,
  accounts,
  onConnect,
  onChanged,
  children,
}: {
  row: SocialPlatformRow;
  accounts: SocialAccount[];
  onConnect: () => void;
  onChanged: () => void | Promise<void>;
  /** Tarmoqqa xos qo'shimcha (masalan Instagram'ning ko'p bosqichli oqimi). */
  children?: React.ReactNode;
}) {
  const [busy, setBusy] = React.useState<number | null>(null);
  const tint = PLATFORM_TINT[row.platform] ?? "from-muted to-muted text-foreground";

  const act = async (id: number, fn: () => Promise<unknown>, done: string) => {
    setBusy(id);
    try {
      await fn();
      toast.success(done);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className={cn("bg-gradient-to-br px-5 py-4", tint)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-background/70 p-2.5 backdrop-blur">
                <NetworkIcon platform={row.platform} colored className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{row.label}</p>
                <p className="text-xs text-foreground/70">
                  {accounts.length > 0
                    ? `${accounts.length} ta akkaunt ulangan`
                    : row.unavailable
                      ? "Hozircha ochilmagan"
                      : row.needsApp
                        ? "Avval ilova kaliti kerak"
                        : "Ulanmagan"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {row.capabilities?.ads && <Badge variant="info">Reklama</Badge>}
              {row.unavailable ? (
                <Button size="sm" variant="outline" className="gap-1.5" disabled>
                  <Lock className="h-3.5 w-3.5" /> Ulanmaydi
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={onConnect}
                  // Kalit yo'q ekan ulanishni boshlab bo'lmaydi — lekin
                  // bu "imkonsiz" emas, "quyida kalit kiriting".
                  disabled={row.needsApp}
                  title={row.needsApp ? "Quyida ilova kalitini kiriting" : undefined}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {accounts.length > 0 ? "Yana qo'shish" : "Ulash"}
                </Button>
              )}
            </div>
          </div>
        </div>

        <CardContent className="space-y-3 pt-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {row.unavailable ?? row.hint}
          </p>

          {accounts.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {row.unavailable
                ? "Bu tarmoq hozircha qo'llanmaydi."
                : row.needsApp
                  ? "Quyida ilova kalitini kiriting — shundan keyin ulash tugmasi ochiladi."
                  : "Hali akkaunt ulanmagan."}
            </p>
          ) : (
            <div className="space-y-2">
              {accounts.map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  className={cn(
                    "rounded-lg border p-3",
                    account.isDefault && "border-primary/40 bg-primary/5",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {account.name ?? account.username ?? account.externalId}
                      {account.username && account.name ? (
                        <span className="text-muted-foreground">{` · @${account.username}`}</span>
                      ) : null}
                    </span>

                    {account.isDefault ? (
                      <Badge variant="info" className="gap-1">
                        <Star className="h-3 w-3 fill-current" /> Asosiy
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 px-2 text-xs"
                        onClick={() =>
                          act(account.id, () => updateSocialAccount(account.id, { isDefault: true }), "Asosiy qilindi")
                        }
                        disabled={busy === account.id}
                      >
                        <Star className="h-3 w-3" /> Asosiy qilish
                      </Button>
                    )}

                    {account.tokenExpired && (
                      <Badge variant="destructive" className="gap-1">
                        <AlertTriangle className="h-3 w-3" /> Muddati tugagan
                      </Badge>
                    )}
                    {!account.canPublish && !account.tokenExpired && (
                      <Badge variant="warning">E&apos;lon qilolmaydi</Badge>
                    )}
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{`${formatNumber(account.followers)} obunachi`}</span>
                    <span>{`${account.postCount} e'lon`}</span>
                    {account.profileUrl && (
                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-foreground hover:underline"
                      >
                        ochish
                      </a>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => act(account.id, () => syncSocialAccount(account.id), "E'lonlar tortildi")}
                      disabled={busy === account.id}
                    >
                      <DownloadCloud className="h-3 w-3" /> E&apos;lonlarni tortish
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 gap-1 px-2 text-xs"
                      onClick={() => act(account.id, () => refreshSocialAccount(account.id), "Yangilandi")}
                      disabled={busy === account.id}
                    >
                      {busy === account.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Yangilash
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => act(account.id, () => disconnectSocialAccount(account.id), "Uzildi")}
                      disabled={busy === account.id}
                    >
                      <Trash2 className="h-3 w-3" /> Uzish
                    </Button>
                  </div>

                  {account.error && (
                    <p className="mt-2 text-xs text-destructive">{account.error}</p>
                  )}
                  {account.warning && (
                    <div className="mt-2 flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                      <span className="text-muted-foreground">{account.warning}</span>
                    </div>
                  )}
                </motion.div>
              ))}

              {accounts.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  <Check className="mr-1 inline h-3 w-3" />
                  Yulduzcha — asosiy akkaunt. &quot;Hamma tarmoqqa joylash&quot; deganda
                  e&apos;lon aynan asosiylariga ketadi; qolganlarini joylash oynasida
                  qo&apos;lda tanlaysiz.
                </p>
              )}
            </div>
          )}

          {accounts.length > 0 && row.platform === "instagram" && (
            <Link
              href={"/socials" as Route}
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              E&apos;lonlar va reklama <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </CardContent>
      </Card>

      {children}
    </div>
  );
}

/** Ulash oqimi murakkab bo'lgan tarmoq uchun sarlavha. */
export function PanelNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{children}</CardDescription>
      </CardHeader>
    </Card>
  );
}
