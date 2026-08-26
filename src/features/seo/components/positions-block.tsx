"use client";

import * as React from "react";
import { Activity, Loader2, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchSeoPositions, trackSeoPositions } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SeoPositionRow } from "@/lib/types";

/** Nechanchi o'ringacha "yaxshi" hisoblanadi. */
const TOP = 10;

/**
 * Qidiruvdagi o'rin.
 *
 * Ball — bashorat, o'rin — natija. Matnni o'zgartirgandan keyin
 * haqiqatan yuqoriga chiqdimi degan savolga faqat shu javob beradi.
 *
 * "Topilmadi" ATAYLAB bo'sh katak: uni nol yoki 999 qilib ko'rsatish
 * grafikda yolg'on ko'tarilish yoki tushish yasagan bo'lardi.
 */
export function PositionsBlock({ productId }: { productId: number }) {
  const [rows, setRows] = React.useState<SeoPositionRow[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchSeoPositions(productId)
      .then(setRows)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [productId]);

  const measure = async () => {
    setBusy(true);
    try {
      setRows(await trackSeoPositions(productId));
      toast.success("O'rinlar o'lchandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'lchanmadi.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return null;

  if (rows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="max-w-md text-sm text-muted-foreground">
            Kalit so&apos;zlar bo&apos;yicha tovaringiz qidiruvda nechanchi
            o&apos;rinda turgani o&apos;lchanadi. Keyin u har kuni o&apos;zi
            yozib boriladi va matn o&apos;zgargandan keyin natija ko&apos;rinadi.
          </p>
          <Button className="gap-1.5" onClick={measure} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
            O&apos;rinlarni o&apos;lchash
          </Button>
        </CardContent>
      </Card>
    );
  }

  const days = [...new Set(rows.flatMap((r) => r.points.map((p) => p.day)))].sort().slice(-14);
  const inTop = rows.filter((r) => r.current !== null && r.current <= TOP).length;

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Qidiruvdagi o&apos;rin</CardTitle>
              <CardDescription>
                {`${rows.length} ta kalit so'z kuzatilmoqda · TOP-${TOP} da ${inTop} tasi. `}
                Har kuni o&apos;zi o&apos;lchanadi.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={measure} disabled={busy}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
              Hozir o&apos;lchash
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">Kalit so&apos;z</th>
                  <th className="pb-2 pr-3 text-right font-medium">Talab</th>
                  <th className="pb-2 pr-3 text-right font-medium">Hozir</th>
                  {days.map((d) => (
                    <th key={d} className="pb-2 pr-1.5 text-right text-[10px] font-medium">
                      {d.slice(8)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const byDay = new Map(row.points.map((p) => [p.day, p.position]));
                  return (
                    <tr key={row.phrase} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{row.phrase}</td>
                      <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                        {formatNumber(row.coverage)}
                      </td>
                      <td className="py-2 pr-3 text-right">
                        <span className="inline-flex items-center gap-1">
                          <span
                            className={cn(
                              "tabular-nums font-medium",
                              row.current === null
                                ? "text-muted-foreground"
                                : row.current <= TOP
                                  ? "text-emerald-600 dark:text-emerald-500"
                                  : "",
                            )}
                          >
                            {row.current ?? "—"}
                          </span>
                          {row.change !== null && row.change !== 0 && (
                            row.change < 0 ? (
                              <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-destructive" />
                            )
                          )}
                        </span>
                      </td>
                      {days.map((d) => {
                        const value = byDay.get(d);
                        return (
                          <td
                            key={d}
                            className={cn(
                              "py-2 pr-1.5 text-right text-xs tabular-nums",
                              value == null
                                ? "text-muted-foreground/40"
                                : value <= TOP
                                  ? "text-emerald-600 dark:text-emerald-500"
                                  : "text-muted-foreground",
                            )}
                          >
                            {value ?? "·"}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {"Bo'sh katak — o'sha kuni birinchi 100 ta natija ichida topilmadi. "}
            {"Kichikroq raqam — yuqoriroq o'rin."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
