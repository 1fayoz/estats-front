"use client";

import * as React from "react";
import { CheckCircle2, KeyRound, Loader2, MonitorSmartphone, Pencil, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ApiError,
  clearUzumCredentials,
  fetchUzumCredentials,
  saveUzumCredentials,
  startUzumAutoLogin,
  startUzumLogin,
  submitUzumSms,
} from "@/lib/api";
import type { UzumCredentials } from "@/lib/types";
import { useUserStore } from "@/stores/user-store";
import { UzumVncDialog } from "./uzum-vnc-dialog";

/**
 * Uzum sotuvchi kabinetiga ulanish — AVTOMATIK kirish bilan.
 *
 * Sotuvchi login/parolni SHU YERDA kiritadi; kabinetga tizim o'zi
 * kiradi (brauzer serverda fonda ochiladi, oyna kerak emas). Sessiya
 * o'lganda fon vazifalari ham jimgina qayta kiradi — "kabinetga
 * qayta kiring" degan xato sotuvchiga ko'rsatilmaydi.
 *
 * Parol serverda SHIFRLANGAN holda saqlanadi va hech qachon
 * qaytarilmaydi (interfeys faqat "saqlangan"ligini biladi).
 *
 * SMS kodini avtomatlashtirib bo'lmaydi — u telefonga keladi.
 * Uzum so'raganda shu yerda kod maydoni chiqadi, brauzer esa
 * serverda ochiq turadi va kod kiritilgach kirish yakunlanadi.
 *
 * VNC oynasi ZAXIRA sifatida qoldi: Uzum brauzerni tekshirmoqchi
 * bo'lsa (CAPTCHA) yoki parol bilan kirib bo'lmasa — odam o'zi
 * kiradi.
 */
export function UzumSellerLoginCard() {
  const shop = useUserStore((s) => s.user?.shops.find((sh) => sh.id === s.activeShopId));
  const [busy, setBusy] = React.useState<"" | "save" | "login" | "sms" | "vnc" | "clear">("");
  const [vncOpen, setVncOpen] = React.useState(false);
  const [state, setState] = React.useState<UzumCredentials | null>(null);
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [note, setNote] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [confirmClear, setConfirmClear] = React.useState(false);
  const [smsRequested, setSmsRequested] = React.useState(false);
  const [loadError, setLoadError] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchUzumCredentials();
      setState(next);
      setLoadError(false);
      if (next.login) setLogin(next.login);
    } catch {
      setLoadError(true);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load, shop?.id]);

  if (!shop) return null;

  const connectedAt = state?.connectedAt ?? shop.uzumSellerConnectedAt ?? null;

  const onSave = async () => {
    if (busy) return;
    if (!login.trim() || !password.trim()) {
      toast.error("Login va parolni kiriting.");
      return;
    }
    setBusy("save");
    try {
      setState(await saveUzumCredentials(login.trim(), password.trim()));
      setPassword("");
      setEditing(false);
      toast.success("Saqlandi. Endi «Kabinetga kirish» bosing.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  const onAutoLogin = async () => {
    if (busy) return;
    setBusy("login");
    setNote(null);
    try {
      const result = await startUzumAutoLogin();
      if (result.status === "ok") {
        setSmsRequested(false);
        toast.success("Kabinetga kirildi.");
      } else if (result.status === "sms_required") {
        setSmsRequested(true);
        setNote("Uzum tasdiqlash kodini yubordi — kodni kiriting.");
      } else if (result.status === "bad_credentials") {
        setEditing(true);
        setNote("Login yoki parol noto'g'ri — tekshirib qayta saqlang.");
      } else if (result.status === "captcha") {
        setNote(
          "Uzum qo'shimcha tasdiqlashni so'radi. «Oyna orqali kirish» tugmasini bosing.",
        );
      } else {
        setNote(result.message || "Kirib bo'lmadi.");
      }
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kirib bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  const onSms = async () => {
    if (busy || !code.trim()) return;
    setBusy("sms");
    try {
      const result = await submitUzumSms(code.trim());
      if (result.status === "ok") {
        setSmsRequested(false);
        setCode("");
        setNote(null);
        toast.success("Kabinetga kirildi.");
      } else if (result.status === "bad_code") {
        setNote("Kod noto'g'ri — qaytadan kiriting.");
      } else if (result.status === "expired") {
        setSmsRequested(false);
        setNote("Kutish vaqti tugadi — «Kabinetga kirish» ni qaytadan bosing.");
      } else {
        setNote(result.message || "Kod qabul qilinmadi.");
      }
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kod qabul qilinmadi.");
    } finally {
      setBusy("");
    }
  };

  const onVnc = async () => {
    if (busy) return;
    setBusy("vnc");
    try {
      const result = await startUzumLogin(shop.id);
      if (result.status === "busy") {
        toast.error("Hozir boshqa do'kon ulanmoqda — biroz kutib qayta urining.");
        return;
      }
      setVncOpen(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Ulanib bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  const onClear = async () => {
    if (busy) return;
    setBusy("clear");
    try {
      setState(await clearUzumCredentials());
      setLogin("");
      setPassword("");
      setCode("");
      setSmsRequested(false);
      setEditing(false);
      setConfirmClear(false);
      setNote(null);
      toast.success("Kirish ma'lumotlari o'chirildi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kirish ma'lumotlarini o'chirib bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  return (
    <Card className="rounded-2xl shadow-none">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-2">
            <h3 className="text-base font-semibold tracking-tight">Sotuvchi kabineti</h3>
            <CardDescription className="leading-relaxed">
              Mahsulotlarni Uzum&apos;ga joylang va moderatsiya holatini kuzating.
            </CardDescription>
          </div>
          <Badge variant={connectedAt ? "success" : "secondary"}>
            {connectedAt ? "Ulangan" : "Ulanmagan"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {connectedAt && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <div className="min-w-0 space-y-1"><p className="break-words font-medium">{shop.name} kabineti ulangan</p><p className="text-xs leading-relaxed text-muted-foreground">{new Date(connectedAt).toLocaleString("uz-UZ")}</p></div>
          </div>
        )}

        {loadError && <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3"><p className="text-sm">Ulanish holatini yuklab bo&apos;lmadi.</p><Button variant="outline" className="min-h-11 rounded-xl" onClick={() => void load()}>Qayta urinish</Button></div>}

        {state?.saved && !editing ? (
          <div className="flex flex-col justify-between gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center">
            <div className="min-w-0 space-y-1"><p className="text-xs text-muted-foreground">Saqlangan hisob</p><p className="break-words text-sm font-medium [overflow-wrap:anywhere]">{state.login || "Kirish ma'lumotlari saqlangan"}</p></div>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => setEditing(true)} aria-expanded={false} aria-controls="uzum-credentials-form"><Pencil className="size-4" />Tahrirlash</Button>
          </div>
        ) : (
          <form id="uzum-credentials-form" className="space-y-4 rounded-xl border bg-muted/15 p-4" onSubmit={(event) => { event.preventDefault(); void onSave(); }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <Label htmlFor="uzum-login">Telefon yoki pochta</Label>
                <Input id="uzum-login" value={login} onChange={(event) => setLogin(event.target.value)} placeholder="+998901234567" autoComplete="username" className="h-11 rounded-xl bg-background" disabled={Boolean(busy)} />
              </div>
              <div className="min-w-0 space-y-2">
                <Label htmlFor="uzum-password">Parol</Label>
                <Input id="uzum-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={state?.saved ? "Yangi parolni kiriting" : "Uzum Seller parolingiz"} autoComplete="current-password" className="h-11 rounded-xl bg-background" disabled={Boolean(busy)} />
              </div>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"><ShieldCheck className="mt-0.5 size-3.5 shrink-0" /> Parolingiz shifrlangan holda saqlanadi.</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="submit" variant="outline" className="min-h-11 rounded-xl" disabled={Boolean(busy) || !login.trim() || !password.trim()}>{busy === "save" && <Loader2 className="size-4 animate-spin" />}Ma&apos;lumotlarni saqlash</Button>
              {state?.saved && <Button type="button" variant="ghost" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => { setEditing(false); setPassword(""); setLogin(state.login || ""); }}>Bekor qilish</Button>}
            </div>
          </form>
        )}

        {note && (
          <p role="status" className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-sm leading-relaxed">
            {note}
          </p>
        )}

        {(state?.waitingCode || smsRequested) && (
          <form className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4" onSubmit={(event) => { event.preventDefault(); void onSms(); }}>
            <Label htmlFor="uzum-code">SMS tasdiqlash kodi</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="uzum-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="123456"
                className="h-11 min-w-0 rounded-xl bg-background tracking-widest sm:max-w-52"
                disabled={Boolean(busy)}
              />
              <Button type="submit" className="min-h-11 rounded-xl" disabled={Boolean(busy) || !code.trim()}>
                {busy === "sms" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Tasdiqlash
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Uzum hisobingizga bog&apos;langan telefonga kelgan kodni kiriting.
            </p>
          </form>
        )}

        <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:flex-wrap">
          <Button className="min-h-11 rounded-xl" onClick={onAutoLogin} disabled={Boolean(busy) || !state?.saved || editing}>
            {busy === "login" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            )}
            Kabinetga kirish
          </Button>
          <Button variant="outline" className="min-h-11 rounded-xl" onClick={onVnc} disabled={Boolean(busy)}>
            {busy === "vnc" ? <Loader2 className="size-4 animate-spin" /> : <MonitorSmartphone className="size-4" />}
            Oyna orqali kirish
          </Button>
          {state?.saved && (
            <Button
              variant="ghost"
              className="min-h-11 rounded-xl text-muted-foreground hover:text-destructive sm:ml-auto"
              onClick={() => setConfirmClear(true)}
              disabled={Boolean(busy)}
            >
              <Trash2 className="size-4" /> Hisobni unutish
            </Button>
          )}
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Qo&apos;shimcha tasdiqlash so&apos;ralsa, «Oyna orqali kirish» orqali davom eting.
        </p>
      </CardContent>

      <Dialog open={confirmClear} onOpenChange={(open) => { if (!busy) setConfirmClear(open); }}>
        <DialogContent className="w-[calc(100%_-_2rem)] rounded-2xl [&>button]:min-h-11 [&>button]:min-w-11 [&>button]:right-2 [&>button]:top-2">
          <DialogHeader>
            <DialogTitle className="pr-10 leading-snug">Saqlangan hisobni unutish</DialogTitle>
            <DialogDescription className="leading-relaxed">Login va parol o&apos;chiriladi. Avtomatik kirish uchun ularni qayta kiritishingiz kerak bo&apos;ladi.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => setConfirmClear(false)}>Bekor qilish</Button>
            <Button variant="destructive" className="min-h-11 rounded-xl" disabled={Boolean(busy)} onClick={() => void onClear()}>{busy === "clear" && <Loader2 className="size-4 animate-spin" />}Hisobni unutish</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <UzumVncDialog
        open={vncOpen}
        onOpenChange={setVncOpen}
        shopId={shop.id}
        onConnected={() => void load()}
      />
    </Card>
  );
}
