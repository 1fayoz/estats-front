"use client";

import * as React from "react";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ApiError,
  disconnectTelegramAccount,
  fetchTelegramAccount,
  startTelegramAccountLogin,
  submitTelegramAccountCode,
  submitTelegramAccountPassword,
} from "@/lib/api";
import type { TelegramAccountStatus } from "@/lib/types";

type Step = "phone" | "code" | "password" | "connected";

/**
 * Sotuvchining O'Z Telegram hisobini ulash — raqam → Telegram kodi →
 * (kerak bo'lsa) ikki bosqichli parol.
 *
 * Nima uchun kerak: Uzum moderatsiya operatoriga
 * (`@umarket_business_bot`) bloklangan yoki uzoq turib qolgan
 * kartochka haqida yozish. Xabar DO'KON EGASI nomidan borishi kerak —
 * botga faqat haqiqiy odam hisobi yoza oladi va operator xabarni
 * kimning do'koni haqida ekanini shundan biladi.
 *
 * Ilova kaliti (`api_id`/`api_hash`) bu yerda SO'RALMAYDI: u bir
 * martalik, ilova darajasidagi sozlama va faqat adminkada turadi.
 * Kod va parol esa faqat shu formadan o'tadi — hech qayerda
 * saqlanmaydi (Uzum VNC oqimlaridagi bilan bir xil chegara).
 */
export function TelegramAccountCard() {
  const [status, setStatus] = React.useState<TelegramAccountStatus | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [step, setStep] = React.useState<Step>("phone");
  const [busy, setBusy] = React.useState(false);

  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const next = await fetchTelegramAccount();
      setStatus(next);
      setForbidden(false);
      // Tugallanmagan login bo'lsa — o'sha qadamdan davom etadi.
      // Aks holda sotuvchi raqamdan qayta boshlab, Telegramdan yana
      // kod so'rardi (eskisi esa baribir bekor bo'lardi).
      setStep(
        next.connected
          ? "connected"
          : next.pendingStep === "password"
            ? "password"
            : next.pendingStep === "code"
              ? "code"
              : "phone",
      );
      if (next.phone && !next.connected) setPhone(next.phone);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Ruxsati yo'q foydalanuvchiga karta umuman ko'rinmaydi —
  // `PositionsBlock`dagi bilan bir xil naqsh (403 da jimgina yashirinadi).
  if (forbidden || !status) return null;

  const onSendCode = async () => {
    if (!phone.trim()) {
      toast.error("Telefon raqamini kiriting.");
      return;
    }
    setBusy(true);
    try {
      await startTelegramAccountLogin(phone.trim());
      setStep("code");
      toast.success("Kod yuborildi — Telegram ilovangizni tekshiring.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod yuborilmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitCode = async () => {
    if (!code.trim()) return;
    setBusy(true);
    try {
      const result = await submitTelegramAccountCode(code.trim());
      if (result.status === "password_required") {
        setStep("password");
        toast.info("Ikki bosqichli parolni kiriting.");
        return;
      }
      await load();
      toast.success("Telegram hisobi ulandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod qabul qilinmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitPassword = async () => {
    if (!password.trim()) return;
    setBusy(true);
    try {
      await submitTelegramAccountPassword(password.trim());
      setPassword("");
      await load();
      toast.success("Telegram hisobi ulandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Parol qabul qilinmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    setBusy(true);
    try {
      await disconnectTelegramAccount();
      setCode("");
      setPassword("");
      await load();
      toast.success("Uzildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Uzib bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Telegram hisobi
            </CardTitle>
            <CardDescription>
              Uzum moderatsiya operatoriga to&apos;g&apos;ridan-to&apos;g&apos;ri yozish
              uchun — bloklangan yoki uzoq tasdiqlanmayotgan kartochka haqida.
            </CardDescription>
          </div>
          <Badge variant={status.connected ? "success" : "secondary"}>
            {status.connected ? "ulangan" : "ulanmagan"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!status.credentialsConfigured && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            Telegram ilova kaliti hali sozlanmagan — administrator adminkada
            (&quot;Telegram userbot&quot;) qo&apos;shishi kerak. Shundan keyin bu yerdan
            hisobingizni ulaysiz.
          </p>
        )}

        {status.credentialsConfigured && step === "phone" && (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="tg-acc-phone">Telefon raqami</Label>
              <Input
                id="tg-acc-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
                inputMode="tel"
              />
              <p className="text-xs text-muted-foreground">
                Telegram hisobingizga bog&apos;langan raqam. Kod Telegram ilovasiga
                keladi (ilova ochilmasa — SMS bilan).
              </p>
            </div>
            <Button size="sm" onClick={onSendCode} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Kod yuborish
            </Button>
          </div>
        )}

        {status.credentialsConfigured && step === "code" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {phone ? `${phone} raqamiga` : "Raqamingizga"} kod yuborildi. Kod 5
              daqiqa amal qiladi.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tg-acc-code">Kod</Label>
              <Input
                id="tg-acc-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
                placeholder="12345"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onSubmitCode} disabled={busy}>
                {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Kirish
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setStep("phone")} disabled={busy}>
                Raqamni o&apos;zgartirish
              </Button>
            </div>
          </div>
        )}

        {status.credentialsConfigured && step === "password" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Hisobingizda ikki bosqichli tasdiqlash yoqilgan — Telegram parolingizni
              kiriting. Parol saqlanmaydi.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tg-acc-password">Parol</Label>
              <Input
                id="tg-acc-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button size="sm" onClick={onSubmitPassword} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Kirish
            </Button>
          </div>
        )}

        {step === "connected" && (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                {status.firstName} {status.lastName || ""}
                {status.username && ` (@${status.username})`} — {status.phone}
                {status.connectedAt &&
                  ` · ${new Date(status.connectedAt).toLocaleString("uz-UZ")}da ulangan.`}
                <br />
                Endi ombordagi bloklangan tovar sahifasida &laquo;Operatorga
                yozish&raquo; tugmasi ishlaydi.
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={onDisconnect} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Uzish
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
