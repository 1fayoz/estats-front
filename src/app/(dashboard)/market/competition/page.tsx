"use client";

import * as React from "react";

import { Bubbles } from "@/features/report/charts";
import { TopShops } from "@/features/report/top-shops";
import {
  Card, Empty, PeriodControl, ReportPage, Row, Scorecard, SourceNote, fmt, useLoad, useParams,
} from "@/features/report/ui";
import { report } from "@/lib/report";

/*
  «Raqobat / assortiment» — toifalar pufakchali grafigi: gorizontalda
  do'konlar soni (raqobat), vertikalda kartochkalar soni (assortiment),
  hajmi — tushum. O'ngda top-do'konlar.
*/

const KPIS: { key: string; label: string; format?: (v: number | null | undefined) => string; invert?: boolean }[] = [
  { key: "revenue", label: "Tushim (soʻm)" },
  { key: "shops", label: "Do'kon", format: fmt.int },
  { key: "shops_with_sales", label: "... sotuvlar bilan", format: fmt.pct(0) },
  { key: "cards", label: "Kartochkalar" },
  { key: "cards_with_sales", label: "... sotuvlar bilan", format: fmt.pct(0) },
  { key: "skus", label: "SKU" },
  { key: "turnover", label: "Oborot, kunlik", format: fmt.int, invert: true },
];

export default function CompetitionPage() {
  const [params, setParams] = useParams({ period: "d30" });
  const { data, error } = useLoad(() => report.competition(params.period), [params.period]);
  const revenueFallback = (data?.toifas ?? []).reduce((sum, t) => sum + (t.revenue || 0), 0) || null;

  return (
    <ReportPage>
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period })} style={{ width: 340 }} />
        {KPIS.map((k) => {
          const kpi = data?.kpis?.values?.[k.key];
          return (
            <Scorecard key={k.key} label={k.label} format={k.format} invert={k.invert}
                       value={kpi?.value ?? (k.key === "revenue" ? revenueFallback : null)}
                       growth={kpi?.growth ?? null} />
          );
        })}
      </Row>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Row>
        <Card style={{ flex: "1 1 58%" }}>
          {data?.bubbles?.length ? <Bubbles data={data.bubbles} /> : <Empty>Toifalar kesimi hali yuklanmagan</Empty>}
        </Card>
        <Card style={{ flex: "1 1 40%" }}>
          <TopShops rows={(data?.top_shops ?? []).slice(0, 20)} totals={data?.top_shops_totals ?? null} height={560} />
        </Card>
      </Row>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
