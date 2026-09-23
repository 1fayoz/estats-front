"use client";

import * as React from "react";
import Link from "next/link";

import { ToifaControl } from "@/features/report/filters";
import {
  COLORS, Card, Empty, FilterBar, InputControl, PeriodControl, ReportPage, Scorecard, SourceNote, StatsGrid, ZTable, fmt, styles,
  useLoad, useParams,
} from "@/features/report/ui";
import { report, type ShopRow } from "@/lib/report";

/*
  «Do'konlar reytingi» — toifa ichida do'konlar tushum bo'yicha, sotuvchi
  (yuridik shaxs) nomi bilan. Ko'rsatkich kartalari «Kategoriyalar»
  sahifasidagi bilan bir xil manbadan (toifa kesimi).
*/

const LIMIT = 100;

const KPIS: { key: string; label: string; format?: (v: number | null | undefined) => string; invert?: boolean }[] = [
  { key: "revenue", label: "Tushim (soʻm)" },
  { key: "units", label: "Sotuv, donada" },
  { key: "shops", label: "Do'konlar soni", format: fmt.int },
  { key: "shops_with_sales", label: "...sotuvlar bilan", format: fmt.pct(0) },
  { key: "cards", label: "Kartochkalar soni" },
  { key: "cards_with_sales", label: "...sotuvlar bilan", format: fmt.pct(0) },
  { key: "skus", label: "SKU" },
  { key: "turnover", label: "Oborot, kunlik", format: fmt.int, invert: true },
];

export default function ShopsRatingPage() {
  const [params, setParams] = useParams({ period: "d30", toifa: "Kiyim", shop: "", sort: "revenue", dir: "desc",
                                          offset: "0" });
  const offset = Number(params.offset) || 0;
  const { data, error } = useLoad(
    () => report.shops({ period: params.period, toifa: params.toifa, shop: params.shop || undefined,
                         sort: params.sort, dir: params.dir, offset, limit: LIMIT }),
    [params.period, params.toifa, params.shop, params.sort, params.dir, offset],
  );
  const kpis = useLoad(() => report.categories(params.period, params.toifa), [params.period, params.toifa]).data;
  const reset = { offset: null };

  return (
    <ReportPage>
      <FilterBar>
        <PeriodControl label="Tushim (soʻm)" value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period, ...reset })} style={{ width: 195 }} />
        <ToifaControl label="Toifa" value={params.toifa} style={{ flex: 1 }}
                      onChange={(toifa) => toifa && setParams({ toifa, ...reset })} />
        <InputControl label="Do'kon" value={params.shop} onCommit={(shop) => setParams({ shop, ...reset })}
                      style={{ flex: 1 }} />
      </FilterBar>
      <StatsGrid>
        {KPIS.map((k) => {
          const kpi = kpis?.kpis?.values?.[k.key];
          const fallback = k.key === "revenue" ? data?.totals?.revenue ?? null : null;
          return (
            <Scorecard key={k.key} label={k.label} value={kpi?.value ?? fallback}
                       growth={kpi?.growth ?? (k.key === "revenue" ? data?.totals?.growth ?? null : null)}
                       format={k.format} invert={k.invert} />
          );
        })}
      </StatsGrid>
      <Card title="Top do‘konlar">
        {error ? <Empty>{error}</Empty> : null}
        <ZTable<ShopRow>
          rows={data?.items ?? []}
          rowKey={(r) => `${r.shop}|${r.seller}`}
          sort={params.sort}
          dir={params.dir as "asc" | "desc"}
          onSort={(sort, dir) => setParams({ sort, dir, ...reset })}
          offset={offset}
          total={data?.total}
          limit={LIMIT}
          onPage={(o) => setParams({ offset: String(o) })}
          height="calc(100vh - 330px)"
          columns={[
            { key: "shop", title: "Do'kon",
              render: (r) => r.shop_id ? (
                <Link className={styles.link} href={`/market/shop?shop_id=${r.shop_id}`}>{r.shop}</Link>
              ) : <span className={styles.link}>{r.shop}</span> },
            { key: "seller", title: "Sotuvchilar (yur.shaxs)",
              render: (r) => <span style={{ whiteSpace: "nowrap" }}>{(r.seller ?? "").slice(0, 28)}
                {(r.seller ?? "").length > 28 ? "…" : ""}</span> },
            { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, format: fmt.compact,
              bar: COLORS.bar },
            { key: "growth", title: "O'sish %", num: true, value: (r) => r.growth, format: fmt.pct(0) },
            { key: "share", title: "Bozor ulushi", num: true, value: (r) => r.share, format: fmt.pct(1),
              heat: COLORS.heatGreen },
            { key: "units", title: "Sotuv, donada", num: true, value: (r) => r.units },
            { key: "daily_units", title: "Kunlik sotuv (dona)", num: true, value: (r) => r.daily_units },
            { key: "turnover", title: "Oborot, kunlik", num: true, value: (r) => r.turnover,
              format: (v) => (v == null ? "null" : fmt.int(v)), heat: COLORS.heatLight },
          ]}
        />
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
