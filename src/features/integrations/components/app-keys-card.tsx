"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, KeyRound, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, deleteSocialApp, saveSocialApp } from "@/lib/api";
import type { SocialApp } from "@/lib/types";

/**
 * Tarmoq ilovasining kalitlari.
 *
 * LinkedIn va TikTok'ga ulanish uchun sotuvchining O'Z ilovasi kerak —
 * ularning developer portalida yaratiladi. Kalitni `.env` ga yozish
 * serverni tahrirlab, qayta ishga tushirish demak, shuning uchun u shu
 * yerdan kiritiladi.
 *
 * Kalit kiritilgach QAYTIB KELMAYDI: sirni ekranda ko'rsatib turishning
 * foydasi yo'q. Shuning uchun maydon bo'sh turadi va bo'sh yuborilsa
 * eskisi saqlanadi.
 */
export function AppKeysCard({
  app,
  onSaved,
}: {
  app: SocialApp;
  onSaved: () => void | Promise<void>;
}) {
  const [clientId, setClientId] = React.useState("");
  const [secret, setSecret] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [open, setOpen] = React.useState(!app.configured);

  const idLabel = app.platform === "tiktok" ? "Client Key" : "Client ID";

  const onSave = async () => {
    if (!clientId.trim()) {
      toast.error(`${idLabel} kiriting.`);
      return;
    }
    setBusy(true);
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
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    setBusy(true);
    try {
      await deleteSocialApp(app.platform);
      setClientId("");
      setSecret("");
      toast.success("Kalitlar o'chirildi");
      await onSaved();
      setOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    } finally {
      setBusy(false);
    }
  };

  const copyRedirect = async () => {
    try {
      await navigator.clipboard.writeText(app.redirectUri);
      toast.success("Manzil nusxalandi");
    } catch {
      toast.error("Nusxalab bo'lmadi — qo'lda belgilang.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4" /> {app.label} ilovasi
              {app.configured && (
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" /> Kalit kiritilgan
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Ulanish sizning o&apos;z ilovangiz orqali ketadi. Uni bir marta
              yaratasiz, keyin kalit shu yerda qoladi.
            </CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            {app.portal && (
              <a href={app.portal} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="gap-1.5">
                  Ilova yaratish <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </a>
            )}
            {app.configured && !open && (
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                O&apos;zgartirish
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Portaldagi "Redirect URL" maydoniga AYNAN shu satr yozilishi
            kerak — bitta belgi farq qilsa tarmoq ulanishni rad etadi. */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Portaldagi &quot;Redirect URI&quot; maydoniga aynan shuni qo&apos;ying
          </Label>
          <div className="flex gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/40 px-3 py-2 text-xs">
              {app.redirectUri}
            </code>
            <Button variant="outline" size="sm" onClick={copyRedirect} className="shrink-0 gap-1.5">
              <Copy className="h-3.5 w-3.5" /> Nusxalash
            </Button>
          </div>
        </div>

        {open && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${app.platform}-id`}>{idLabel}</Label>
              <Input
                id={`${app.platform}-id`}
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                placeholder={app.configured ? "o'zgartirish uchun qayta kiriting" : ""}
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${app.platform}-secret`}>Client Secret</Label>
              <Input
                id={`${app.platform}-secret`}
                value={secret}
                onChange={(e) => setSecret(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                type="password"
                placeholder={app.configured ? "saqlangan — bo'sh qoldiring" : ""}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}

        {open && (
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={onSave} disabled={busy} className="gap-1.5">
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
              Saqlash
            </Button>
            {app.configured && (
              <>
                <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>
                  Bekor qilish
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  disabled={busy}
                  className="gap-1.5 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Kalitlarni o&apos;chirish
                </Button>
              </>
            )}
          </div>
        )}

        {app.platform === "tiktok" && (
          <p className="rounded-md border border-dashed p-2.5 text-xs text-muted-foreground">
            TikTok qo&apos;shimcha ikki narsani talab qiladi: e&apos;lon qilish uchun
            ilova <b>audit</b>dan o&apos;tishi va rasm havolasi domeni
            (<code>estats.uz</code>) portalda <b>tasdiqlanishi</b> kerak. Ulargacha
            e&apos;lon qoralama sifatida ketadi.
          </p>
        )}
        {app.platform === "linkedin" && (
          <p className="rounded-md border border-dashed p-2.5 text-xs text-muted-foreground">
            Ilovaga <b>&quot;Sign In with LinkedIn using OpenID Connect&quot;</b> va
            <b> &quot;Share on LinkedIn&quot;</b> mahsulotlarini qo&apos;shing —
            ulanish va e&apos;lon qilish shularsiz ishlamaydi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
