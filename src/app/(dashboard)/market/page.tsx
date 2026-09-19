"use client";

import * as React from "react";
import { DailyBars, Donut, GrowthBars } from "@/features/report/charts";
import { TopShops } from "@/features/report/top-shops";
import {
  Card, Empty, PeriodControl, ReportPage, Row, Scorecard, SourceNote, fmt, useLoad, useParams,
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
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period })} style={{ width: 340 }} />
        {KPIS.map((k) => {
          const kpi = data?.kpis?.values?.[k.key];
          const value = kpi?.value ?? (k.key === "revenue" && revenueFallback ? revenueFallback : null);
          return (
            <Scorecard key={k.key} label={k.label} value={value} growth={kpi?.growth ?? null}
                       format={k.format} invert={k.invert} />
          );
        })}
      </Row>

      {error ? <Card><Empty>{error}</Empty></Card> : null}

      <Row>
        <Card title="Top-magazinlar foydaga ko'ra" center style={{ flex: "0 0 340px" }}>
          {toifas.length ? (
            <Donut data={toifas.map((t) => ({ name: t.toifa, value: t.revenue, share: t.share }))} />
          ) : <Empty />}
        </Card>
        <Card style={{ flex: "0 0 360px" }}>
          {toifas.length ? (
            <GrowthBars data={[...toifas].filter((t) => t.in_growth !== false)
              .sort((a, b) => (b.growth ?? -9) - (a.growth ?? -9))
              .map((t) => ({ name: t.toifa, growth: t.growth }))} />
          ) : <Empty />}
        </Card>
        <Card style={{ flex: 1 }}>
          <TopShops rows={data?.top_shops ?? []} totals={data?.top_shops_totals ?? null} height={372} />
        </Card>
      </Row>

      <Card>
        {data?.daily?.length ? <DailyBars data={data.daily} /> : <Empty>Kunlik tushum hali yuklanmagan</Empty>}
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
