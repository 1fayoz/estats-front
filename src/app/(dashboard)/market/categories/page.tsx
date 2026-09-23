"use client";

import * as React from "react";

import { RevenueTreemap } from "@/features/report/charts";
import { ToifaControl } from "@/features/report/filters";
import { TopShops } from "@/features/report/top-shops";
import {
  Card, Empty, FilterBar, PeriodControl, ReportPage, Row, Scorecard, SourceNote, StatsGrid, fmt, useLoad, useParams,
} from "@/features/report/ui";
import { report, type TreeNode } from "@/lib/report";

/*
  «Kategoriyalar» — tanlangan toifa ichidagi qatlamlar (treemap, tushum
  bo'yicha) va shu toifadagi top-do'konlar. tashqi xizmatda sukutdagi
  toifa — «Kiyim».
*/

const KPIS: { key: string; label: string; format?: (v: number | null | undefined) => string; invert?: boolean }[] = [
  { key: "revenue", label: "Tushim (soʻm)" },
  { key: "units", label: "Sotuv, donada" },
  { key: "shops", label: "Do'kon", format: fmt.int },
  { key: "shops_with_sales", label: "... sotuvlar bilan", format: fmt.pct(0) },
  { key: "cards", label: "Kartochkalar" },
  { key: "cards_with_sales", label: "... sotuvlar bilan", format: fmt.pct(0) },
  { key: "skus", label: "SKU" },
  { key: "turnover", label: "Oborot, kunlik", format: fmt.dec(0), invert: true },
];

type TreeDatum = { name: string; size?: number; children?: TreeDatum[] };

function toTreemap(node: TreeNode): TreeDatum {
  if (!node.children.length) return { name: node.name, size: node.revenue };
  return { name: node.name, children: node.children.map(toTreemap) };
}

export default function CategoriesPage() {
  const [params, setParams] = useParams({ period: "d30", toifa: "Kiyim" });
  const { data, error } = useLoad(() => report.categories(params.period, params.toifa), [params.period, params.toifa]);
  const toifaNode = data?.tree?.children?.[0];

  return (
    <ReportPage>
      <FilterBar>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period })} style={{ width: 150 }} />
        <ToifaControl label="Toifa" value={params.toifa} onChange={(toifa) => setParams({ toifa })}
                      style={{ width: 270 }} />
      </FilterBar>
      <StatsGrid>
        {KPIS.map((k) => {
          const kpi = data?.kpis?.values?.[k.key];
          const fallback = k.key === "revenue" ? toifaNode?.revenue ?? null : null;
          return (
            <Scorecard key={k.key} label={k.label} value={kpi?.value ?? fallback} growth={kpi?.growth ?? null}
                       format={k.format} invert={k.invert} />
          );
        })}
      </StatsGrid>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Row>
        <Card title="Kategoriyalar tushum bo‘yicha" style={{ flex: "1 1 60%" }}>
          {toifaNode && toifaNode.children.length ? (
            <RevenueTreemap data={toifaNode.children.map(toTreemap)} />
          ) : <Empty />}
        </Card>
        <Card title="Top do‘konlar" style={{ flex: "1 1 38%" }}>
          <TopShops rows={data?.top_shops ?? []} totals={data?.top_shops_totals ?? null} height={520} />
        </Card>
      </Row>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
