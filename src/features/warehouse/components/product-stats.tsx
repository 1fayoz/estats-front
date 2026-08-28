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
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 1 }).format(value);
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
  const [data, setData] = React.useState<ProductTimeline | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchProductTimeline(productId, days)
      .then((found) => {
        if (!alive) return;
        setData(found);
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
  }, [productId, days]);

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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4" /> Savdo ko&apos;rsatkichlari
            </CardTitle>
            <CardDescription>
              {data ? `${data.from} — ${data.to}` : `Oxirgi ${days} kun`}
              {tempo.firstSaleAt && ` · birinchi sotuv ${tempo.firstSaleAt.slice(0, 10)}`}
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

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          <Tile
            label="Tushum"
            value={formatSumShort(tempo.revenue)}
            note={`${tempo.days} kunda`}
            series={chrono.map((r) => r.revenue)}
          />
          <Tile
            label="Sotuv, donada"
            value={formatNumber(tempo.soldQuantity)}
            note={`${formatNumber(tempo.orders)} ta buyurtma`}
            series={chrono.map((r) => r.soldQuantity)}
          />
          <Tile
            label="Kuniga o'rtacha"
            value={`${decimal(tempo.avgPerDay)} dona`}
            note={`${tempo.days} kun bo'yicha`}
            series={chrono.map((r) => r.soldQuantity)}
          />
          <Tile
            label="O'rtacha qoldiq"
            value={`${decimal(tempo.avgStock)} dona`}
            note={`hozir ${formatNumber(onHand)} dona`}
            series={chrono.map((r) => r.stock)}
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
              tempo.soldQuantity > 0
                ? formatSumShort(
                    chrono.reduce((sum, r) => sum + (r.avgPrice ?? 0) * r.soldQuantity, 0) /
                      Math.max(1, chrono.reduce((sum, r) => sum + r.soldQuantity, 0)),
                  )
                : "—"
            }
            note="sotilgan donaga"
            series={chrono.map((r) => r.avgPrice ?? 0)}
          />
          <Tile
            label="Kuzatilayotgan so'z"
            value={formatNumber(phrases.length)}
            note={
              phrases.length
                ? `TOP-${TOP} da ${countTop(rows, phrases)} tasi`
                : "hali qo'shilmagan"
            }
          />
        </div>

        {alarm && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
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

        {error ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{error}</p>
        ) : loading && !data ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
          </div>
        ) : (
          <>
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
                      <td className="sticky left-0 z-10 bg-card px-3 py-2 tabular-nums">
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
                              row.soldQuantity === 0 && "text-muted-foreground/50",
                            )}
                          >
                            {row.soldQuantity}
                          </span>
                        </span>
                      </td>
                      <Money value={row.revenue} />
                      <Money value={row.avgPrice} />
                      <td
                        className={cn(
                          "px-3 py-2 text-right tabular-nums",
                          row.stock === 0 && "text-amber-600 dark:text-amber-500",
                        )}
                      >
                        {row.stock}
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

            <p className="text-xs text-muted-foreground">
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
        "px-3 py-2 text-right tabular-nums",
        !value && "text-muted-foreground/50",
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
        className="px-3 py-2 text-right text-xs tabular-nums text-muted-foreground/40"
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
  tone,
}: {
  label: string;
  value: string;
  note?: string;
  series?: number[];
  tone?: "warn";
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-3",
        tone === "warn" && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "warn" && "text-amber-600 dark:text-amber-500",
        )}
      >
        {value}
      </div>
      {note && <div className="mt-0.5 text-xs text-muted-foreground">{note}</div>}
      {series && series.length > 1 && <Sparkline values={series} />}
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
