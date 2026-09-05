"use client";

import * as React from "react";
import { CheckCircle2, ExternalLink, Loader2, MessageCircle } from "lucide-react";
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
  saveTelegramOperatorCredentials,
  startTelegramOperatorLogin,
  submitTelegramOperatorCode,
  submitTelegramOperatorPassword,
} from "@/lib/api";
import type { TelegramOperatorStatus } from "@/lib/types";

type Step = "credentials" | "phone" | "code" | "password" | "connected";

/**
 * Uzum moderatsiya operatoriga Telegram orqali yozish uchun hisob —
 * Fayozning O'Z Telegram akkaunti (MTProto), APP darajasida BITTA
 * (bozor hisobi bilan bir xil falsafa: do'konga bog'liq emas).
 *
 * `@umarket_business_bot`ga xabar yuborish shu hisobga tayanadi —
 * kelajakda blokланган/uzoq moderatsiyadagi tovar kartochkasidan
 * "Operatorga yozish" tugmasi shu ulanishni ishlatadi (9.8-bo'lim).
 *
 * Login uch bosqichli: telefon → SMS kod → (kerak bo'lsa) ikki
 * bosqichli parol — har biri ALOHIDA so'rov, kodni/parolni FAQAT
 * Fayozning o'zi kiritadi (Uzum VNC oqimlaridagi bilan bir xil
 * xavfsizlik chegarasi).
 */
export function TelegramOperatorCard() {
  const [status, setStatus] = React.useState<TelegramOperatorStatus | null>(null);
  const [forbidden, setForbidden] = React.useState(false);
  const [step, setStep] = React.useState<Step>("credentials");
  const [busy, setBusy] = React.useState(false);

  const [apiId, setApiId] = React.useState("");
  const [apiHash, setApiHash] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginId, setLoginId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchTelegramOperatorStatus();
      setStatus(next);
      setForbidden(false);
      setStep(!next.credentialsConfigured ? "credentials" : next.connected ? "connected" : "phone");
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setForbidden(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  if (forbidden) return null;

  const onSaveCredentials = async () => {
    const id = Number(apiId.trim());
    if (!id || !apiHash.trim()) {
      toast.error("API ID va API Hash kiriting.");
      return;
    }
    setBusy(true);
    try {
      const next = await saveTelegramOperatorCredentials(id, apiHash.trim());
      setStatus(next);
      setStep("phone");
      toast.success("Saqlandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(false);
    }
  };

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
        {step === "credentials" && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Bir martalik: o&apos;z Telegram hisobingiz bilan{" "}
              <a
                href="https://my.telegram.org/apps"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-primary underline"
              >
                my.telegram.org/apps <ExternalLink className="h-3 w-3" />
              </a>{" "}
              ga kiring, yangi ilova yarating (nomi muhim emas) va{" "}
              <span className="font-mono">api_id</span> /{" "}
              <span className="font-mono">api_hash</span> ni oling.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="tg-api-id">api_id</Label>
                <Input
                  id="tg-api-id"
                  value={apiId}
                  onChange={(e) => setApiId(e.target.value)}
                  inputMode="numeric"
                  placeholder="1234567"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tg-api-hash">api_hash</Label>
                <Input
                  id="tg-api-hash"
                  value={apiHash}
                  onChange={(e) => setApiHash(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-sm"
                  placeholder="0123456789abcdef0123456789abcdef"
                />
              </div>
            </div>
            <Button size="sm" onClick={onSaveCredentials} disabled={busy}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Saqlash
            </Button>
          </div>
        )}

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
