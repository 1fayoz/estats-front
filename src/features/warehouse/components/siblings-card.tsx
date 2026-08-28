"use client";

import Link from "next/link";
import { Layers } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CardHead, CardList, CardStats, DataCard } from "@/components/dashboard/data-cards";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductTempo, SiblingSku } from "@/lib/types";

/**
 * Bitta Uzum kartochkasidagi barcha variantlar — qaysi o'lcham/rang ketyapti.
 *
 * Xaridor bitta kartochkani ko'radi, sotuvchi esa o'nta SKU'ni
 * boshqaradi. 44-o'lcham tugab, 38-o'lcham qotib turgani hisobotning
 * hech qayerida ko'rinmasdi: har SKU alohida sahifada edi va ularni
 * yonma-yon qo'yish uchun sotuvchi o'zi eslab yurishi kerak edi.
 */
export function SiblingsCard({
  siblings,
  tempo,
}: {
  siblings: SiblingSku[];
  tempo: ProductTempo;
}) {
  if (siblings.length < 2) return null;

  const sold = siblings.reduce((sum, row) => sum + row.soldQuantity, 0);
  const stock = siblings.reduce((sum, row) => sum + row.onHand, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Layers className="h-4 w-4" /> Kartochka variantlari ({siblings.length})
        </CardTitle>
        <CardDescription>
          {`Oxirgi ${tempo.days} kunda ${formatNumber(sold)} dona sotildi, omborda ${formatNumber(stock)} dona. `}
          Bitta Uzum kartochkasidagi barcha o&apos;lcham va ranglar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <CardList>
          {siblings.map((row) => (
            <DataCard key={row.id} className={cn(row.isCurrent && "border-primary/50 bg-primary/5")}>
              <CardHead
                image={row.image ?? undefined}
                title={row.variantName || row.title}
                note={row.skuCode ?? undefined}
                right={
                  row.isCurrent ? (
                    <Badge variant="secondary">shu tovar</Badge>
                  ) : (
                    <Link href={`/warehouse/${row.id}`} className="text-sm text-primary underline">
                      ochish
                    </Link>
                  )
                }
              />
              <CardStats
                items={[
                  { label: "Sotildi", value: `${formatNumber(row.soldQuantity)} dona` },
                  { label: "Qoldiq", value: `${formatNumber(row.onHand)} dona` },
                  { label: "O'rtacha narx", value: row.avgPrice ? formatSum(row.avgPrice) : "—" },
                  { label: "Ulush", value: `${formatNumber(row.share)}%` },
                ]}
              />
            </DataCard>
          ))}
        </CardList>

        <div className="hidden overflow-x-auto rounded-lg border md:block">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Variant</th>
                <th className="px-3 py-2 text-left font-medium">SKU</th>
                <th className="px-3 py-2 text-right font-medium">Sotildi</th>
                <th className="px-3 py-2 text-right font-medium">Tushum</th>
                <th className="px-3 py-2 text-right font-medium">O&apos;rtacha narx</th>
                <th className="px-3 py-2 text-right font-medium">Qoldiq</th>
                <th className="px-3 py-2 text-right font-medium">Ulush</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {siblings.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "transition-colors hover:bg-muted/30",
                    row.isCurrent && "bg-primary/5",
                  )}
                >
                  <td className="px-3 py-2">
                    {row.isCurrent ? (
                      <span className="font-medium">{row.variantName || row.title}</span>
                    ) : (
                      <Link href={`/warehouse/${row.id}`} className="font-medium hover:underline">
                        {row.variantName || row.title}
                      </Link>
                    )}
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{row.skuCode ?? "—"}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatNumber(row.soldQuantity)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">{formatSum(row.revenue)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.avgPrice ? formatSum(row.avgPrice) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {row.onHand === 0 ? (
                      <Badge variant="secondary">tugagan</Badge>
                    ) : (
                      formatNumber(row.onHand)
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                    {formatNumber(row.share)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
