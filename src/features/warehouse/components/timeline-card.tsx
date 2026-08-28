"use client";

import * as React from "react";
import { CalendarRange, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchProductTimeline } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductTimeline } from "@/lib/types";

/** Nechanchi o'ringacha "yaxshi" hisoblanadi. */
const TOP = 10;

/** Tanlanadigan oynalar. 14 — hafta ichidagi harakat, 90 — mavsum. */
const RANGES = [14, 30, 60, 90] as const;

/**
 * Kun-ba-kun: o'sha kuni nechta sotildi va qaysi so'zda nechanchi edik.
 *
 * Nima uchun bitta jadval. Sotuv bir blokda, o'rin boshqa blokda
 * turganda eng muhim savol javobsiz qolardi: *o'rin ko'tarilgan kuni
 * sotuv ham oshdimi?* Ikkalasi bitta qatorda turganda javob ko'zga
 * o'zi tashlanadi — 3-o'ringa chiqqan kuni kunlik sotuv ikki barobar
 * bo'lgani yoki bo'lmagani.
 *
 * O'rin ustunlari bo'sh qolishi mumkin: `·` — o'sha kuni o'lchandi,
 * lekin birinchi 100 ta natijada topilmadi; bo'sh katak — o'sha kuni
 * umuman o'lchov bo'lmagan. Ikkalasini bitta belgi bilan ko'rsatish
 * tarixni yolg'on qilardi.
 */
export function TimelineCard({ productId }: { productId: number }) {
  const [days, setDays] = React.useState<number>(30);
  const [data, setData] = React.useState<ProductTimeline | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchProductTimeline(productId, days)
      .then((found) => alive && (setData(found), setError(null)))
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof ApiError ? err.message : "Yuklab bo'lmadi");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productId, days]);

  if (error) return null;

  const rows = data?.days ?? [];
  const phrases = data?.phrases ?? [];
  const sold = rows.reduce((sum, r) => sum + r.soldQuantity, 0);
  // Sotuv bo'lgan eng katta kun — kunlik ustunchaning masshtabi.
  const peak = Math.max(1, ...rows.map((r) => r.soldQuantity));

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4" /> Kunlik tarix
            </CardTitle>
            <CardDescription>
              {phrases.length > 0
                ? `Har kun: nechta sotildi va o'sha kuni ${phrases.length} ta kalit so'z bo'yicha nechanchi o'rinda edingiz.`
                : "Har kun nechta sotilgani. Kalit so'z qo'shsangiz, o'sha kungi o'rin ham shu jadvalga tushadi."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1">
            {RANGES.map((value) => (
              <Button
                key={value}
                size="sm"
                variant={value === days ? "secondary" : "ghost"}
                onClick={() => setDays(value)}
              >
                {value} kun
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !data ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
          </div>
        ) : (
          <>
            <div className="mb-3 text-sm text-muted-foreground">
              {`${data?.from} — ${data?.to} · jami ${formatNumber(sold)} dona`}
            </div>

            {/* Jadval o'z ichida siljiydi: kalit so'zlar ko'p bo'lsa
                ustunlar sig'maydi, sahifaning o'zi esa hech qachon
                gorizontal siljimasligi kerak. */}
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left font-medium">
                      Kun
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Sotildi</th>
                    <th className="px-3 py-2 text-right font-medium">Tushum</th>
                    {phrases.map((phrase) => (
                      <th
                        key={phrase}
                        className="max-w-[10rem] truncate px-3 py-2 text-right font-medium"
                        title={phrase}
                      >
                        {phrase}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.day} className="transition-colors hover:bg-muted/30">
                      <td className="sticky left-0 z-10 bg-card px-3 py-2 tabular-nums">
                        {row.day}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="flex items-center justify-end gap-2">
                          {/* Kichik ustuncha: raqamlar ustuni o'zi
                              qaysi kun kuchli bo'lganini ko'rsatmaydi. */}
                          <span
                            className="h-1.5 rounded-full bg-primary/60"
                            style={{
                              width: `${Math.round((row.soldQuantity / peak) * 40)}px`,
                            }}
                          />
                          <span
                            className={cn(
                              "tabular-nums",
                              row.soldQuantity === 0 && "text-muted-foreground/50",
                            )}
                          >
                            {row.soldQuantity}
                          </span>
                        </span>
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          row.revenue === 0 && "text-muted-foreground/50",
                        )}
                      >
                        {row.revenue === 0 ? "—" : formatSum(row.revenue)}
                      </td>
                      {phrases.map((phrase) => {
                        const has = phrase in row.positions;
                        const value = row.positions[phrase];
                        return (
                          <td
                            key={phrase}
                            className={cn(
                              "px-3 py-2 text-right text-xs tabular-nums",
                              !has
                                ? "text-muted-foreground/25"
                                : value == null
                                  ? "text-muted-foreground/40"
                                  : value <= TOP
                                    ? "font-medium text-emerald-600 dark:text-emerald-500"
                                    : "text-muted-foreground",
                            )}
                          >
                            {!has ? "" : (value ?? "·")}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {"Yashil — TOP-10. `·` — o'sha kuni o'lchandi, lekin birinchi 100 ta "}
              {"natijada topilmadi. Bo'sh katak — o'sha kuni o'lchov bo'lmagan."}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
