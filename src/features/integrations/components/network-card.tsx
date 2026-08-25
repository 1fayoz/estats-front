"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  AlertTriangle, ArrowRight, DownloadCloud, Loader2, Lock, Plus,
  RefreshCw, Star, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ApiError, disconnectSocialAccount, refreshSocialAccount,
  syncSocialAccount, updateSocialAccount,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { PLATFORM_ICON, PLATFORM_TINT } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type { SocialAccount, SocialPlatformRow } from "@/lib/types";

/**
 * Bitta tarmoqning ulanish kartasi.
 *
 * Har tarmoq alohida karta: ular bir-biriga o'xshamaydi (birida OAuth,
 * birida bot tokeni, uchinchisi hali ochilmagan) va bitta umumiy
 * ro'yxatga tiqilganda bu farqlar ko'rinmay qolardi.
 */
export function NetworkCard({
  row,
  accounts,
  index,
  onConnect,
  onChanged,
}: {
  row: SocialPlatformRow;
  accounts: SocialAccount[];
  index: number;
  onConnect: () => void;
  onChanged: () => void | Promise<void>;
}) {
  const [busy, setBusy] = React.useState<number | null>(null);
  const Icon = PLATFORM_ICON[row.platform];
  const tint = PLATFORM_TINT[row.platform] ?? "from-muted to-muted text-foreground";
  const connected = accounts.length > 0;

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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
    >
      <Card className="h-full overflow-hidden">
        <div className={cn("bg-gradient-to-br px-5 py-4", tint)}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-background/70 p-2.5 backdrop-blur">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">{row.label}</p>
                <p className="text-xs text-foreground/70">
                  {connected
                    ? `${accounts.length} ta akkaunt ulangan`
                    : row.unavailable
                      ? "Hozircha ochilmagan"
                      : "Ulanmagan"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              {row.capabilities?.ads && <Badge variant="info">Reklama</Badge>}
              {connected && <Badge variant="success">Faol</Badge>}
            </div>
          </div>
        </div>

        <CardContent className="space-y-3 pt-4">
          <p className="min-h-[2.5rem] text-xs leading-relaxed text-muted-foreground">
            {row.unavailable ?? row.hint}
          </p>

          {accounts.length > 0 && (
            <div className="space-y-1.5 border-t pt-3">
              {accounts.map((account) => (
                <div key={account.id} className="flex items-center gap-2 text-sm">
                  {account.isDefault ? (
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                      aria-label="Asosiy"
                    />
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
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatNumber(account.followers)}
                  </span>
                  <button
                    type="button"
                    onClick={() => act(account.id, () => syncSocialAccount(account.id), "E'lonlar tortildi")}
                    disabled={busy === account.id}
                    title="E'lonlarni tortish"
                    className="shrink-0 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <DownloadCloud className="h-3.5 w-3.5" />
                  </button>
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

              {accounts.some((a) => a.error) && (
                <p className="text-xs text-destructive">{accounts.find((a) => a.error)?.error}</p>
              )}
              {accounts.some((a) => a.warning) && (
                <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                  <span className="text-muted-foreground">
                    {accounts.find((a) => a.warning)?.warning}
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            {row.unavailable ? (
              <Button size="sm" variant="outline" className="gap-1.5" disabled>
                <Lock className="h-3.5 w-3.5" /> Ulanmaydi
              </Button>
            ) : (
              <Button size="sm" className="gap-1.5" onClick={onConnect}>
                <Plus className="h-3.5 w-3.5" />
                {connected ? "Yana qo'shish" : "Ulash"}
              </Button>
            )}
            {row.platform === "instagram" && connected && (
              <Link
                href={"/instagram" as Route}
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                Boshqarish <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
