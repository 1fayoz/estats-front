"use client";

import * as React from "react";
import Link from "next/link";

import { COLORS, ZTable, fmt, styles } from "@/features/report/ui";
import type { ShopRow, Totals } from "@/lib/report";

/** «Top-magazinlar» jadvali — «Ko'rib Uzum», «Kategoriyalar», «Raqobat» sahifalarida bir xil. */
export function TopShops({
  rows, totals, height, withSeller = false,
}: {
  rows: ShopRow[];
  totals: Totals;
  height?: number;
  withSeller?: boolean;
}) {
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" }>({ key: "revenue", dir: "desc" });
  const sorted = React.useMemo(() => {
    const value = (r: ShopRow) => (r as Record<string, unknown>)[sort.key] as number | null;
    return [...rows].sort((a, b) => ((value(a) ?? -Infinity) - (value(b) ?? -Infinity)) * (sort.dir === "asc" ? 1 : -1));
  }, [rows, sort]);
  return (
    <ZTable<ShopRow>
      rows={sorted}
      rowKey={(r) => `${r.shop}|${r.seller ?? ""}`}
      sort={sort.key}
      dir={sort.dir}
      onSort={(key, dir) => setSort({ key, dir })}
      height={height}
      columns={[
        {
          key: "shop", title: "Top-magazinlar", sortable: false,
          render: (r) => r.shop_id ? (
            <Link className={styles.link} href={`/market/shop?shop_id=${r.shop_id}`}>{r.shop}</Link>
          ) : r.shop,
        },
        ...(withSeller ? [{ key: "seller", title: "Sotuvchilar (yur.shaxs)", sortable: false,
                            render: (r: ShopRow) => r.seller }] : []),
        { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, bar: COLORS.bar },
        // O'sish HISOBOTNING O'ZI e'lon qilgan qiymat (tiklanmaydi) — u tushum
        // kunidan orqada bo'lsa sana sarlavhada ko'rsatiladi, yashirilmaydi.
        {
          key: "growth",
          title: totals?.growth_as_of
            ? `O'sish % (${totals.growth_as_of.slice(8)}.${totals.growth_as_of.slice(5, 7)})`
            : "O'sish %",
          num: true, value: (r) => r.growth, format: fmt.pct(1),
        },
        { key: "share", title: "Bozor ulushi %", num: true, value: (r) => r.share, format: fmt.pct(1),
          heat: COLORS.heatGreen },
      ]}
      totalsRow={totals ? {
        shop: "Jami",
        revenue: fmt.money(totals.revenue),
        growth: fmt.pct(1)(totals.growth),
        share: "100,0%",
      } : undefined}
    />
  );
}
