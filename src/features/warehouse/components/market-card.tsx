"use client";

import * as React from "react";
import { AlertTriangle, ExternalLink, Loader2, RefreshCw, Store, TrendingDown } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ApiError, fetchProductMarket } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductMarket } from "@/lib/types";

/**
 * What comparable goods cost on Uzum right now, and what I can do about it.
 *
 * Competitor prices alone are half an answer — the useful half is whether my own
 * cost structure lets me go there. So the break-even price is shown against the
 * market, not next to it.
 */
export function MarketCard({ productId }: { productId: number }) {
  const [data, setData] = React.useState<ProductMarket | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<{ message: string; needsToken: boolean } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchProductMarket(productId));
    } catch (err) {
      const api = err instanceof ApiError ? err : null;
      setError({
        message: api?.message ?? "Bozor ma'lumotini olib bo'lmadi",
        // 409 = umuman sozlanmagan, 401 = token muddati o'tgan.
        needsToken: api?.status === 409 || api?.status === 401,
      });
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Store className="h-4 w-4" /> Bozorda shu kabi tovarlar
            </CardTitle>
            <CardDescription>
              {data
                ? `"${data.query}" bo'yicha ${formatNumber(data.total)} ta tovar topildi`
                : "Uzum katalogidagi raqobatchi narxlar"}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Yangilash
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading && !data && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Bozor ma&apos;lumoti yuklanmoqda...
          </div>
        )}

        {error && (
          <div
            className={cn(
              "flex items-start gap-3 rounded-lg border p-4 text-sm",
              error.needsToken
                ? "border-amber-500/40 bg-amber-500/5"
                : "border-destructive/40 bg-destructive/5 text-destructive"
            )}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-medium">{error.message}</div>
              {error.needsToken && (
                <div className="mt-1 text-muted-foreground">
                  Bozor tokeni qisqa muddatli (~3 soat). Sozlamalar sahifasida
                  yangilang — keyin bu blok o&apos;zi ishlaydi.
                </div>
              )}
            </div>
          </div>
        )}

        {data && data.items.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Eng arzon" value={formatSum(data.stats.min)} />
              <Stat label="O'rtacha (median)" value={formatSum(data.stats.median)} />
              <Stat label="Eng qimmat" value={formatSum(data.stats.max)} />
              <Stat
                label="Sizning narxingiz"
                value={data.myPrice ? formatSum(data.myPrice) : "—"}
                accent
              />
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
              <span className="flex items-center gap-1.5">
                <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                Sizdan arzon sotayotganlar:{" "}
                <span className="font-semibold">{data.cheaperShare.toFixed(0)}%</span>
              </span>
              {data.breakEvenPrice != null && (
                <span>
                  Beziyon nuqtangiz:{" "}
                  <span className="font-semibold">{formatSum(data.breakEvenPrice)}</span>
                </span>
              )}
              {data.profitAtMarketMedian != null && (
                <span>
                  Median narxda foyda:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      data.profitAtMarketMedian >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    )}
                  >
                    {formatSum(data.profitAtMarketMedian)}
                  </span>
                </span>
              )}
            </div>

            {data.note && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <span>{data.note}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.items.slice(0, 12).map((item) => {
                const cheaper = data.myPrice != null && item.price < data.myPrice;
                return (
                  <a
                    key={item.productId}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col overflow-hidden rounded-lg border transition-colors hover:bg-accent"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-muted">
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold tabular-nums">{formatSum(item.price)}</span>
                        {cheaper && (
                          <Badge variant="secondary" className="text-[10px]">arzonroq</Badge>
                        )}
                      </div>
                      <div className="line-clamp-2 text-xs text-muted-foreground">
                        {item.title}
                      </div>
                      <div className="mt-auto flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        {item.rating ? <span>⭐ {item.rating.toFixed(1)}</span> : null}
                        {item.reviews > 0 && <span>{formatNumber(item.reviews)} sharh</span>}
                        <ExternalLink className="ml-auto h-3 w-3 opacity-0 transition-opacity group-hover:opacity-70" />
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </>
        )}

        {data && data.items.length === 0 && !error && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            &quot;{data.query}&quot; bo&apos;yicha o&apos;xshash tovar topilmadi.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-3", accent && "border-primary/40 bg-primary/5")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-semibold tabular-nums", accent && "text-primary")}>
        {value}
      </div>
    </div>
  );
}
