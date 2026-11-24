"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import type RFB from "@novnc/novnc";
import { CheckCircle2, Loader2, RotateCw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, completeUzumLogin, fetchUzumLoginStatus, startUzumLogin, uzumLoginVncUrl } from "@/lib/api";
import type { UzumLoginStatus } from "@/lib/types";
import { EXTENSION_HREF, canSaveSession, vncSessionView } from "@/lib/uzum-challenge";

/** Ochiq oynada sessiya holati shuncha oraliqda so'raladi (ms). */
const STATUS_POLL_MS = 4000;

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
 *
 * SESSIYA HOLATI (2026-11-24). Oyna ochiq turganda holat so'rab turiladi
 * (`GET /market/uzum-login/status`), chunki ekranning o'zi ikki narsani
 * aytmaydi:
 *
 *  - sessiya tugadi (10 daqiqa) — brauzer yopiladi, ekran esa QORA bo'lib
 *    qoladi (administratorda VNC ulanishi ham uzilmaydi). Endi ustidan
 *    «sessiya yopildi» va «Qayta ochish» chiqadi;
 *  - Uzum (Cloudflare) «Verify you are human» ni qayta-qayta so'rayapti —
 *    sotuvchi belgini bosaveradi, sahifa esa har safar yana tekshiruvga
 *    tushadi. Sabab brauzerda ham, keshda ham emas (eStats server IP'si
 *    tekshiruvga tushirilgan); oyna endi buni AYTADI va ishlaydigan yo'lni
 *    (eStats Lens kengaytmasi) ko'rsatadi. Belgi avtomatik bosilmaydi.
 *
 * «Kirdim, saqlash» tekshiruv sahifasi turganda saqlamaydi: ilgari kabinet
 * ochilmagan bo'lsa ham «Sessiya saqlandi» deb chiqardi.
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
  // Sessiya holati (`null` — hali noma'lum yoki so'rov yiqildi) va qayta
  // ulanish hisoblagichi (`attempt` o'zgarsa RFB qaytadan ochiladi).
  const [status, setStatus] = React.useState<UzumLoginStatus | null>(null);
  const [attempt, setAttempt] = React.useState(0);
  const [restarting, setRestarting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setStatus(null);
    let alive = true;
    const tick = () =>
      fetchUzumLoginStatus(shopId)
        .then((next) => alive && setStatus(next))
        // Tarmoq uzilishi «sessiya tugadi» degani emas — oxirgi holat qoladi.
        .catch(() => undefined);
    void tick();
    const timer = window.setInterval(tick, STATUS_POLL_MS);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, [open, shopId, attempt]);

  const session = vncSessionView(status);

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
      .then(async ({ default: RFBCtor }) => {
        const url = await uzumLoginVncUrl(shopId);
        if (cancelled || !targetRef.current) return;
        try {
          rfb = new RFBCtor(targetRef.current, url, { shared: true });
          // Buni tashxis paytida vaqtincha olib tashlagandim (gumon
          // qilingan sabab boshqa bo'lib chiqdi — VNC_PASSWORD) va
          // qaytarishni unutgandim: buning YO'QLIGI aynan shu — pastki
          // qism (kirish tugmasi) qirqilib ko'rinish — xatosining
          // o'zi edi. Usiz noVNC masofaviy ekranni (1920x1080) ASL
          // o'lchamda chizadi, konteyner esa faqat bir qismini
          // ko'rsatib, qolganini `overflow-hidden` bilan kesib
          // tashlaydi.
          rfb.scaleViewport = true;
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
  }, [open, shopId, attempt]);

  /** Sessiya tugagan — brauzer qaytadan ochiladi va ekran qayta ulanadi. */
  const onRestart = async () => {
    if (restarting) return;
    setRestarting(true);
    try {
      const result = await startUzumLogin(shopId);
      if (result.status === "busy") {
        toast.error("Hozir boshqa do'kon ulanmoqda — biroz kutib qayta urining.");
        return;
      }
      setAttempt((n) => n + 1);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Oynani qayta ochib bo'lmadi.");
    } finally {
      setRestarting(false);
    }
  };

  const onDone = async () => {
    // Tekshiruv sahifasi turibdi — kabinet OCHILMAGAN, saqlanadigan sessiya yo'q.
    if (!canSaveSession(status)) {
      toast.error(
        "Kabinet hali ochilmagan — Uzum «Verify you are human» tekshiruvi turibdi. Mahsulotlar ro'yxati ko'ringanda saqlang.",
      );
      return;
    }
    setSaving(true);
    try {
      const result = await completeUzumLogin(shopId);
      if (result.challenged) {
        // Server ham shuni aytdi (holat so'rovi kechikkan bo'lishi mumkin):
        // do'kon «ulandi» deb YOZILMADI.
        toast.error("Kabinet ochilmadi — Uzum tekshiruvi o'tmagan, sessiya saqlanmadi.");
      } else {
        toast.success("Sessiya saqlandi — endi bu do'kon uchun avtomatik joylash ishlaydi.");
        onConnected();
      }
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
          {session.kind === "ended" ? (
            // Sessiya tugagan: ekran qora (yoki ulanish uzilgan) — sababi va
            // bitta tugma. `failed` dan USTUN: ikkalasi bir vaqtda bo'lsa
            // aniqroq xabar shu.
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-4 text-center text-sm text-white">
              <span>
                Oyna sessiyasi yopildi — 10 daqiqa ochiq turdi yoki boshqa joydan yopildi.
              </span>
              <Button size="sm" variant="secondary" onClick={() => void onRestart()} disabled={restarting}>
                {restarting ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCw className="mr-1.5 h-3.5 w-3.5" />}
                Qayta ochish
              </Button>
            </div>
          ) : failed ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 px-4 text-center text-sm text-white">
              <span>Ulanish uzildi — oynani yopib qayta urinib ko&apos;ring.</span>
              {failReason && (
                <span className="font-mono text-xs text-white/60">{failReason}</span>
              )}
            </div>
          ) : null}
        </div>

        {session.kind === "loop" && (
          <div role="status" className="flex flex-wrap items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm leading-relaxed">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
            <div className="min-w-0 flex-1 basis-72 space-y-1">
              <p className="font-medium">
                Uzum tekshiruvi shu oynada {session.count} marta chiqdi.
              </p>
              <p className="text-muted-foreground">
                Sahifa qayta-qayta tekshiruvga tushyapti. Belgi qo&apos;yilgandan keyin ham shunday
                bo&apos;lsa — bu sizning xatoingiz ham, kesh ham emas: Uzum (Cloudflare) eStats serverining
                manzilini tekshiruvga tushirgan, qayta-qayta bosish yoki keshni tozalash yordam bermaydi.{" "}
                {session.extension
                  ? "Voronka, Bust narxlari va reklama o'z brauzeringizdagi eStats Lens kengaytmasi orqali ishlaydi."
                  : "eStats server orqali urinishni o'zi siyraklashtiradi va cheklov olib tashlanishi bilan davom ettiradi."}
              </p>
            </div>
            {session.extension && (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={EXTENSION_HREF as Route} onClick={() => onOpenChange(false)}>
                  Kengaytma sozlamalari
                </Link>
              </Button>
            )}
          </div>
        )}
        {session.kind === "challenge" && (
          <p role="status" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm leading-relaxed">
            Uzum brauzerni tekshiryapti («Verify you are human»). Belgini oynada o&apos;zingiz qo&apos;ying;
            mahsulotlar ro&apos;yxati ochilgach «Kirdim, saqlash»ni bosing.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={onDone} disabled={saving || session.kind === "ended"}>
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
