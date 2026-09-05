"use client";

import * as React from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ApiError, fetchComplaintPreview, sendComplaint } from "@/lib/api";
import type { ComplaintPreview, ComplaintSendResult } from "@/lib/types";

interface Props {
  productId: number | null;
  onOpenChange: (open: boolean) => void;
}

/**
 * Uzum moderatsiya operatoriga (`@umarket_business_bot`) xabar.
 *
 * Matn server tomonda ANIQ ma'lumotdan tuziladi (blok sabablari va
 * kartochkaga kiritilgan tuzatishlar), lekin YUBORISHDAN OLDIN shu
 * yerda ko'rsatiladi va tahrirlanadi: xabar sotuvchining O'Z
 * hisobidan ketadi, ya'ni uni odam yozgan bo'lib hisoblanadi va u
 * nima yozilganini ko'rgan bo'lishi kerak.
 */
export function ComplaintDialog({ productId, onOpenChange }: Props) {
  const [preview, setPreview] = React.useState<ComplaintPreview | null>(null);
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<ComplaintSendResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (productId == null) return;
    setPreview(null);
    setResult(null);
    setError(null);
    void (async () => {
      try {
        const next = await fetchComplaintPreview(productId);
        setPreview(next);
        setText(next.text);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Matnni tayyorlab bo'lmadi.");
      }
    })();
  }, [productId]);

  const onSend = async (force = false) => {
    if (productId == null || !text.trim()) return;
    setBusy(true);
    try {
      const res = await sendComplaint(productId, text.trim(), force);
      setResult(res);
      toast.success("Operatorga yuborildi.");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Yuborib bo'lmadi.";
      // 429 — shu tovar bo'yicha 24 soat ichida allaqachon yozilgan.
      // Bu taqiq emas, ogohlantirish: sotuvchi baribir yubormoqchi
      // bo'lsa "Baribir yuborish" bilan davom etadi.
      setError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const alreadySent = preview?.lastSentAt ? new Date(preview.lastSentAt) : null;

  return (
    <Dialog open={productId != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Uzum operatoriga yozish
          </DialogTitle>
          <DialogDescription>
            Xabar sizning Telegram hisobingizdan <b>@umarket_business_bot</b> ga
            yuboriladi. Matnni tahrirlashingiz mumkin.
          </DialogDescription>
        </DialogHeader>

        {!preview && !error && (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Matn tayyorlanmoqda…
          </div>
        )}

        {preview && !preview.connected && (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            Telegram hisobi ulanmagan. Integratsiyalar → Telegram bo&apos;limidan
            raqamingizni ulang, keyin bu yerdan yuborasiz.
          </p>
        )}

        {alreadySent && !result && (
          <p className="text-xs text-muted-foreground">
            Bu tovar bo&apos;yicha oxirgi marta{" "}
            {alreadySent.toLocaleString("uz-UZ")} da yozilgan.
          </p>
        )}

        {preview && !result && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        )}

        {result && (
          <div className="space-y-2 text-sm">
            <p className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
              Yuborildi. {result.path.length > 0
                ? `Menyu bo'ylab: ${result.path.join(" → ")}`
                : "Bot menyusi topilmadi — xabar to'g'ridan-to'g'ri botga yuborildi."}
            </p>
            {result.steps.map((step, i) => (
              <div key={i} className="rounded-md border px-3 py-2">
                <div className="text-xs text-muted-foreground">→ {step.sent}</div>
                {step.text && <div className="whitespace-pre-wrap">{step.text}</div>}
              </div>
            ))}
          </div>
        )}

        {error && !result && (
          <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            {error}
          </p>
        )}

        <DialogFooter>
          {result ? (
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Yopish
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button
                size="sm"
                onClick={() => onSend(Boolean(alreadySent))}
                disabled={busy || !preview?.connected || !text.trim()}
              >
                {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {alreadySent ? "Baribir yuborish" : "Yuborish"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
