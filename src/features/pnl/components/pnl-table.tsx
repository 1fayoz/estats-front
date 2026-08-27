"use client";

import * as React from "react";
import { AlertTriangle, ArrowUpDown, Calculator } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  CardHead, CardList, CardSort, CardStats, DataCard, TableWrap,
} from "@/components/dashboard/data-cards";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductPnl } from "@/lib/types";

import { ProfitBadge } from "./summary-cards";

type SortKey = "profit" | "revenue" | "soldQuantity" | "cogs" | "margin" | "onHand";

const COLUMNS: { key: SortKey; label: string; hint?: string }[] = [
  { key: "soldQuantity", label: "Sotildi" },
  { key: "revenue", label: "Uzum to'lovi", hint: "komissiya va yetkazib berish ayirilgan" },
  { key: "cogs", label: "Tan narx (FIFO)" },
  { key: "profit", label: "Foyda / zarar" },
  { key: "margin", label: "Marja" },
  { key: "onHand", label: "Qoldiq" },
];

/** Per-product P&L, sortable — the loss-makers are usually what needs finding. */
export function PnlTable({ rows }: { rows: ProductPnl[] }) {
  const [sortKey, setSortKey] = React.useState<SortKey>("profit");
  const [asc, setAsc] = React.useState(false);

  const sorted = React.useMemo(
    () => [...rows].sort((a, b) => (asc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey])),
    [rows, sortKey, asc]
  );

  const toggle = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(false);
    }
  };

  if (!rows.length) {
    return (
      <EmptyState
        icon={Calculator}
        title="Bu davrda harakat yo'q"
        description="Sotuvlarni yuklang yoki boshqa sanani tanlang."
      />
    );
  }

  return (
    <>
      <CardSort
        options={COLUMNS.map((col) => ({ key: col.key, label: col.label }))}
        active={sortKey}
        onPick={toggle}
      />

      <CardList>
        {sorted.map((row) => (
          <DataCard key={row.warehouseProductId ?? row.title}>
            <CardHead
              image={row.image}
              title={row.title}
              note={
                <span className="flex flex-wrap items-center gap-x-1.5">
                  {row.skuCode ?? "—"}
                  {!row.isCosted && (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500">
                      <AlertTriangle className="h-3 w-3" />
                      {row.uncoveredQuantity} dona tan narxsiz
                    </span>
                  )}
                </span>
              }
              right={<ProfitBadge value={row.profit} />}
            />
            <CardStats
              items={[
                {
                  label: "Sotildi",
                  value: (
                    <>
                      {formatNumber(row.soldQuantity)} dona
                      {row.returnedQuantity > 0 && (
                        <span className="ml-1 text-xs text-amber-600 dark:text-amber-500">
                          {row.returnedQuantity} qaytdi
                        </span>
                      )}
                    </>
                  ),
                },
                { label: "Marja", value: row.soldQuantity ? `${row.margin.toFixed(1)}%` : "—",
                  tone: row.margin < 0 ? "bad" : undefined },
                { label: "Uzum to'lovi", value: formatSum(row.revenue) },
                {
                  label: "Tan narx (FIFO)",
                  value: row.cogs > 0 ? formatSum(row.cogs) : <Badge variant="secondary">kiritilmagan</Badge>,
                },
                {
                  label: "Keldi",
                  value: row.intakeQuantity ? `${formatNumber(row.intakeQuantity)} dona` : "—",
                  tone: row.intakeQuantity ? undefined : "muted",
                },
                { label: "Qoldiq", value: `${formatNumber(row.onHand)} dona` },
              ]}
            />
          </DataCard>
        ))}
      </CardList>

      <TableWrap>
      <table className="w-full min-w-[1000px] text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Tovar</th>
            <th className="px-3 py-3 text-right font-medium">Keldi</th>
            {COLUMNS.map((col) => (
              <th key={col.key} className="px-3 py-3 text-right font-medium">
                <button
                  type="button"
                  onClick={() => toggle(col.key)}
                  title={col.hint}
                  className={cn(
                    "inline-flex items-center gap-1 transition-colors hover:text-foreground",
                    sortKey === col.key && "text-foreground"
                  )}
                >
                  {col.label}
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {sorted.map((row) => (
            <tr
              key={row.warehouseProductId ?? row.title}
              className="transition-colors hover:bg-muted/30"
            >
              <td className="max-w-[340px] px-4 py-3">
                <div className="flex items-center gap-3">
                  {row.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.image}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md border object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md border bg-muted" />
                  )}
                  <div className="min-w-0">
                    <div className="truncate font-medium">{row.title}</div>
                    <div className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      {row.skuCode ?? "—"}
                      {!row.isCosted && (
                        <span
                          className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-500"
                          title={`${row.uncoveredQuantity} dona uchun kirim kiritilmagan — bu qismning tan narxi hisobga olinmadi`}
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {row.uncoveredQuantity} dona tan narxsiz
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-3 py-3 text-right tabular-nums">
                {row.intakeQuantity ? (
                  <>
                    <div>{formatNumber(row.intakeQuantity)} dona</div>
                    <div className="text-xs text-muted-foreground">
                      {formatSum(row.intakeCost)}
                    </div>
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>

              <td className="px-3 py-3 text-right tabular-nums">
                <div>{formatNumber(row.soldQuantity)} dona</div>
                {row.returnedQuantity > 0 && (
                  <div className="text-xs text-amber-600 dark:text-amber-500">
                    {row.returnedQuantity} qaytdi
                  </div>
                )}
              </td>

              <td className="px-3 py-3 text-right tabular-nums">
                <div>{formatSum(row.revenue)}</div>
                <div className="text-xs text-muted-foreground">
                  savdo {formatSum(row.gross)}
                </div>
              </td>

              <td className="px-3 py-3 text-right tabular-nums">
                {row.cogs > 0 ? (
                  formatSum(row.cogs)
                ) : (
                  <Badge variant="secondary">kiritilmagan</Badge>
                )}
              </td>

              <td className="px-3 py-3 text-right">
                <ProfitBadge value={row.profit} />
              </td>

              <td
                className={cn(
                  "px-3 py-3 text-right tabular-nums",
                  row.margin < 0 && "text-destructive"
                )}
              >
                {row.soldQuantity ? `${row.margin.toFixed(1)}%` : "—"}
              </td>

              <td className="px-3 py-3 text-right tabular-nums">
                <div>{formatNumber(row.onHand)} dona</div>
                {row.stockValue > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {formatSum(row.stockValue)}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </TableWrap>
    </>
  );
}
