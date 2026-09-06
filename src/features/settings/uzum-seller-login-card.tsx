"use client";

import * as React from "react";
import { CheckCircle2, KeyRound, Loader2, MonitorSmartphone } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [busy, setBusy] = React.useState<"" | "save" | "login" | "sms" | "vnc">("");
  const [vncOpen, setVncOpen] = React.useState(false);
  const [state, setState] = React.useState<UzumCredentials | null>(null);
  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [note, setNote] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchUzumCredentials();
      setState(next);
      if (next.login) setLogin(next.login);
    } catch {
      /* ruxsat yo'q yoki tarmoq — karta baribir ishlaydi */
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load, shop?.id]);

  if (!shop) return null;

  const connectedAt = state?.connectedAt ?? shop.uzumSellerConnectedAt ?? null;

  const onSave = async () => {
    if (!login.trim() || !password.trim()) {
      toast.error("Login va parolni kiriting.");
      return;
    }
    setBusy("save");
    try {
      setState(await saveUzumCredentials(login.trim(), password.trim()));
      setPassword("");
      toast.success("Saqlandi. Endi «Kabinetga kirish» bosing.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.");
    } finally {
      setBusy("");
    }
  };

  const onAutoLogin = async () => {
    setBusy("login");
    setNote(null);
    try {
      const result = await startUzumAutoLogin();
      if (result.status === "ok") {
        toast.success("Kabinetga kirildi.");
      } else if (result.status === "sms_required") {
        setNote("Uzum tasdiqlash kodini yubordi — kodni kiriting.");
      } else if (result.status === "bad_credentials") {
        setNote("Login yoki parol noto'g'ri — tekshirib qayta saqlang.");
      } else if (result.status === "captcha") {
        setNote(
          "Uzum brauzerni tekshirmoqchi. Pastdagi «Oyna orqali kirish» bilan bir marta qo'lda kiring.",
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
    if (!code.trim()) return;
    setBusy("sms");
    try {
      const result = await submitUzumSms(code.trim());
      if (result.status === "ok") {
        setCode("");
        setNote(null);
        toast.success("Kabinetga kirildi.");
      } else if (result.status === "bad_code") {
        setNote("Kod noto'g'ri — qaytadan kiriting.");
      } else if (result.status === "expired") {
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

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MonitorSmartphone className="h-4 w-4" /> Sotuvchi kabinetiga ulanish
            </CardTitle>
            <CardDescription>
              AI tayyorlagan mahsulotni Uzum&apos;ga avtomatik joylash, blok sabablarini
              o&apos;qish va kategoriya daraxti uchun — login/parolni bir marta kiriting.
            </CardDescription>
          </div>
          <Badge variant={connectedAt ? "success" : "secondary"}>
            {connectedAt ? "ulangan" : "ulanmagan"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {connectedAt && (
          <div className="flex items-start gap-3 rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              {new Date(connectedAt).toLocaleString("uz-UZ")} da ulangan. Sessiya
              tugasa tizim saqlangan parol bilan o&apos;zi qayta kiradi — vazifalar
              to&apos;xtamaydi.
            </span>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="uzum-login">Telefon yoki pochta</Label>
            <Input
              id="uzum-login"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="+998901234567"
              autoComplete="off"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="uzum-password">Parol</Label>
            <Input
              id="uzum-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={state?.saved ? "•••••••• (saqlangan)" : ""}
              autoComplete="off"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Parol shifrlangan holda saqlanadi va hech qachon qaytarilmaydi — u faqat
          Uzum kabinetiga kirish uchun ishlatiladi.
        </p>

        {note && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            {note}
          </p>
        )}

        {state?.waitingCode && (
          <div className="space-y-2 rounded-lg border p-3">
            <Label htmlFor="uzum-code">Uzum yuborgan kod</Label>
            <div className="flex gap-2">
              <Input
                id="uzum-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                inputMode="numeric"
                placeholder="123456"
                className="max-w-40"
              />
              <Button size="sm" onClick={onSms} disabled={busy === "sms"}>
                {busy === "sms" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                Tasdiqlash
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Kod telefoningizga keladi — uni avtomatlashtirib bo&apos;lmaydi.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={onSave} disabled={busy === "save"}>
            {busy === "save" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Saqlash
          </Button>
          <Button size="sm" onClick={onAutoLogin} disabled={busy === "login" || !state?.saved}>
            {busy === "login" ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <KeyRound className="mr-1.5 h-3.5 w-3.5" />
            )}
            Kabinetga kirish
          </Button>
          <Button size="sm" variant="ghost" onClick={onVnc} disabled={busy === "vnc"}>
            {busy === "vnc" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Oyna orqali kirish
          </Button>
          {state?.saved && (
            <Button
              size="sm"
              variant="ghost"
              onClick={async () => {
                setState(await clearUzumCredentials());
                setPassword("");
                toast.success("Hisob ma'lumoti o'chirildi.");
              }}
            >
              O&apos;chirish
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          «Oyna orqali kirish» — zaxira yo&apos;l: Uzum brauzerni tekshirmoqchi
          bo&apos;lganda (CAPTCHA) yoki parol bilan kirib bo&apos;lmaganda ishlatiladi.
        </p>
      </CardContent>

      <UzumVncDialog
        open={vncOpen}
        onOpenChange={setVncOpen}
        shopId={shop.id}
        onConnected={() => void load()}
      />
    </Card>
  );
}
