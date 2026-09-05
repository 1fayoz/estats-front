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
  fetchTelegramOperatorStatus,
  logoutTelegramOperator,
  startTelegramOperatorLogin,
  submitTelegramOperatorCode,
  submitTelegramOperatorPassword,
} from "@/lib/api";
import type { TelegramOperatorStatus } from "@/lib/types";

type Step = "not_configured" | "phone" | "code" | "password" | "connected";

/**
 * Uzum moderatsiya operatoriga Telegram orqali yozish uchun hisob —
 * Fayozning O'Z Telegram akkaunti (MTProto), APP darajasida BITTA
 * (bozor hisobi bilan bir xil falsafa: do'konga bog'liq emas).
 *
 * `@umarket_business_bot`ga xabar yuborish shu hisobga tayanadi —
 * kelajakda blokланган/uzoq moderatsiyadagi tovar kartochkasidan
 * "Operatorga yozish" tugmasi shu ulanishni ishlatadi (9.8-bo'lim).
 *
 * `telegram_operator_api_id`/`_api_hash` (`my.telegram.org`) BU
 * KARTADA KIRITILMAYDI — bir martalik, ilova darajasidagi sozlama,
 * `/admin/` (Django adminka, AppSetting) orqali kiritiladi. Bu
 * yerda faqat FAYOZNING O'Z login qadamlari: telefon → SMS kod →
 * (kerak bo'lsa) ikki bosqichli parol — har biri ALOHIDA so'rov,
 * kodni/parolni FAQAT o'zi kiritadi (Uzum VNC oqimlaridagi bilan
 * bir xil xavfsizlik chegarasi).
 */
export function TelegramOperatorCard() {
  const [status, setStatus] = React.useState<TelegramOperatorStatus | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [step, setStep] = React.useState<Step>("not_configured");
  const [busy, setBusy] = React.useState(false);

  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginId, setLoginId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchTelegramOperatorStatus();
      setStatus(next);
      setForbidden(false);
      setStep(!next.credentialsConfigured ? "not_configured" : next.connected ? "connected" : "phone");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  // Sozlanmagan bo'lsa hech narsa ko'rsatilmaydi — bu ILOVA darajasidagi,
  // bir martalik sozlama (adminka orqali kiritiladi), sotuvchi/oddiy
  // foydalanuvchi buni ko'rishi/bilishi shart emas. Fayoz adminkadan
  // kiritgach karta o'zi paydo bo'ladi (keyingi `load()`da).
  if (forbidden || step === "not_configured") return null;

  const onSendCode = async () => {
    if (!phone.trim()) {
      toast.error("Telefon raqamini kiriting.");
      return;
    }
    setBusy(true);
    try {
      const { loginId: id } = await startTelegramOperatorLogin(phone.trim());
      setLoginId(id);
      setStep("code");
      toast.success("Kod Telegram'ga yuborildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod yuborilmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitCode = async () => {
    if (!loginId || !code.trim()) return;
    setBusy(true);
    try {
      const result = await submitTelegramOperatorCode(loginId, code.trim());
      if (result.status === "password_required") {
        setStep("password");
        return;
      }
      setStatus(result.account);
      setStep("connected");
      toast.success("Ulandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod qabul qilinmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onSubmitPassword = async () => {
    if (!loginId || !password.trim()) return;
    setBusy(true);
    try {
      const result = await submitTelegramOperatorPassword(loginId, password.trim());
      setStatus(result.account);
      setStep("connected");
      toast.success("Ulandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Parol qabul qilinmadi.");
    } finally {
      setBusy(false);
    }
  };

  const onLogout = async () => {
    setBusy(true);
    try {
      await logoutTelegramOperator();
      setPhone("");
      setCode("");
      setPassword("");
      setLoginId(null);
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
              <MessageCircle className="h-4 w-4" /> Telegram operator hisobi
            </CardTitle>
            <CardDescription>
              Uzum moderatsiya operatoriga Telegram orqali yozish uchun — bitta,
              shaxsiy hisob (barcha do&apos;konlar uchun umumiy).
            </CardDescription>
          </div>
          <Badge variant={status?.connected ? "success" : "secondary"}>
            {status?.connected ? "ulangan" : "ulanmagan"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {step === "phone" && (
          <div className="space-y-2">
            <div className="space-y-1.5">
              <Label htmlFor="tg-phone">Telefon raqami</Label>
              <Input
                id="tg-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
              />
            </div>
            <Button size="sm" onClick={onSendCode} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Kod yuborish
            </Button>
          </div>
        )}

        {step === "code" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Kod Telegram ilovangizga (yoki SMS) kelgan bo&apos;lishi kerak.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tg-code">Kod</Label>
              <Input
                id="tg-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
            <Button size="sm" onClick={onSubmitCode} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Kirish
            </Button>
          </div>
        )}

        {step === "password" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Hisobingizda ikki bosqichli tasdiqlash yoqilgan — parolni kiriting.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tg-password">Parol</Label>
              <Input
                id="tg-password"
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

        {step === "connected" && status && (
          <>
            <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>
                {status.firstName} {status.lastName || ""}
                {status.username && ` (@${status.username})`} — {status.phone}
                {status.connectedAt &&
                  ` · ${new Date(status.connectedAt).toLocaleString("uz-UZ")}da ulangan.`}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={onLogout} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Uzish
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
