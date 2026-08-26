"use client";

import * as React from "react";
import { ExternalLink, Loader2, Star, Swords } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchSeoRivals } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import type { SeoRival } from "@/lib/types";

/**
 * Kalit so'zlar bo'yicha oldimizda turgan tovarlar.
 *
 * "Men 38-o'rindaman" degan raqam yolg'iz o'zi hech narsa aytmaydi.
 * Oldimda kim turgani, uning narxi, reytingi va sharhlari qanchaligi —
 * mana shu tuzatiladigan narsani ko'rsatadi.
 */
export function RivalsBlock({ productId }: { productId: number }) {
  const [rows, setRows] = React.useState<SeoRival[] | null>(null);
  const [busy, setBusy] = React.useState(false);

  const load = async () => {
    setBusy(true);
    try {
      setRows(await fetchSeoRivals(productId));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Olinmadi.");
    } finally {
      setBusy(false);
    }
  };

  if (rows === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
          <Swords className="h-6 w-6 text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            Kalit so&apos;zlaringiz bo&apos;yicha yuqorida kim turganini
            ko&apos;rsatadi — narxi, reytingi va sharhlari bilan.
          </p>
          <Button className="gap-1.5" onClick={load} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
            Raqobatchilarni ko&apos;rish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Oldingizda turganlar</CardTitle>
            <CardDescription>
              Eng kuchli so&apos;rovlaringizda birinchi o&apos;nlikka chiqqanlar.
              Ko&apos;proq so&apos;rovda uchragani yuqorida.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Yangilash"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {rows.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Raqobatchi topilmadi.
          </p>
        )}
        {rows.map((rival) => (
          <div key={rival.productId} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            {rival.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={rival.image} alt="" className="h-12 w-12 shrink-0 rounded-md border object-cover" />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-md border bg-muted" />
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{rival.title}</p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span>{formatSum(rival.price)}</span>
                {rival.rating != null && rival.rating > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {rival.rating.toFixed(1)}
                  </span>
                )}
                <span>{`${formatNumber(rival.reviews)} sharh`}</span>
                <span>{`${rival.bestRank}-o'rin`}</span>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {rival.phrases.slice(0, 4).map((phrase) => (
                  <Badge key={phrase} variant="secondary">{phrase}</Badge>
                ))}
              </div>
            </div>

            {rival.url && (
              <a
                href={rival.url}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-md border p-2 transition-colors hover:bg-accent"
                aria-label="Uzum'da ochish"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
