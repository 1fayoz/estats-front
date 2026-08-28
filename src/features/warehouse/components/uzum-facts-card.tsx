"use client";

import { BadgePercent, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketplaceFacts } from "@/lib/types";

/** Shundan yuqori qaytarish ulushi — alohida e'tibor talab qiladi. */
const HIGH_RETURN = 20;

/**
 * Uzumning o'zi aytadigan, lekin hech qayerda ko'rsatilmagan raqamlar.
 *
 * Bularning hammasi sotuvchi API'sining javobida allaqachon kelib
 * turardi va bazada `raw` ichida yotardi — kartochka darajasi,
 * qaytarish ulushi, qoldiqning ichki taqsimoti, kartochka qatnashgan
 * aksiya. Ya'ni bu ma'lumot uchun na yangi so'rov, na yangi ustun
 * kerak edi: u shunchaki ko'rsatilmasdi.
 */
export function UzumFactsCard({ facts }: { facts: MarketplaceFacts }) {
  const hasStock =
    facts.available !== null ||
    facts.returned !== null ||
    facts.defected !== null ||
    facts.pending !== null;
  if (!facts.rank && !facts.status && !hasStock && !facts.promoName) return null;

  const risky = facts.returnedPercent !== null && facts.returnedPercent >= HIGH_RETURN;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Store className="h-4 w-4" /> Uzum kartochkasi
        </CardTitle>
        <CardDescription>
          Uzum sotuvchi kabinetidagi holat — daraja, qaytarish va aksiya.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {facts.status && (
            <Badge
              variant="secondary"
              className={cn(facts.forecastOutOfStock && "border-amber-500/40 bg-amber-500/10")}
            >
              {facts.status}
            </Badge>
          )}
          {facts.rank && <Badge variant="outline">Daraja {facts.rank}</Badge>}
          {facts.hasActiveDiscount && <Badge variant="outline">Chegirmada</Badge>}
          {facts.mxik && (
            <a
              href={`https://tasnif.soliq.uz/?search=${encodeURIComponent(facts.mxik)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground underline decoration-dotted"
            >
              MXIK {facts.mxik}
            </a>
          )}
        </div>

        {hasStock && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Sotuvda" value={facts.available} />
            <Fact label="Band qilingan" value={facts.reserved} />
            <Fact label="Qaytgan" value={facts.returned} tone={risky ? "warn" : undefined} />
            <Fact label="Brak" value={facts.defected} />
          </div>
        )}

        {facts.returnedPercent !== null && (
          <div
            className={cn(
              "rounded-lg border p-3 text-sm",
              risky && "border-amber-500/40 bg-amber-500/5",
            )}
          >
            Qaytarish ulushi:{" "}
            <span className={cn("font-semibold", risky && "text-amber-600 dark:text-amber-500")}>
              {facts.returnedPercent}%
            </span>
            {risky && (
              <span className="text-muted-foreground">
                {" "}
                — har uchinchiga yaqin dona qaytyapti. Qaytgan dona logistikani ikki
                marta to&apos;latadi va foydani jimgina yeydi; sababi odatda o&apos;lcham
                yoki rasm bilan haqiqat orasidagi farq.
              </span>
            )}
          </div>
        )}

        {facts.promoName && (
          <div className="flex items-start gap-3 rounded-lg border p-3 text-sm">
            <BadgePercent className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <div>
              <div className="font-medium">{facts.promoName}</div>
              <div className="mt-0.5 text-muted-foreground">
                {facts.inPromo ? "Kartochka aksiyada" : "Kartochka aksiyaga kirmagan"}
                {facts.promoPrice ? ` · aksiya narxi ${formatSum(facts.promoPrice)}` : ""}
                {facts.promoEndsAt ? ` · ${facts.promoEndsAt.slice(0, 10)} gacha` : ""}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Fact({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | null;
  tone?: "warn";
}) {
  return (
    <div className={cn("rounded-lg border p-3", tone === "warn" && "border-amber-500/40 bg-amber-500/5")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "warn" && "text-amber-600 dark:text-amber-500",
        )}
      >
        {value === null ? "—" : `${formatNumber(value)} dona`}
      </div>
    </div>
  );
}
