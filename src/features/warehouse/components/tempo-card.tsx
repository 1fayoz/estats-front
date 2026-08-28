"use client";

import { AlertTriangle, CalendarDays, Gauge } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductTempo } from "@/lib/types";

/** Shuncha kunlik zaxiradan kam qolganda ogohlantiriladi. */
const LOW_DAYS = 14;

/**
 * Kasrli ko'rsatkichlar uchun.
 *
 * `formatNumber` butungacha yaxlitlaydi va "kuniga 0,47 dona" ni "0 dona"
 * qilib qo'yadi — ya'ni sekin ketayotgan tovar umuman sotilmayotgandek
 * ko'rinadi. Bu yerda kasr aynan shuning uchun saqlanadi.
 */
function decimal(value: number): string {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 1 }).format(value);
}

/**
 * Tovarning sur'ati: kuniga qancha ketyapti va qoldiq qancha kunga yetadi.
 *
 * Nima uchun alohida blok. Sahifadagi "sotildi / qoldiq" raqamlari
 * butun davr yig'indisi — ular tovar bugun tez ketayaptimi yoki qotib
 * turibdimi degan savolga javob bermaydi. Qachon buyurtma berish
 * kerakligini esa aynan shu ikki raqam hal qiladi: kuniga necha dona
 * va qoldiq necha kunga yetadi.
 */
export function TempoCard({ tempo, onHand }: { tempo: ProductTempo; onHand: number }) {
  const empty = onHand <= 0;
  const low = !empty && tempo.daysOfStock !== null && tempo.daysOfStock <= LOW_DAYS;
  // Sotuvi ham, qoldig'i ham yo'q tovar — muammo emas, shunchaki uxlab
  // yotgan kartochka. Sariq rang faqat talab BOR joyda ma'noga ega.
  const alarm = low || (empty && tempo.soldQuantity > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Gauge className="h-4 w-4" /> Savdo sur&apos;ati
        </CardTitle>
        <CardDescription>
          {`Oxirgi ${tempo.days} kun bo'yicha`}
          {tempo.firstSaleAt && (
            <>
              {" · "}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                birinchi sotuv {tempo.firstSaleAt.slice(0, 10)}
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            label="Kuniga o'rtacha"
            value={`${decimal(tempo.avgPerDay)} dona`}
            hint={`${formatNumber(tempo.soldQuantity)} dona / ${tempo.days} kun`}
          />
          <Stat
            label="Qoldiq yetadi"
            value={
              empty
                ? "tugagan"
                : tempo.daysOfStock === null
                  ? "—"
                  : `${decimal(tempo.daysOfStock)} kun`
            }
            hint={
              empty
                ? "omborda qoldiq yo'q"
                : tempo.daysOfStock === null
                  ? "bu davrda sotuv yo'q"
                  : undefined
            }
            tone={alarm ? "warn" : undefined}
          />
          <Stat label={`${tempo.days} kunlik tushum`} value={formatSum(tempo.revenue)} />
          <Stat
            label={`${tempo.days} kunlik foyda`}
            value={formatSum(tempo.profit)}
            tone={tempo.profit >= 0 ? "good" : "bad"}
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
                  tugaydi. Yetkazib berish muddatini hisobga olib hozir buyurtma bering —
                  tovar tugagan kunlar kartochkaning qidiruvdagi o&apos;rniga ham uriladi.
                </>
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "good" | "bad" | "warn";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "warn" && "border-amber-500/40 bg-amber-500/5",
      )}
    >
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "good" && "text-emerald-600 dark:text-emerald-400",
          tone === "bad" && "text-destructive",
          tone === "warn" && "text-amber-600 dark:text-amber-500",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
