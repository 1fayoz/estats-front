"use client";

import * as React from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { MARKET_BASE } from "@/lib/market";

/**
 * «Hozir yangilash» — bitta bozor kartochkasini Uzum'dan darhol o'qiydi.
 *
 * Nega kerak: kunlik quvur butun katalogni aylanadi va bitta
 * kartochkaga navbat bir necha kunda bir keladi. Sotuvchi esa aynan
 * hozir, aniq bir raqobatchi haqida bilmoqchi — qoldig'i qancha,
 * narxi o'zgardimi, yangi sharh keldimi.
 *
 * Server 90 soniyalik tanaffus qo'yadi (`refreshed: false`): qoldiq
 * soniyada o'zgarmaydi va tugmani ketma-ket bosish Uzum'ga behuda
 * o'nlab so'rov yuborardi. Bu XATO emas — shunday deb ko'rsatiladi.
 */
export function RefreshProduct({
  productId,
  onDone,
}: {
  productId: number | string;
  onDone: () => void;
}) {
  const [busy, setBusy] = React.useState(false);

  const run = async () => {
    setBusy(true);
    try {
      const response = await fetch(`${MARKET_BASE}/products/${productId}/refresh`, {
        method: "POST",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(
          (body && (body.detail ?? body.message)) || `Yangilanmadi (${response.status})`,
        );
      }
      if (body?.refreshed === false) {
        toast.info(
          body.retry_after
            ? `Yaqinda yangilangan — ${body.retry_after} soniyadan keyin qayta urinib ko'ring.`
            : "Yaqinda yangilangan.",
        );
      } else {
        const added = Number(body?.new_reviews ?? 0);
        toast.success(
          added > 0 ? `Yangilandi · ${added} ta yangi sharh` : "Uzum'dan yangilandi",
        );
      }
      onDone();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Yangilab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={run} disabled={busy} className="gap-1.5">
      {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      Hozir yangilash
    </Button>
  );
}
