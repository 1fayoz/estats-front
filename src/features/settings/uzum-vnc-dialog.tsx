"use client";

import * as React from "react";
import type RFB from "@novnc/novnc";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, completeUzumLogin, uzumLoginVncUrl } from "@/lib/api";

/**
 * Uzum sotuvchi kabinetiga kirish oynasi — VNC ustidan, ilova ICHIDA.
 *
 * Nega alohida oyna kerak edi. Ilgari bu FAQAT Fayoz serverga SSH
 * bilan kirib, `docker exec` bilan qo'lda qilardi — ko'p
 * foydalanuvchili SaaS uchun ishlamaydi (har bir yangi sotuvchi
 * uchun serverga tushish kerak bo'lardi). Endi brauzer oynasi shu
 * yerda, WebSocket ko'prigi orqali (`/product-ai/uzum-login-vnc`,
 * eStats'ning O'Z autentifikatsiyasi ortida) ko'rinadi va sotuvchi
 * O'ZI, telefon/parol yoki SMS bilan kiradi. Parol eStats'ga
 * hech qachon KO'RINMAYDI — brauzer to'g'ridan-to'g'ri Uzum bilan
 * gaplashadi, biz faqat ekran baytlarini ko'rsatamiz.
 *
 * VNC'ning O'Z paroli ATAYLAB ishlatilmaydi (server `-nopw`):
 * haqiqiy chegara — eStats'ning JWT + do'kon egaligini tekshiruvi
 * (`vnc.py` dagi `check`). VNC parolini qo'shsak, uni brauzerga —
 * ya'ni HAMMAGA ko'rinadigan client bundle'ga — jo'natish kerak
 * bo'lardi, bu esa sirni sir bo'lmay qo'yardi. Bir marta shu sabab
 * (parol talab qilingan, lekin RFB'ga berilmagan) ulanish hech
 * qanday xatosiz abadiy "Ulanmoqda..."da qotib qolgan edi — RFB
 * kredensial so'rab kutaverdi.
 */
export function UzumVncDialog({
  open,
  onOpenChange,
  shopId,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: number;
  onConnected: () => void;
}) {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const rfbRef = React.useRef<RFB | null>(null);
  const [connecting, setConnecting] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [failReason, setFailReason] = React.useState("");

  React.useEffect(() => {
    // `targetRef.current` ATAYLAB shu yerda TEKSHIRILMAYDI: Radix
    // `Dialog` kontenti Portal orqali kirish-chiqish animatsiyasi
    // bilan mustaqil o'rnatiladi va effekt BIRINCHI marta ishga
    // tushganda ref hali bog'lanmagan bo'lishi mumkin. Tekshiruv
    // pastda, `import()` tugagach — DOM shu paytga qadar tayyor
    // bo'lib ulguradi.
    if (!open) return;
    setConnecting(true);
    setFailed(false);
    setFailReason("");

    let cancelled = false;
    let rfb: RFB | null = null;

    // Dinamik import ATAYLAB: noVNC faqat brauzerda ishlaydigan kod
    // (Canvas, WebSocket) va o'z ichida katta ikkilik ma'lumot
    // (dekodlagichlar) tashiydi — statik importda Turbopack uni
    // alohida bo'lakka (chunk) ajratadi va o'sha bo'lak ishlab
    // chiqarish quramasida topilmay, oyna abadiy "Ulanmoqda..."da
    // qotib qolgan edi (hech qanday xato chiqmasdan). Aniq dinamik
    // import shu muammoni chetlab o'tadi.
    import("@novnc/novnc")
      .then(({ default: RFBCtor }) => {
        if (cancelled || !targetRef.current) return;
        try {
          rfb = new RFBCtor(targetRef.current, uzumLoginVncUrl(shopId), { shared: true });
          rfb.addEventListener("connect", () => setConnecting(false));
          rfb.addEventListener("disconnect", (e) => {
            const clean = (e as CustomEvent<{ clean: boolean }>).detail?.clean;
            setFailed(true);
            setFailReason(clean ? "" : "ulanish uzildi");
          });
          rfbRef.current = rfb;
        } catch (err) {
          console.error("[uzum-vnc] RFB yaratishda xato:", err);
          setFailed(true);
          setFailReason(String((err as Error)?.message || err));
        }
      })
      .catch((err) => {
        console.error("[uzum-vnc] noVNC yuklanmadi:", err);
        if (!cancelled) {
          setFailed(true);
          setFailReason(String(err?.message || err));
        }
      });

    return () => {
      cancelled = true;
      rfb?.disconnect();
      rfbRef.current = null;
    };
  }, [open, shopId]);

  const onDone = async () => {
    setSaving(true);
    try {
      await completeUzumLogin(shopId);
      toast.success("Sessiya saqlandi — endi bu do'kon uchun avtomatik joylash ishlaydi.");
      onConnected();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Uzum sotuvchi kabinetiga kirish</DialogTitle>
          <DialogDescription>
            Quyidagi oynada Uzum&apos;ga O&apos;ZINGIZ kiring (telefon/parol yoki SMS).
            Mahsulotlar ro&apos;yxati ko&apos;ringach &quot;Kirdim, saqlash&quot;ni bosing.
            Parolingiz eStats&apos;ga yuborilmaydi — bu shu brauzer oynasining o&apos;zi.
          </DialogDescription>
        </DialogHeader>

        <div className="relative overflow-hidden rounded-lg border bg-black">
          <div ref={targetRef} className="aspect-[1920/1080] w-full" />
          {connecting && !failed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ulanmoqda...
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 px-4 text-center text-sm text-white">
              <span>Ulanish uzildi — oynani yopib qayta urinib ko&apos;ring.</span>
              {failReason && (
                <span className="font-mono text-xs text-white/60">{failReason}</span>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={onDone} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
            )}
            Kirdim, saqlash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
