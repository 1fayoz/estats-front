"use client";

import * as React from "react";
import { PackagePlus, PackageX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatNumber, formatSum } from "@/lib/format";
import type { WarehouseProduct } from "@/lib/types";

interface ProductTableProps {
  items: WarehouseProduct[];
  onIntake: (product: WarehouseProduct) => void;
}

export function ProductTable({ items, onIntake }: ProductTableProps) {
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
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Tovar</th>
            <th className="px-3 py-3 text-right font-medium">Uzum narxi</th>
            <th className="px-3 py-3 text-right font-medium">Tan narx</th>
            <th className="px-3 py-3 text-right font-medium">Qoldiq</th>
            <th className="px-3 py-3 text-right font-medium">Zaxira qiymati</th>
            <th className="px-3 py-3 text-right font-medium">Uzum qoldig'i</th>
            <th className="px-4 py-3 text-right font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y">
          {items.map((item) => {
            const hasCost = item.lastCost != null || item.averageCost > 0;
            return (
              <tr key={item.id} className="transition-colors hover:bg-muted/30">
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
                  <Button size="sm" variant="outline" onClick={() => onIntake(item)}>
                    <PackagePlus className="h-3.5 w-3.5" /> Kirim
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
