"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertTriangle, ArrowRight, Check, DownloadCloud, ExternalLink,
  FileText, Info, Link2, Loader2, Lock, Plus, RefreshCw, Star, Trash2, Users,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ApiError, disconnectSocialAccount, refreshSocialAccount,
  syncSocialAccount, updateSocialAccount,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { NetworkIcon } from "@/components/brand/network-icons";
import { PLATFORM_TINT } from "@/lib/platforms";
import { cn } from "@/lib/utils";
import type { SocialAccount, SocialPlatformRow } from "@/lib/types";

type AccountAction = "default" | "sync" | "refresh" | "disconnect";

export function NetworkPanel({
  row,
  accounts,
  onConnect,
  onChanged,
  connecting = false,
  children,
}: {
  row: SocialPlatformRow;
  accounts: SocialAccount[];
  onConnect: () => void;
  onChanged: () => void | Promise<void>;
  connecting?: boolean;
  children?: React.ReactNode;
}) {
  const [busy, setBusy] = React.useState<{ id: number; action: AccountAction } | null>(null);
  const [disconnectTarget, setDisconnectTarget] = React.useState<SocialAccount | null>(null);
  const working = React.useRef(false);
  const cancelDisconnect = React.useRef<HTMLButtonElement>(null);
  const disconnectTrigger = React.useRef<HTMLButtonElement | null>(null);
  const panelHeading = React.useRef<HTMLHeadingElement>(null);
  const tint = PLATFORM_TINT[row.platform] ?? "from-muted to-muted text-foreground";
  const blocked = busy !== null || connecting;

  const act = async (
    account: SocialAccount,
    action: AccountAction,
    execute: () => Promise<unknown>,
    done: string,
  ) => {
    if (working.current || connecting) return;
    working.current = true;
    setBusy({ id: account.id, action });
    try {
      await execute();
      if (action === "disconnect") setDisconnectTarget(null);
      toast.success(done);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Bajarilmadi. Qayta urinib ko‘ring.");
    } finally {
      working.current = false;
      setBusy(null);
    }
  };

  return (
    <div className="min-w-0 space-y-5">
      <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
        <div className={cn("border-b border-border/60 bg-gradient-to-br p-4 sm:p-6", tint)}>
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-background/70 bg-background/80 shadow-sm">
                <NetworkIcon platform={row.platform} colored className="size-6" />
              </div>
              <div className="min-w-0">
                <h2 ref={panelHeading} tabIndex={-1} className="break-words text-lg font-semibold text-foreground outline-none">{row.label}</h2>
                <p className="mt-1 text-sm text-foreground/70">
                  {accounts.length > 0
                    ? accounts.length + " ta akkaunt ulangan"
                    : row.unavailable
                      ? "Hozircha mavjud emas"
                      : row.needsApp
                        ? "Ilova kalitini kiriting"
                        : "Akkauntingizni ulashga tayyor"}
                </p>
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:justify-end">
              {row.capabilities?.ads && <Badge variant="info" className="rounded-lg px-2.5 py-1">Reklama</Badge>}
              <Button
                type="button"
                variant={row.unavailable ? "outline" : "default"}
                className={cn(
                  "h-11 flex-1 rounded-xl px-4 sm:flex-none motion-reduce:transition-none",
                  !row.unavailable && "bg-emerald-600 text-white hover:bg-emerald-700",
                )}
                onClick={() => {
                  if (!blocked && !row.needsApp && !row.unavailable) onConnect();
                }}
                disabled={Boolean(row.unavailable) || row.needsApp || blocked}
                aria-describedby={row.needsApp || row.unavailable ? row.platform + "-connection-hint" : undefined}
              >
                {connecting
                  ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" />
                  : row.unavailable ? <Lock className="size-4" /> : <Plus className="size-4" />}
                {connecting ? "Ulanmoqda…" : row.unavailable ? "Hozircha yopiq" : accounts.length > 0 ? "Akkaunt qo‘shish" : "Akkauntni ulash"}
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="min-w-0 space-y-5 p-4 sm:p-6">
          {(row.unavailable || row.hint || row.needsApp) && (
            <div id={row.platform + "-connection-hint"} className="flex min-w-0 items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p className="min-w-0 break-words">
                {row.unavailable ?? row.hint}
                {!row.unavailable && row.needsApp && " Ulanishni boshlash uchun quyida ilova kalitlarini kiriting."}
              </p>
            </div>
          )}

          {accounts.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed bg-muted/20 px-5 py-9 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-background shadow-sm">
                {row.unavailable ? <Lock className="size-6 text-muted-foreground" /> : <Link2 className="size-6 text-emerald-600 dark:text-emerald-400" />}
              </div>
              <h3 className="font-semibold">{row.unavailable ? "Bu tarmoq hozircha ochilmagan" : "Birinchi akkauntingizni ulang"}</h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                {row.unavailable
                  ? "Mavjud tarmoqlardan birini tanlab, akkauntlaringizni ulashingiz mumkin."
                  : row.needsApp
                    ? "Ilova sozlamalarini quyida to‘ldiring. Keyin shu yerdan akkauntingizni ulashingiz mumkin."
                    : "Ulangan akkauntlar, ularning holati va boshqaruv tugmalari shu yerda ko‘rinadi."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {accounts.map((account) => {
                const name = account.name ?? account.username ?? account.externalId;
                const isBusy = busy?.id === account.id;
                return (
                  <article
                    key={account.id}
                    aria-label={name}
                    aria-busy={isBusy}
                    className={cn(
                      "min-w-0 rounded-2xl border p-4 transition-colors duration-200 sm:p-5 motion-reduce:transition-none",
                      account.isDefault
                        ? "border-emerald-500/25 bg-emerald-500/[0.035]"
                        : "border-border/70 bg-background",
                    )}
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words font-semibold [overflow-wrap:anywhere]">{name}</h3>
                        {account.username && account.name && (
                          <p className="mt-1 break-words text-sm text-muted-foreground [overflow-wrap:anywhere]">{"@" + account.username}</p>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-wrap gap-1.5">
                        {account.isDefault && (
                          <Badge variant="success" className="gap-1 rounded-lg px-2.5 py-1">
                            <Star className="size-3 fill-current" /> Asosiy
                          </Badge>
                        )}
                        {account.tokenExpired ? (
                          <Badge variant="destructive" className="gap-1 whitespace-normal rounded-lg">
                            <AlertTriangle className="size-3 shrink-0" /> Muddati tugagan
                          </Badge>
                        ) : !account.canPublish ? (
                          <Badge variant="warning" className="whitespace-normal rounded-lg">E&apos;lon qilolmaydi</Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 rounded-lg text-emerald-700 dark:text-emerald-400">
                            <Check className="size-3" /> Faol
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="min-w-0 rounded-xl bg-muted/50 p-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="size-3.5 shrink-0" /> Obunachilar</p>
                        <p className="mt-1 break-words font-semibold tabular-nums">{formatNumber(account.followers)}</p>
                      </div>
                      <div className="min-w-0 rounded-xl bg-muted/50 p-3">
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><FileText className="size-3.5 shrink-0" /> E&apos;lonlar</p>
                        <p className="mt-1 break-words font-semibold tabular-nums">{formatNumber(account.postCount)}</p>
                      </div>
                    </div>

                    {account.error && (
                      <p role="alert" className="mt-3 break-words rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm leading-relaxed text-destructive [overflow-wrap:anywhere]">{account.error}</p>
                    )}
                    {account.warning && (
                      <div className="mt-3 flex min-w-0 items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-relaxed">
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
                        <p className="min-w-0 break-words text-muted-foreground [overflow-wrap:anywhere]">{account.warning}</p>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-auto rounded-xl px-3 sm:flex-none"
                        onClick={() => void act(account, "sync", () => syncSocialAccount(account.id), "E’lonlar tortildi")}
                        disabled={blocked}
                        aria-label={name + ": e’lonlarni tortish"}
                      >
                        {isBusy && busy.action === "sync" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <DownloadCloud className="size-4" />}
                        E&apos;lonlarni tortish
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 flex-auto rounded-xl px-3 sm:flex-none"
                        onClick={() => void act(account, "refresh", () => refreshSocialAccount(account.id), "Yangilandi")}
                        disabled={blocked}
                        aria-label={name + ": yangilash"}
                      >
                        {isBusy && busy.action === "refresh" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <RefreshCw className="size-4" />}
                        Yangilash
                      </Button>
                      {!account.isDefault && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-11 flex-auto rounded-xl px-3 sm:flex-none"
                          onClick={() => void act(account, "default", () => updateSocialAccount(account.id, { isDefault: true }), "Asosiy qilindi")}
                          disabled={blocked}
                          aria-label={name + ": asosiy qilish"}
                        >
                          {isBusy && busy.action === "default" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <Star className="size-4" />}
                          Asosiy qilish
                        </Button>
                      )}
                      {account.profileUrl && (
                        <Button asChild variant="ghost" className="h-11 flex-auto rounded-xl px-3 sm:flex-none">
                          <a href={account.profileUrl} target="_blank" rel="noreferrer" aria-label={name + ": profilni yangi oynada ochish"}>
                            Profil <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 flex-auto rounded-xl px-3 text-destructive hover:bg-destructive/10 hover:text-destructive sm:ml-auto sm:flex-none"
                        onClick={(event) => {
                          if (!working.current && !connecting) {
                            disconnectTrigger.current = event.currentTarget;
                            setDisconnectTarget(account);
                          }
                        }}
                        disabled={blocked}
                        aria-label={name + ": ulanishni uzish"}
                      >
                        <Trash2 className="size-4" /> Uzish
                      </Button>
                    </div>
                  </article>
                );
              })}

              {accounts.length > 1 && (
                <div className="flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
                  <Star className="mt-0.5 size-4 shrink-0" />
                  <p>Asosiy akkaunt &quot;Hamma tarmoqqa joylash&quot; uchun avtomatik tanlanadi. Qolgan akkauntlarni e&apos;lon joylashda qo&apos;lda tanlashingiz mumkin.</p>
                </div>
              )}
            </div>
          )}

          {accounts.length > 0 && row.platform === "instagram" && (
            <Button asChild variant="outline" className="h-11 w-full rounded-xl sm:w-auto">
              <Link href={"/socials" as Route}>E&apos;lonlar va reklama <ArrowRight className="size-4" /></Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {children}

      <Dialog open={disconnectTarget !== null} onOpenChange={(open) => {
        if (!open && !working.current) setDisconnectTarget(null);
      }}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 motion-reduce:animate-none [&>button:last-child]:right-2 [&>button:last-child]:top-2 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelDisconnect.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const trigger = disconnectTrigger.current;
            if (trigger?.isConnected && !trigger.disabled) trigger.focus();
            else panelHeading.current?.focus();
          }}
        >
          <DialogHeader className="pr-8">
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><Link2 className="size-5" /></div>
            <DialogTitle>Akkaunt ulanishi uzilsinmi?</DialogTitle>
            <DialogDescription className="break-words leading-relaxed [overflow-wrap:anywhere]">
              <span className="font-medium text-foreground">{disconnectTarget?.name ?? disconnectTarget?.username ?? disconnectTarget?.externalId}</span>
              {" akkauntiga eStats orqali e’lon yuborish to‘xtaydi. Keyin uni qayta ulashingiz mumkin."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t pt-4">
            <Button ref={cancelDisconnect} type="button" variant="outline" className="h-11 rounded-xl" disabled={blocked} onClick={() => setDisconnectTarget(null)}>Bekor qilish</Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11 rounded-xl"
              disabled={blocked}
              onClick={() => {
                if (disconnectTarget) void act(disconnectTarget, "disconnect", () => disconnectSocialAccount(disconnectTarget.id), "Ulanish uzildi");
              }}
            >
              {busy?.action === "disconnect" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <Trash2 className="size-4" />}
              {busy?.action === "disconnect" ? "Uzilmoqda…" : "Ulanishni uzish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function PanelNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="min-w-0 rounded-2xl border-border/70 bg-muted/20 shadow-none">
      <CardHeader className="gap-2 p-4 sm:p-5">
        <CardTitle className="flex items-center gap-2 text-base"><Info className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />{title}</CardTitle>
        <CardDescription className="break-words leading-relaxed">{children}</CardDescription>
      </CardHeader>
    </Card>
  );
}
