"use client";

import * as React from "react";
import { Check, CheckCircle2, Loader2, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  const actionPending = React.useRef(false);
  const [confirmDisconnect, setConfirmDisconnect] = React.useState(false);

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
    if (actionPending.current) return;
    if (!phone.trim()) {
      toast.error("Telefon raqamini kiriting.");
      return;
    }
    actionPending.current = true;
    setBusy(true);
    try {
      await startTelegramAccountLogin(phone.trim());
      setStep("code");
      toast.success("Kod yuborildi — Telegram ilovangizni tekshiring.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod yuborilmadi.");
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  };

  const onSubmitCode = async () => {
    if (actionPending.current || !code.trim()) return;
    actionPending.current = true;
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
      actionPending.current = false;
      setBusy(false);
    }
  };

  const onSubmitPassword = async () => {
    if (actionPending.current || !password.trim()) return;
    actionPending.current = true;
    setBusy(true);
    try {
      await submitTelegramAccountPassword(password.trim());
      setPassword("");
      await load();
      toast.success("Telegram hisobi ulandi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Parol qabul qilinmadi.");
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  };

  const onDisconnect = async () => {
    if (actionPending.current) return;
    actionPending.current = true;
    setBusy(true);
    try {
      await disconnectTelegramAccount();
      setCode("");
      setPassword("");
      await load();
      setConfirmDisconnect(false);
      toast.success("Telegram hisobi uzildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Uzib bo'lmadi.");
    } finally {
      actionPending.current = false;
      setBusy(false);
    }
  };

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight"><UserRound className="size-4 text-muted-foreground" /> Shaxsiy Telegram hisobi</h3>
            <CardDescription className="leading-relaxed">
              Uzum moderatsiya operatoriga o&apos;z nomingizdan murojaat qilish uchun hisobingizni ulang.
            </CardDescription>
          </div>
          <Badge variant={status.connected ? "success" : "secondary"}>
            {status.connected ? "Ulangan" : "Ulanmagan"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status.credentialsConfigured && (
          <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed">
            Hisob ulash hali sozlanmagan. Administrator Telegram xizmatini faollashtirgach, shu yerda ulanishingiz mumkin.
          </p>
        )}

        {status.credentialsConfigured && step !== "connected" && (
          <ol aria-label="Hisobni ulash bosqichlari" className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-3">
            {([{ key: "phone", label: "Raqam" }, { key: "code", label: "Kod" }, { key: "password", label: "Parol" }] as const).map((item, index) => {
              const currentIndex = step === "phone" ? 0 : step === "code" ? 1 : 2;
              const complete = index < currentIndex;
              return <li key={item.key} aria-current={step === item.key ? "step" : undefined} className="flex min-w-0 flex-col items-center gap-2 text-center text-xs sm:flex-row sm:text-left"><span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${index <= currentIndex ? "bg-primary text-primary-foreground" : "border bg-background text-muted-foreground"}`}>{complete ? <Check className="size-3.5" /> : index + 1}</span><span className={step === item.key ? "font-medium" : "text-muted-foreground"}>{item.label}{item.key === "password" && <span className="block text-[10px] text-muted-foreground">Kerak bo&apos;lsa</span>}</span></li>;
            })}
          </ol>
        )}

        {status.credentialsConfigured && step === "phone" && (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void onSendCode(); }}>
            <div className="space-y-2">
              <Label htmlFor="tg-acc-phone">Telefon raqami</Label>
              <Input
                id="tg-acc-phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+998901234567"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className="h-11 rounded-xl"
                disabled={busy}
                aria-describedby="tg-acc-phone-help"
              />
              <p id="tg-acc-phone-help" className="text-xs leading-relaxed text-muted-foreground">
                Telegram hisobingizga bog&apos;langan raqamni kiriting. Tasdiqlash kodini Telegram ilovasida tekshiring.
              </p>
            </div>
            <Button type="submit" className="min-h-11 w-full rounded-xl sm:w-auto" disabled={busy || !phone.trim()}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Kod yuborish
            </Button>
          </form>
        )}

        {status.credentialsConfigured && step === "code" && (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void onSubmitCode(); }}>
            <p role="status" className="break-words rounded-xl border bg-muted/15 p-3 text-sm leading-relaxed">
              {phone ? `${phone} raqamiga` : "Raqamingizga"} kod yuborildi. Telegram ilovasidagi kodni kiriting.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tg-acc-code">Tasdiqlash kodi</Label>
              <Input
                id="tg-acc-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="12345"
                className="h-11 rounded-xl tracking-widest"
                disabled={busy}
              />
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" className="min-h-11 rounded-xl" disabled={busy || !code.trim()}>
                {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Kodni tasdiqlash
              </Button>
              <Button type="button" variant="ghost" className="min-h-11 rounded-xl" onClick={() => { setStep("phone"); setCode(""); }} disabled={busy}>
                Raqamni o&apos;zgartirish
              </Button>
            </div>
          </form>
        )}

        {status.credentialsConfigured && step === "password" && (
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void onSubmitPassword(); }}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Hisobingizda ikki bosqichli tasdiqlash yoqilgan. Davom etish uchun Telegram parolingizni kiriting.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="tg-acc-password">Telegram paroli</Label>
              <Input
                id="tg-acc-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-11 rounded-xl"
                disabled={busy}
              />
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 shrink-0" /> Parolingiz saqlanmaydi.</p>
            <Button type="submit" className="min-h-11 w-full rounded-xl sm:w-auto" disabled={busy || !password.trim()}>
              {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              Hisobni ulash
            </Button>
          </form>
        )}

        {step === "connected" && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="min-w-0 space-y-1.5 leading-relaxed">
                <p className="break-words font-semibold">{status.firstName} {status.lastName || ""}</p>
                <p className="break-words text-xs text-muted-foreground">{status.username && `@${status.username} · `}{status.phone}</p>
                {status.connectedAt && <p className="text-xs text-muted-foreground">Ulangan: {new Date(status.connectedAt).toLocaleString("uz-UZ")}</p>}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">Ombordagi bloklangan tovar sahifasida «Operatorga yozish» tugmasi orqali murojaat yuborishingiz mumkin.</p>
            <div className="border-t pt-4"><Button variant="outline" className="min-h-11 w-full rounded-xl text-muted-foreground hover:text-destructive sm:w-auto" onClick={() => setConfirmDisconnect(true)} disabled={busy}><LogOut className="size-4" /> Hisobni uzish</Button></div>
          </>
        )}
      </CardContent>
      <Dialog open={confirmDisconnect} onOpenChange={(open) => { if (!actionPending.current) setConfirmDisconnect(open); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:right-2 [&>button]:top-2">
          <DialogHeader>
            <DialogTitle className="pr-10 leading-snug">Telegram hisobini uzish</DialogTitle>
            <DialogDescription className="leading-relaxed">Shaxsiy hisobingiz uziladi. Operatorga yana o&apos;z nomingizdan yozish uchun hisobni qayta ulashingiz kerak bo&apos;ladi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={busy} onClick={() => setConfirmDisconnect(false)}>Bekor qilish</Button>
            <Button variant="destructive" className="min-h-11 rounded-xl" disabled={busy} onClick={() => void onDisconnect()}>{busy && <Loader2 className="size-4 animate-spin" />}Hisobni uzish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
