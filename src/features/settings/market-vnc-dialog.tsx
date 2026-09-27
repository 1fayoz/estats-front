"use client";

import * as React from "react";
import type RFB from "@novnc/novnc";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, completeMarketLogin, marketLoginVncUrl } from "@/lib/api";
import type { MarketAutoRefresh } from "@/lib/types";

/**
 * Uzum MIJOZ (bozor) hisobiga kirish oynasi — `UzumVncDialog` bilan
 * BIR XIL ko'prik va falsafa (parol eStats'ga hech qachon
 * ko'rinmaydi), faqat do'konga bog'liq emas: APP darajasida BITTA
 * hisob, shuning uchun `shopId` o'rniga hech narsa yuborilmaydi va
 * ulanish tugagach avtomatik-yangilanish (`/market/token/
 * auto-refresh`) ishga tushadi — Fayoz endi tokenni qo'lda
 * yangilamaydi.
 */
export function MarketVncDialog({
  open,
  onOpenChange,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnected: (state: MarketAutoRefresh) => void;
}) {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const rfbRef = React.useRef<RFB | null>(null);
  const [connecting, setConnecting] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [failReason, setFailReason] = React.useState("");

  React.useEffect(() => {
    // `targetRef.current` ATAYLAB shu yerda tekshirilmaydi — Radix
    // `Dialog` Portal bilan mustaqil o'rnatiladi, `UzumVncDialog`dagi
    // bilan bir xil tuzoq (10-bo'lim, "In-app VNC oynasi").
    if (!open) return;
    setConnecting(true);
    setFailed(false);
    setFailReason("");

    let cancelled = false;
    let rfb: RFB | null = null;

    import("@novnc/novnc")
      .then(({ default: RFBCtor }) => {
        if (cancelled || !targetRef.current) return;
        try {
          rfb = new RFBCtor(targetRef.current, marketLoginVncUrl(), { shared: true });
          rfb.scaleViewport = true;
          rfb.addEventListener("connect", () => setConnecting(false));
          rfb.addEventListener("disconnect", (e) => {
            const clean = (e as CustomEvent<{ clean: boolean }>).detail?.clean;
            setFailed(true);
            setFailReason(clean ? "" : "ulanish uzildi");
          });
          rfbRef.current = rfb;
        } catch (err) {
          console.error("[market-vnc] RFB yaratishda xato:", err);
          setFailed(true);
          setFailReason(String((err as Error)?.message || err));
        }
      })
      .catch((err) => {
        console.error("[market-vnc] noVNC yuklanmadi:", err);
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
  }, [open]);

  const onDone = async () => {
    setSaving(true);
    try {
      const state = await completeMarketLogin();
      toast.success("Sessiya saqlandi — bozor tokeni endi avtomatik yangilanadi.");
      onConnected(state);
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
          <DialogTitle>Uzum mijoz hisobiga kirish</DialogTitle>
          <DialogDescription>
            Quyidagi oynada uzum.uz&apos;ga O&apos;ZINGIZ kiring (telefon raqamingiz bilan,
            SMS kod). Katalog ko&apos;ringach &quot;Kirdim, saqlash&quot;ni bosing — shundan
            keyin bozor tokeni har {"~3"} daqiqada o&apos;zi yangilanadi.
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
