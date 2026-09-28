"use client";

import * as React from "react";
import type RFB from "@novnc/novnc";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, completeAiWebLogin, uzumLoginVncUrl } from "@/lib/api";
import type { AiWebAccountState } from "@/lib/types";

/**
 * Gemini / ChatGPT hisobiga kirish oynasi — `UzumVncDialog` bilan BIR XIL
 * ko'prik (`/product-ai/uzum-login-vnc`, ekran bitta, ruxsat do'kon egaligi
 * bo'yicha). Parol eStats'ga hech qachon ko'rinmaydi: «Kirdim, saqlash»
 * bosilganda brauzer profilidagi sessiya olinadi.
 */
export function AiWebVncDialog({
  open,
  onOpenChange,
  provider,
  title,
  shopId,
  onConnected,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  provider: string;
  title: string;
  shopId: number;
  onConnected: (state: AiWebAccountState) => void;
}) {
  const targetRef = React.useRef<HTMLDivElement>(null);
  const [connecting, setConnecting] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [failReason, setFailReason] = React.useState("");

  React.useEffect(() => {
    // `targetRef.current` shu yerda tekshirilmaydi — Radix Dialog Portal
    // bilan keyin o'rnatiladi (10-bo'lim, "In-app VNC oynasi").
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
          rfb = new RFBCtor(targetRef.current, uzumLoginVncUrl(shopId), { shared: true });
          rfb.scaleViewport = true;
          rfb.addEventListener("connect", () => setConnecting(false));
          rfb.addEventListener("disconnect", (e) => {
            const clean = (e as CustomEvent<{ clean: boolean }>).detail?.clean;
            setFailed(true);
            setFailReason(clean ? "" : "ulanish uzildi");
          });
        } catch (err) {
          setFailed(true);
          setFailReason(String((err as Error)?.message || err));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFailed(true);
          setFailReason(String(err?.message || err));
        }
      });

    return () => {
      cancelled = true;
      rfb?.disconnect();
    };
  }, [open, shopId]);

  const onDone = async () => {
    setSaving(true);
    try {
      const state = await completeAiWebLogin(provider);
      if (state.status === "active") {
        toast.success(`${title} ulandi.`);
      } else {
        toast.error(state.lastError || "Sessiya saqlandi, lekin tekshiruvdan o'tmadi.");
      }
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
          <DialogTitle>{title} hisobiga kirish</DialogTitle>
          <DialogDescription>
            Quyidagi oynada hisobingizga O&apos;ZINGIZ kiring. Chat sahifasi ochilgach
            «Kirdim, saqlash»ni bosing — parolingiz eStats&apos;da saqlanmaydi.
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
              {failReason && <span className="font-mono text-xs text-white/60">{failReason}</span>}
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
