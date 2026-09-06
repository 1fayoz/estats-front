"use client";

import * as React from "react";
import { AlertTriangle, CalendarRange, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchProductTimeline } from "@/lib/api";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketplaceFacts, ProductTempo, ProductTimeline, TimelineDay } from "@/lib/types";

/** Nechanchi o'ringacha "yaxshi" hisoblanadi. */
const TOP = 10;
/** Shuncha kunlik zaxiradan kam qolganda ogohlantiriladi. */
const LOW_DAYS = 14;
/** Tanlanadigan oynalar. 14 — hafta ichidagi harakat, 90 — mavsum. */
const RANGES = [14, 30, 60, 90] as const;
/** O'rin heatmap'ida shundan naryog'i deyarli ko'rinmas bo'ladi. */
const DEPTH = 100;

function decimal(value: number): string {
  return formatNumber(value);
}

/**
 * Tovarning butun kunlik manzarasi — bitta blokda.
 *
 * Nima uchun bitta blok. Sotuv bir joyda, narx boshqa joyda, qoldiq
 * uchinchi joyda, qidiruvdagi o'rin to'rtinchi joyda turganda sotuvchi
 * ularni boshida solishtirishga majbur bo'lardi. Aslida savol doim
 * bitta va bog'langan: *o'rin ko'tarilgan kuni sotuv ham oshdimi,
 * narx tushgani yordam berdimi, qoldiq tugagan kunlar o'rinni
 * tushirdimi?* Bitta jadvalda javob o'zi ko'rinadi.
 *
 * Ranglar bitta ohangning quyuqligi bilan beriladi (sequential), ya'ni
 * rang faqat KATTALIKNI bildiradi. Har xil rang — har xil ma'no degani
 * bo'lardi, bu yerda esa ma'no bitta. Raqam har doim yozilgan turadi:
 * rang qo'shimcha, yagona belgi emas.
 */
export function ProductStats({
  productId,
  tempo,
  onHand,
  facts,
}: {
  productId: number;
  tempo: ProductTempo;
  onHand: number;
  facts: MarketplaceFacts;
}) {
  const [days, setDays] = React.useState<number>(30);
  const [result, setResult] = React.useState<{ productId: number; days: number; timeline: ProductTimeline } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [retry, setRetry] = React.useState(0);
  const data = result?.productId === productId && result.days === days ? result.timeline : null;

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    fetchProductTimeline(productId, days)
      .then((found) => {
        if (!alive) return;
        setResult({ productId, days, timeline: found });
        setError(null);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof ApiError ? err.message : "Yuklab bo'lmadi");
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productId, days, retry]);

  const rows = data?.days ?? [];
  const phrases = data?.phrases ?? [];
  // Grafiklar vaqt bo'yicha chapdan o'ngga o'sadi, jadval esa yangisi
  // yuqorida — shuning uchun ikki xil tartib.
  const chrono = React.useMemo(() => [...rows].reverse(), [rows]);
  const peak = Math.max(1, ...rows.map((r) => r.soldQuantity));

  const empty = onHand <= 0;
  const low = !empty && tempo.daysOfStock !== null && tempo.daysOfStock <= LOW_DAYS;
  const alarm = low || (empty && tempo.soldQuantity > 0);

  return (
    <Card className="overflow-hidden rounded-2xl shadow-none">
      <CardHeader className="gap-4 border-b pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4" /> Savdo ko&apos;rsatkichlari
            </CardTitle>
            <CardDescription className="mt-2 leading-6">
              Asosiy ko&apos;rsatkichlar: {tempo.days} kunlik hisob.
              {tempo.firstSaleAt && ` · birinchi sotuv ${tempo.firstSaleAt.slice(0, 10)}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-4 sm:pt-5">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Tile
            label="Tushum"
            value={formatSumShort(tempo.revenue)}
            note={`${tempo.days} kunda`}
            series={chrono.map((r) => r.revenue)}
            seriesLabel={`${days} kunlik grafik`}
          />
          <Tile
            label="Sotuv, donada"
            value={formatNumber(tempo.soldQuantity)}
            note={`${tempo.days} kunda · ${formatNumber(tempo.orders)} ta buyurtma`}
            series={chrono.map((r) => r.soldQuantity)}
            seriesLabel={`${days} kunlik grafik`}
          />
          <Tile
            label="Kuniga o'rtacha"
            value={`${decimal(tempo.avgPerDay)} dona`}
            note={`${tempo.days} kun bo'yicha`}
            series={chrono.map((r) => r.soldQuantity)}
            seriesLabel={`${days} kunlik grafik`}
          />
          <Tile
            label="O'rtacha qoldiq"
            value={`${decimal(tempo.avgStock)} dona`}
            note={`${tempo.days} kun bo'yicha · hozir ${formatNumber(onHand)} dona`}
            series={chrono.map((r) => r.stock)}
            seriesLabel={`${days} kunlik grafik`}
          />
          <Tile
            label="Qoldiq yetadi"
            value={
              empty
                ? "tugagan"
                : tempo.daysOfStock === null
                  ? "—"
                  : `${decimal(tempo.daysOfStock)} kun`
            }
            note={
              empty
                ? "omborda qoldiq yo'q"
                : tempo.daysOfStock === null
                  ? "bu davrda sotuv yo'q"
                  : "shu sur'atda"
            }
            tone={alarm ? "warn" : undefined}
          />
          <Tile
            label="Uzum darajasi"
            value={facts.rank ?? "—"}
            note={facts.rankNote && facts.rankNote !== facts.rank ? facts.rankNote : "kartochka"}
          />
          <Tile
            label="Qaytarish"
            value={
              facts.returnedPercent === null ? "—" : `${decimal(facts.returnedPercent)}%`
            }
            note={facts.returned !== null ? `${formatNumber(facts.returned)} dona` : "Uzum bo'yicha"}
            tone={
              facts.returnedPercent !== null && facts.returnedPercent >= 20 ? "warn" : undefined
            }
          />
          <Tile
            label="Holati"
            value={facts.status ?? "—"}
            note={facts.forecastOutOfStock ? "tugash arafasida" : "Uzumda"}
            tone={facts.forecastOutOfStock ? "warn" : undefined}
          />
          <Tile
            label="O'rtacha narx"
            value={
              data && chrono.some((row) => row.soldQuantity > 0)
                ? formatSumShort(
                    chrono.reduce((sum, r) => sum + (r.avgPrice ?? 0) * r.soldQuantity, 0) /
                      Math.max(1, chrono.reduce((sum, r) => sum + r.soldQuantity, 0)),
                  )
                : "—"
            }
            note={data ? `${days} kunda · sotilgan donaga` : loading ? "Yuklanmoqda..." : "Ma'lumot olinmadi"}
            series={chrono.map((r) => r.avgPrice ?? 0)}
            seriesLabel={`${days} kunlik grafik`}
          />
          <Tile
            label="Kuzatilayotgan so'z"
            value={data ? formatNumber(phrases.length) : "—"}
            note={
              !data ? loading ? "Yuklanmoqda..." : "Ma'lumot olinmadi" : phrases.length
                ? `${days} kunda · TOP-${TOP} da ${countTop(rows, phrases)} tasi`
                : "hali qo'shilmagan"
            }
          />
        </div>

        {alarm && (
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--warn)]/25 bg-[color:var(--warn)]/5 p-4 text-sm leading-6">
            <AlertTriangle className="mt-1 h-4 w-4 shrink-0 text-[var(--warn)]" />
            <span>
              {empty ? (
                <>
                  Tovar sotilyapti, lekin omborda qoldiq yo&apos;q. Har tugagan kun —
                  yo&apos;qotilgan buyurtma va kartochkaning qidiruvdagi o&apos;rniga zarba.
                </>
              ) : (
                <>
                  Shu sur&apos;atda qoldiq{" "}
                  <span className="font-medium">{decimal(tempo.daysOfStock ?? 0)} kunda</span>{" "}
                  tugaydi. Yetkazib berish muddatini hisobga olib hozir buyurtma bering.
                </>
              )}
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Kunlik savdo va qidiruvdagi o&apos;rin</h3>
            <p className="mt-1 text-xs text-muted-foreground">{data ? `${data.from} — ${data.to}` : `Oxirgi ${days} kun`}</p>
          </div>
          <div role="group" aria-label="Grafik va jadval davri" className="grid grid-cols-4 gap-1 rounded-xl border bg-muted/30 p-1">
            {RANGES.map((value) => (
              <Button key={value} variant="ghost" aria-pressed={value === days} className={cn("h-11 rounded-lg px-2 text-xs sm:px-3", value === days && "bg-background font-semibold text-foreground shadow-sm")} onClick={() => { setError(null); setDays(value); }}>
                {value} kun
              </Button>
            ))}
          </div>
        </div>

        {error ? (
          <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm"><p className="font-medium">Kunlik ma&apos;lumotlar yuklanmadi</p><p className="mt-1 text-muted-foreground">{error}</p></div>
            <Button variant="outline" className="h-11 shrink-0 rounded-xl" onClick={() => setRetry((attempt) => attempt + 1)}>Qayta urinish</Button>
          </div>
        ) : loading || !data ? (
          <div role="status" className="flex items-center justify-center gap-2 rounded-xl border border-dashed py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> {days} kunlik ma&apos;lumotlar yuklanmoqda...
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-xl border border-dashed px-4 py-12 text-center"><CalendarRange className="mx-auto mb-3 size-7 text-muted-foreground" /><p className="text-sm font-medium">Bu davrda ma&apos;lumot yo&apos;q</p><p className="mt-1 text-xs text-muted-foreground">Boshqa davrni tanlab ko&apos;ring.</p></div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground sm:hidden">Barcha ustunlarni ko&apos;rish uchun jadvalni yon tomonga suring.</p>
            <div role="region" aria-label="Kunlik savdo va qidiruv o'rinlari jadvali" tabIndex={0} className="max-w-full overflow-x-auto rounded-xl border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <table className="w-full min-w-[600px] text-sm [&_th]:py-3 [&_td]:py-3">
                <caption className="sr-only">{data.from} — {data.to}: kunlik sotuv, tushum, narx, qoldiq va qidiruvdagi o&apos;rinlar</caption>
                <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium">
                      Kun
                    </th>
                    <th className="px-3 py-2 text-right font-medium">Sotildi</th>
                    <th className="px-3 py-2 text-right font-medium">Tushum</th>
                    <th className="px-3 py-2 text-right font-medium">Narx</th>
                    <th className="px-3 py-2 text-right font-medium">Qoldiq</th>
                    {phrases.map((phrase) => (
                      <th
                        key={phrase}
                        className="max-w-[9rem] truncate px-3 py-2 text-right font-medium"
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
                      <td className="sticky left-0 z-10 whitespace-nowrap bg-background px-3 py-2 tabular-nums">
                        {row.day}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="flex items-center justify-end gap-2">
                          <span
                            className="h-1.5 rounded-full bg-primary/60"
                            style={{ width: `${Math.round((row.soldQuantity / peak) * 36)}px` }}
                          />
                          <span
                            className={cn(
                              "tabular-nums",
                              row.soldQuantity === 0 && "text-muted-foreground",
                            )}
                          >
                            {formatNumber(row.soldQuantity)}
                          </span>
                        </span>
                      </td>
                      <Money value={row.revenue} />
                      <Money value={row.avgPrice} />
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          row.stock === 0 && "text-[var(--warn)]",
                        )}
                      >
                        {formatNumber(row.stock)}
                      </td>
                      {phrases.map((phrase) => (
                        <PositionCell
                          key={phrase}
                          phrase={phrase}
                          day={row.day}
                          value={phrase in row.positions ? row.positions[phrase] : undefined}
                        />
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="rounded-xl bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              {"Qoldiq kirim va sotuvdan orqaga qarab tiklanadi. O'rin katagi: raqam — "}
              {"o'lchandi va topildi (quyuqroq — yuqoriroq o'rin); `·` — o'lchandi, lekin "}
              {`birinchi ${DEPTH} talikda yo'q; bo'sh katak — o'sha kuni o'lchov bo'lmagan.`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function countTop(rows: TimelineDay[], phrases: string[]): number {
  const latest = rows.find((r) => phrases.some((p) => r.positions[p] != null));
  if (!latest) return 0;
  return phrases.filter((p) => {
    const value = latest.positions[p];
    return value != null && value <= TOP;
  }).length;
}

function Money({ value }: { value: number | null }) {
  return (
    <td
      className={cn(
        "whitespace-nowrap px-3 py-2 text-right tabular-nums",
        !value && "text-muted-foreground",
      )}
    >
      {value ? formatSum(value) : "—"}
    </td>
  );
}

/**
 * O'rin katagi.
 *
 * Quyuqlik BITTA ohangda: rang faqat "qanchalik yuqorida" degan
 * kattalikni bildiradi, boshqa hech nimani emas. Raqamning o'zi doim
 * yozilgan — rangni ko'rmaydigan odam ham hamma narsani o'qiy oladi.
 */
function PositionCell({
  phrase,
  day,
  value,
}: {
  phrase: string;
  day: string;
  value: number | null | undefined;
}) {
  if (value === undefined) {
    return <td className="px-3 py-2" title={`${day} · ${phrase}: o'lchov bo'lmagan`} />;
  }
  if (value === null) {
    return (
      <td
        className="px-3 py-2 text-right text-xs tabular-nums text-muted-foreground"
        title={`${day} · ${phrase}: birinchi ${DEPTH} talikda topilmadi`}
      >
        ·
      </td>
    );
  }
  const strength = Math.max(0, 1 - (value - 1) / DEPTH);
  return (
    <td
      className="px-1.5 py-1 text-right"
      title={`${day} · ${phrase}: ${value}-o'rin`}
    >
      <span
        className={cn(
          "inline-block min-w-[2.25rem] rounded-md px-2 py-1 text-xs tabular-nums",
          value <= TOP ? "font-semibold text-foreground" : "text-foreground/80",
        )}
        style={{ backgroundColor: `color-mix(in oklab, var(--primary) ${(0.10 + 0.5 * strength) * 100}%, transparent)` }}
      >
        {value}
      </span>
    </td>
  );
}

function Tile({
  label,
  value,
  note,
  series,
  seriesLabel,
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  series?: number[];
  seriesLabel?: string;
  tone?: "warn";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col rounded-xl border bg-muted/15 p-3 sm:p-4",
        tone === "warn" && "border-[color:var(--warn)]/25 bg-[color:var(--warn)]/5",
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-2 text-base font-semibold leading-6 tabular-nums [overflow-wrap:anywhere] sm:text-lg",
          tone === "warn" && "text-[var(--warn)]",
        )}
      >
        {value}
      </div>
      {note && <div className="mt-1 text-xs leading-5 text-muted-foreground [overflow-wrap:anywhere]">{note}</div>}
      {series && series.length > 1 && <><Sparkline values={series} />{seriesLabel && <div className="mt-1 text-[10px] text-muted-foreground">{seriesLabel}</div>}</>}
    </div>
  );
}

/**
 * Kichik chiziq — kartochkadagi raqam qaysi tomonga ketayotganini
 * ko'rsatadi. O'qi ham, belgisi ham yo'q: bu yerda aniq qiymat emas,
 * SHAKL o'qiladi. Aniq qiymatlar pastdagi jadvalda turadi.
 */
function Sparkline({ values }: { values: number[] }) {
  const width = 100;
  const height = 22;
  const top = Math.max(...values, 0);
  if (top <= 0) return <div className="mt-2 h-[22px]" />;

  const step = width / Math.max(1, values.length - 1);
  const points = values
    .map((value, index) => `${(index * step).toFixed(1)},${(height - (value / top) * (height - 3) - 1.5).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="mt-2 h-[22px] w-full text-primary"
      aria-hidden="true"
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.75}
      />
    </svg>
  );
}
