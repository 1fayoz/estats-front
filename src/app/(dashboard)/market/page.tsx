"use client";

import * as React from "react";
import { DailyBars, Donut, GrowthBars } from "@/features/report/charts";
import { TopShops } from "@/features/report/top-shops";
import {
  Card, ChartGrid, Empty, FilterBar, PeriodControl, ReportPage, Scorecard, SourceNote, StatsGrid, fmt, useLoad,
  useParams,
} from "@/features/report/ui";
import { report } from "@/lib/report";

/*
  «Ko'rib Uzum» — tashqi hisobotning birinchi sahifasi bilan bir-bir:
  «Muddat» filtri + 7 ta ko'rsatkich, toifalar ulushi (donut), toifalar
  o'sishi, top-do'konlar va oxirgi 30 kunlik tushum.
*/

const KPIS: { key: string; label: string; format?: (v: number | null | undefined) => string; invert?: boolean }[] = [
  { key: "revenue", label: "Tushim (soʻm)" },
  { key: "shops", label: "Do'kon", format: fmt.int },
  { key: "shops_with_sales", label: "... sotuvlar bilan", format: fmt.pct(0) },
  { key: "cards", label: "Kartochkalar" },
  { key: "cards_with_sales", label: "... sotuvlar bilan", format: fmt.pct(0) },
  { key: "skus", label: "SKU" },
  { key: "turnover", label: "Oborot, kunlik", format: fmt.dec(2), invert: true },
];

export default function MarketOverviewPage() {
  const [params, setParams] = useParams({ period: "d30" });
  const { data, error } = useLoad(() => report.overview(params.period), [params.period]);

  const toifas = data?.toifas ?? [];
  const revenueFallback = toifas.reduce((sum, t) => sum + (t.revenue || 0), 0);

  return (
    <ReportPage>
      <FilterBar>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period })} style={{ width: 280 }} />
      </FilterBar>
      <StatsGrid>
        {KPIS.map((k) => {
          const kpi = data?.kpis?.values?.[k.key];
          const value = kpi?.value ?? (k.key === "revenue" && revenueFallback ? revenueFallback : null);
          // Do'kon kartalari eng yangi HAQIQIY do'kon eksportidan olinadi
          // va u tushum kunidan orqada bo'lishi mumkin — sana YASHIRILMAYDI
          // (aks holda ikki xil kunning raqami bir qatorda jimgina turardi).
          const stale = kpi?.as_of && data?.meta?.as_of && kpi.as_of !== data.meta.as_of
            ? `${kpi.as_of.slice(8)}.${kpi.as_of.slice(5, 7)} holatiga` : undefined;
          return (
            <Scorecard key={k.key} label={k.label} value={value} growth={kpi?.growth ?? null}
                       compare={stale} format={k.format} invert={k.invert} />
          );
        })}
      </StatsGrid>

      {error ? <Card><Empty>{error}</Empty></Card> : null}

      <ChartGrid>
        <Card title="Kategoriyalar ulushi">
          {toifas.length ? (
            <Donut data={toifas.map((t) => ({ name: t.toifa, value: t.revenue, share: t.share }))} />
          ) : <Empty />}
        </Card>
        <Card title="Kategoriyalar o‘sishi">
          {toifas.length ? (
            <GrowthBars data={[...toifas].filter((t) => t.in_growth !== false)
              .sort((a, b) => (b.growth ?? -9) - (a.growth ?? -9))
              .map((t) => ({ name: t.toifa, growth: t.growth }))} />
          ) : <Empty />}
        </Card>
        <Card title="Top do‘konlar">
          <TopShops rows={data?.top_shops ?? []} totals={data?.top_shops_totals ?? null} height={372} />
        </Card>
      </ChartGrid>

      <Card>
        {data?.daily?.length ? <DailyBars data={data.daily} /> : <Empty>Kunlik tushum hali yuklanmagan</Empty>}
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
