"use client";

import * as React from "react";
import { Check, ChevronDown, Copy, ExternalLink, Info, KeyRound, Loader2, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, deleteSocialApp, saveSocialApp } from "@/lib/api";
import type { SocialApp } from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppKeysCard({
  app,
  onSaved,
}: {
  app: SocialApp;
  onSaved: () => void | Promise<void>;
}) {
  const [clientId, setClientId] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [busy, setBusy] = React.useState<"save" | "delete" | null>(null);
  const [open, setOpen] = React.useState(!app.configured);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const working = React.useRef(false);
  const cancelDelete = React.useRef<HTMLButtonElement>(null);
  const deleteTrigger = React.useRef<HTMLButtonElement | null>(null);
  const cardHeading = React.useRef<HTMLHeadingElement>(null);
  const idLabel = app.platform === "tiktok" ? "Client Key" : "Client ID";
  const fieldsId = app.platform + "-app-credentials";
  const showCredentials = open || !app.configured;

  const onSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (working.current) return;
    if (!clientId.trim()) {
      toast.error(idLabel + " kiriting.");
      return;
    }
    working.current = true;
    setBusy("save");
    try {
      await saveSocialApp(app.platform, {
        clientId: clientId.trim(),
        clientSecret: secret.trim() || undefined,
      });
      setSecret("");
      toast.success("Kalitlar saqlandi — endi ulash mumkin");
      await onSaved();
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi. Qayta urinib ko‘ring.");
    } finally {
      working.current = false;
      setBusy(null);
    }
  };

  const onDelete = async () => {
    if (working.current) return;
    working.current = true;
    setBusy("delete");
    try {
      await deleteSocialApp(app.platform);
      setClientId("");
      setSecret("");
      setConfirmDelete(false);
      setOpen(true);
      toast.success("Kalitlar o‘chirildi");
      await onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O‘chirilmadi. Qayta urinib ko‘ring.");
    } finally {
      working.current = false;
      setBusy(null);
    }
  };

  const copyRedirect = async () => {
    try {
      await navigator.clipboard.writeText(app.redirectUri);
      setCopied(true);
      toast.success("Manzil nusxalandi");
    } catch {
      toast.error("Nusxalab bo‘lmadi — manzilni qo‘lda belgilang.");
    }
  };

  return (
    <>
      <Card className="min-w-0 gap-0 overflow-hidden rounded-2xl border-border/70 py-0 shadow-sm">
        <div className="flex min-w-0 flex-col gap-4 border-b border-border/60 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
              <KeyRound className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 ref={cardHeading} tabIndex={-1} className="break-words font-semibold outline-none">{app.label} ilovasi</h3>
                {app.configured ? (
                  <Badge variant="success" className="gap-1 rounded-lg"><Check className="size-3" /> Sozlangan</Badge>
                ) : (
                  <Badge variant="outline" className="rounded-lg text-muted-foreground">Sozlash kerak</Badge>
                )}
              </div>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                O‘z ilovangizni bir marta sozlang va akkauntingizni u orqali ulang.
              </p>
            </div>
          </div>
          {app.portal && (
            <Button asChild variant="outline" className="h-11 w-full shrink-0 rounded-xl px-4 sm:w-auto">
              <a href={app.portal} target="_blank" rel="noreferrer">
                Ilova yaratish <ExternalLink className="size-4" />
              </a>
            </Button>
          )}
        </div>

        <CardContent className="min-w-0 space-y-5 p-4 sm:p-5">
          <div className="min-w-0 rounded-xl border bg-muted/25 p-3.5 sm:p-4">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-background text-xs font-semibold text-muted-foreground">1</span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Qaytish manzilini portalga kiriting</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Developer portaldagi &quot;Redirect URI&quot; maydoniga quyidagi manzilni aynan nusxalang.
                </p>
              </div>
            </div>
            <div className="mt-3 flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start">
              <code className="block min-w-0 flex-1 select-text whitespace-normal rounded-lg border bg-background px-3 py-3 text-xs leading-relaxed text-foreground [overflow-wrap:anywhere]">
                {app.redirectUri}
              </code>
              <Button type="button" variant="outline" onClick={() => void copyRedirect()} className="h-11 shrink-0 rounded-xl">
                {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                {copied ? "Nusxalandi" : "Nusxalash"}
              </Button>
            </div>
          </div>

          <div className="min-w-0 rounded-xl border border-border/70">
            <div className={cn("flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4", showCredentials && "border-b border-border/60")}>
              <div className="flex min-w-0 items-start gap-2">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">2</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Ilova kalitlari</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {app.configured ? "Kalitlar saqlangan. Kerak bo‘lsa, shu yerdan yangilang." : "Portaldan olingan ilova kalitlarini kiriting."}
                  </p>
                </div>
              </div>
              {app.configured && (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-11 shrink-0 rounded-xl px-3"
                  onClick={() => setOpen((previous) => !previous)}
                  disabled={busy !== null}
                  aria-expanded={showCredentials}
                  aria-controls={fieldsId}
                >
                  {open ? "Yopish" : "O‘zgartirish"}
                  <ChevronDown className={cn("size-4 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")} />
                </Button>
              )}
            </div>

            {showCredentials && (
              <form id={fieldsId} onSubmit={onSave} className="space-y-4 p-3.5 sm:p-4" aria-busy={busy !== null}>
                <fieldset disabled={busy !== null} className="grid min-w-0 gap-4 disabled:opacity-60 sm:grid-cols-2">
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor={app.platform + "-id"}>{idLabel}</Label>
                    <Input
                      id={app.platform + "-id"}
                      value={clientId}
                      onChange={(event) => setClientId(event.target.value)}
                      autoComplete="off"
                      spellCheck={false}
                      required
                      placeholder={idLabel + " ni kiriting"}
                      aria-describedby={app.platform + "-id-hint"}
                      className="h-11 min-w-0 rounded-xl font-mono text-base sm:text-sm"
                    />
                    <p id={app.platform + "-id-hint"} className="text-xs leading-relaxed text-muted-foreground">
                      {app.configured ? "Yangilash uchun ilova identifikatorini qayta kiriting." : "Ilova sozlamalaridagi identifikator."}
                    </p>
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor={app.platform + "-secret"}>Client Secret</Label>
                    <Input
                      id={app.platform + "-secret"}
                      value={secret}
                      onChange={(event) => setSecret(event.target.value)}
                      autoComplete="new-password"
                      spellCheck={false}
                      type="password"
                      placeholder={app.configured ? "Saqlangan kalitni almashtirish" : "Maxfiy kalitni kiriting"}
                      aria-describedby={app.platform + "-secret-hint"}
                      className="h-11 min-w-0 rounded-xl font-mono text-base sm:text-sm"
                    />
                    <p id={app.platform + "-secret-hint"} className="text-xs leading-relaxed text-muted-foreground">
                      {app.configured ? "Bo‘sh qoldirsangiz, mavjud maxfiy kalit saqlanadi." : "Saqlangan maxfiy kalit qayta ko‘rsatilmaydi."}
                    </p>
                  </div>
                </fieldset>

                <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
                  <Button type="submit" disabled={busy !== null} className="h-11 flex-1 rounded-xl bg-emerald-600 px-4 text-white hover:bg-emerald-700 sm:flex-none">
                    {busy === "save" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <Check className="size-4" />}
                    {busy === "save" ? "Saqlanmoqda…" : "Kalitlarni saqlash"}
                  </Button>
                  {app.configured && (
                    <>
                      <Button type="button" variant="outline" className="h-11 flex-1 rounded-xl sm:flex-none" onClick={() => setOpen(false)} disabled={busy !== null}>Bekor qilish</Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-11 w-full rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive sm:ml-auto sm:w-auto"
                        onClick={(event) => {
                          if (!working.current) {
                            deleteTrigger.current = event.currentTarget;
                            setConfirmDelete(true);
                          }
                        }}
                        disabled={busy !== null}
                      >
                        <Trash2 className="size-4" /> Kalitlarni o‘chirish
                      </Button>
                    </>
                  )}
                </div>
              </form>
            )}
            {!showCredentials && app.configured && (
              <div className="flex items-center gap-2 px-4 pb-4 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                Maxfiy kalit xavfsizlik uchun ko‘rsatilmaydi.
              </div>
            )}
          </div>

          {(app.platform === "tiktok" || app.platform === "linkedin") && (
            <div className="flex min-w-0 items-start gap-2.5 rounded-xl bg-muted/40 p-3.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" />
              {app.platform === "tiktok" ? (
                <p className="min-w-0 break-words">
                  TikTok’da e&apos;lon qilish uchun ilova <strong className="font-medium text-foreground">auditdan o‘tishi</strong> va rasm manzili domeni <code className="[overflow-wrap:anywhere]">api.estats.uz</code> portalda tasdiqlanishi kerak. Ungacha e&apos;lonlar qoralama sifatida yuboriladi.
                </p>
              ) : (
                <p className="min-w-0 break-words">
                  Ilovaga <strong className="font-medium text-foreground">&quot;Sign In with LinkedIn using OpenID Connect&quot;</strong> va <strong className="font-medium text-foreground">&quot;Share on LinkedIn&quot;</strong> mahsulotlarini qo&apos;shing. Ulanish va e&apos;lon qilish uchun ikkalasi ham kerak.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={confirmDelete} onOpenChange={(nextOpen) => {
        if (!working.current) setConfirmDelete(nextOpen);
      }}>
        <DialogContent
          className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 motion-reduce:animate-none [&>button:last-child]:right-2 [&>button:last-child]:top-2 [&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center [&>button:last-child]:rounded-xl"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            cancelDelete.current?.focus();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const trigger = deleteTrigger.current;
            if (trigger?.isConnected && !trigger.disabled) trigger.focus();
            else cardHeading.current?.focus();
          }}
        >
          <DialogHeader className="pr-8">
            <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive"><KeyRound className="size-5" /></div>
            <DialogTitle>Ilova kalitlari o‘chirilsinmi?</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {app.label} uchun saqlangan ilova kalitlari o‘chiriladi. Yangi akkaunt ulash uchun kalitlarni qayta kiritish kerak bo‘ladi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-t pt-4">
            <Button ref={cancelDelete} type="button" variant="outline" className="h-11 rounded-xl" disabled={busy !== null} onClick={() => setConfirmDelete(false)}>Bekor qilish</Button>
            <Button type="button" variant="destructive" className="h-11 rounded-xl" disabled={busy !== null} onClick={() => void onDelete()}>
              {busy === "delete" ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" /> : <Trash2 className="size-4" />}
              {busy === "delete" ? "O‘chirilmoqda…" : "Kalitlarni o‘chirish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
