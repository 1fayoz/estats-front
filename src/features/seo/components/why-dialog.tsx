"use client";

import * as React from "react";
import { AlertTriangle, ExternalLink, Info, Loader2, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError, fetchPositionWhy } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CardStats, PositionWhy } from "@/lib/types";

/**
 * "Nega men bu so'zda pastdaman?"
 *
 * "38-o'rindaman" degan raqam yolg'iz o'zi hech nimani o'zgartirmaydi.
 * Bu yerda o'rin yuqorida turganlar bilan SOLISHTIRILADI — taxmin
 * bo'yicha emas, Uzumning o'z katalogidagi raqamlar bo'yicha:
 * buyurtmalar, sharhlar, reyting, narx va nomdagi so'zlar.
 *
 * Har bir sabab bajariladigan bo'lishi shart. "Matnni yaxshilang"
 * hech narsa bermaydi; "nomda 'yozgi' so'zi yo'q" — bajariladigan ish.
 */
export function WhyDialog({
  productId,
  phrase,
  onOpenChange,
}: {
  productId: number;
  phrase: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [data, setData] = React.useState<PositionWhy | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!phrase) return;
    let alive = true;
    setLoading(true);
    setData(null);
    setError(null);
    fetchPositionWhy(productId, phrase)
      .then((found) => alive && setData(found))
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof ApiError ? err.message : "Tahlil qilib bo'lmadi");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productId, phrase]);

  return (
    <Dialog open={Boolean(phrase)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nega bu so&apos;zda pastdaman?</DialogTitle>
          <DialogDescription>
            {phrase}
            {data?.position != null && ` · hozir ${data.position}-o'rin`}
            {data && data.position === null && " · birinchi 100 talikda yo'q"}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Uzum bilan solishtirilmoqda...
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {data && (
          <div className="space-y-4">
            <div className="space-y-2">
              {data.reasons.map((reason) => (
                <div
                  key={reason.kind}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 text-sm",
                    reason.weight === "high" && "border-destructive/40 bg-destructive/5",
                    reason.weight === "medium" && "border-amber-500/40 bg-amber-500/5",
                  )}
                >
                  {reason.weight === "info" ? (
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  ) : (
                    <TriangleAlert
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        reason.weight === "high"
                          ? "text-destructive"
                          : "text-amber-600 dark:text-amber-500",
                      )}
                    />
                  )}
                  <div>
                    <div className="font-medium">{reason.title}</div>
                    <div className="mt-0.5 text-muted-foreground">{reason.detail}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium" />
                    <th className="px-3 py-2 text-right font-medium">Narx</th>
                    <th className="px-3 py-2 text-right font-medium">Reyting</th>
                    <th className="px-3 py-2 text-right font-medium">Sharhlar</th>
                    <th className="px-3 py-2 text-right font-medium">Buyurtmalar</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <StatsRow label="Sizniki" stats={data.me} accent />
                  <StatsRow
                    label={`Yuqoridagi ${data.leaders.count ?? 0} ta (mediana)`}
                    stats={data.leaders}
                  />
                </tbody>
              </table>
            </div>

            {data.rivals.length > 0 && (
              <div>
                <div className="mb-2 text-sm font-medium">Sizdan yuqorida turganlar</div>
                <div className="space-y-2">
                  {data.rivals.map((rival) => (
                    <a
                      key={rival.productId}
                      href={rival.url ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-accent"
                    >
                      <Badge variant="secondary" className="shrink-0 tabular-nums">
                        {rival.rank}
                      </Badge>
                      {rival.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={rival.image}
                          alt=""
                          loading="lazy"
                          className="h-11 w-11 shrink-0 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="h-11 w-11 shrink-0 rounded-md border bg-muted" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="line-clamp-1 text-sm">{rival.title}</div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                          <span className="tabular-nums">{formatSum(rival.price)}</span>
                          {rival.rating ? <span>⭐ {rival.rating.toFixed(1)}</span> : null}
                          <span>{formatNumber(rival.reviews)} sharh</span>
                          <span>{formatNumber(rival.orders)} buyurtma</span>
                        </div>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-60" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatsRow({
  label,
  stats,
  accent,
}: {
  label: string;
  stats: CardStats;
  accent?: boolean;
}) {
  return (
    <tr className={cn(accent && "bg-primary/5")}>
      <td className={cn("px-3 py-2", accent && "font-medium")}>{label}</td>
      <td className="px-3 py-2 text-right tabular-nums">
        {stats.price ? formatSum(stats.price) : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {stats.rating != null ? stats.rating.toFixed(1) : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {stats.reviews != null ? formatNumber(stats.reviews) : "—"}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {stats.orders != null ? formatNumber(stats.orders) : "—"}
      </td>
    </tr>
  );
}
