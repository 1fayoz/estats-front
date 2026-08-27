"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PackagePlus, PackageX, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CardHead, CardList, CardStats, DataCard, TableWrap,
} from "@/components/dashboard/data-cards";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatNumber, formatSum } from "@/lib/format";
import type { WarehouseProduct } from "@/lib/types";

interface ProductTableProps {
  items: WarehouseProduct[];
  onIntake: (product: WarehouseProduct) => void;
}

export function ProductTable({ items, onIntake }: ProductTableProps) {
  const router = useRouter();

  if (!items.length) {
    return (
      <EmptyState
        icon={PackageX}
        title="Tovar topilmadi"
        description="Uzum katalogini sinxronlang yoki qidiruv shartini o'zgartiring."
      />
    );
  }

  return (
    <>
      <CardList>
        {items.map((item) => {
          const hasCost = item.lastCost != null || item.averageCost > 0;
          return (
            <DataCard key={item.id} onClick={() => router.push(`/warehouse/${item.id}`)}>
              <CardHead
                image={item.image}
                title={item.title}
                note={[item.variantName, item.skuCode].filter(Boolean).join(" · ") || "—"}
              />
              <CardStats
                items={[
                  {
                    label: "Uzum narxi",
                    value: item.marketplacePrice ? formatSum(item.marketplacePrice) : "—",
                  },
                  {
                    label: "Tan narx",
                    value: hasCost ? (
                      formatSum(item.lastCost ?? item.averageCost)
                    ) : (
                      <Badge variant="secondary">kiritilmagan</Badge>
                    ),
                  },
                  { label: "Qoldiq", value: `${formatNumber(item.stockQuantity)} dona` },
                  {
                    label: "Zaxira qiymati",
                    value: item.stockValue > 0 ? formatSum(item.stockValue) : "—",
                  },
                  {
                    label: "Keldi / sotildi",
                    value: `${formatNumber(item.totalIntakeQuantity)} / ${formatNumber(item.totalSoldQuantity)}`,
                  },
                  {
                    label: "Qaytdi",
                    value: item.totalReturnedQuantity ? (
                      <span className="inline-flex items-center gap-1">
                        {formatNumber(item.totalReturnedQuantity)}
                        {item.pendingReturnQuantity > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-500">
                            <Truck className="h-3 w-3" />
                            {formatNumber(item.pendingReturnQuantity)}
                          </span>
                        )}
                      </span>
                    ) : (
                      "—"
                    ),
                  },
                ]}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onIntake(item);
                }}
              >
                <PackagePlus className="h-3.5 w-3.5" /> Kirim qo&apos;shish
              </Button>
            </DataCard>
          );
        })}
      </CardList>

      <TableWrap>
      <table className="w-full min-w-[1120px] text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Tovar</th>
            <th className="px-3 py-3 text-right font-medium">Uzum narxi</th>
            <th className="px-3 py-3 text-right font-medium">Tan narx</th>
            <th className="px-3 py-3 text-right font-medium" title="Butun davr bo'yicha kirim">
              Keldi
            </th>
            <th className="px-3 py-3 text-right font-medium" title="Butun davr bo'yicha sotuv">
              Sotildi
            </th>
            <th className="px-3 py-3 text-right font-medium" title="Zakaz qilingan, lekin qaytarilgan">
              Qaytdi
            </th>
            <th className="px-3 py-3 text-right font-medium" title="Keldi − sotildi">
              Qoldiq
            </th>
            <th className="px-3 py-3 text-right font-medium">Zaxira qiymati</th>
            <th className="px-3 py-3 text-right font-medium">Uzum qoldig'i</th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const hasCost = item.lastCost != null || item.averageCost > 0;
            return (
              <tr
                key={item.id}
                onClick={() => router.push(`/warehouse/${item.id}`)}
                // Klaviatura bilan ham ochilsin — qator endi yagona kirish nuqtasi.
                tabIndex={0}
                role="link"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/warehouse/${item.id}`);
                  }
                }}
                className="cursor-pointer transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:outline-none"
              >
                <td className="max-w-[380px] px-4 py-3">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt=""
                        className="h-10 w-10 shrink-0 rounded-md border object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-10 w-10 shrink-0 rounded-md border bg-muted" />
                    )}
                    <div className="min-w-0">
                      <div className="truncate font-medium">{item.title}</div>
                      <div className="truncate text-xs text-muted-foreground">
                        {[item.variantName, item.skuCode].filter(Boolean).join(" · ") || "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {item.marketplacePrice ? formatSum(item.marketplacePrice) : "—"}
                  {item.commissionRate != null && (
                    <div className="text-xs text-muted-foreground">
                      komissiya {item.commissionRate}%
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {hasCost ? (
                    <>
                      <div className="font-medium">
                        {formatSum(item.lastCost ?? item.averageCost)}
                      </div>
                      {item.averageCost > 0 &&
                        item.lastCost != null &&
                        Math.round(item.averageCost) !== Math.round(item.lastCost) && (
                          <div className="text-xs text-muted-foreground">
                            o'rtacha {formatSum(item.averageCost)}
                          </div>
                        )}
                    </>
                  ) : (
                    <Badge variant="secondary">kiritilmagan</Badge>
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                  {formatNumber(item.totalIntakeQuantity)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                  {formatNumber(item.totalSoldQuantity)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                  {item.totalReturnedQuantity ? (
                    <>
                      {formatNumber(item.totalReturnedQuantity)}
                      {item.pendingReturnQuantity > 0 && (
                        <div
                          className="flex items-center justify-end gap-1 text-xs text-amber-600 dark:text-amber-500"
                          title="Hisobda qoldiqqa qaytgan, lekin jismonan hali kelmagan"
                        >
                          <Truck className="h-3 w-3" />
                          {`${formatNumber(item.pendingReturnQuantity)} yo'lda`}
                        </div>
                      )}
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-3 py-3 text-right tabular-nums font-medium">
                  {formatNumber(item.stockQuantity)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {item.stockValue > 0 ? formatSum(item.stockValue) : "—"}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                  {item.marketplaceStock ?? 0}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    // Qator bosilganda detalga o'tadi — tugma bosilsa faqat
                    // kirim oynasi ochilishi kerak, ikkalasi bir vaqtda emas.
                    onClick={(e) => {
                      e.stopPropagation();
                      onIntake(item);
                    }}
                  >
                    <PackagePlus className="h-3.5 w-3.5" /> Kirim
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </TableWrap>
    </>
  );
}
