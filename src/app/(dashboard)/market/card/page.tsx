"use client";

import * as React from "react";
import Link from "next/link";

import { CardCharts, CardFilters, CardInfo, CardKpis, DEFAULT_CARD_ID, SkuTable } from "@/features/report/card-parts";
import { RefreshProduct } from "@/features/market/refresh-product";
import { ReviewsCard } from "@/features/market/reviews-card";
import { useReportIndex } from "@/features/report/filters";
import { Card, Empty, FilterBar, ReportPage, Row, StatsGrid, styles, useLoad, useParams } from "@/features/report/ui";
import { report } from "@/lib/report";

/*
  «Maxsulot kartochkasi» — bitta tovar: KPI (sparkline bilan, oldingi
  shuncha kunga nisbatan), SKU jadvali, aksiyalar, SKU narxi, SKU
  bo'yicha sotuv, toifa va kalit so'zlar bo'yicha kunlik o'rinlar.
  Sukut davri — oxirgi 30 kun (tashqi xizmatdagi kabi).
*/

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function CardPage() {
  const index = useReportIndex();
  const last = index?.as_of ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [params, setParams] = useParams({ id: DEFAULT_CARD_ID, start: "", end: "" });
  const range = { start: params.start || shift(last, -29), end: params.end || last };
  const id = Number(params.id);
  const [reload, setReload] = React.useState(0);
  const { data, error } = useLoad(
    () => (id ? report.card(id, range) : Promise.resolve(null)),
    [id, range.start, range.end, reload],
  );

  return (
    <ReportPage>
      <FilterBar>
        <CardFilters start={range.start} end={range.end} id={params.id} current={data?.info}
                     onRange={(start, end) => setParams({ start, end })} onId={(v) => setParams({ id: v })} />
      </FilterBar>
      <StatsGrid>
        <CardKpis data={data} keys={["revenue", "units", "daily_units", "daily_stock", "turnover", "orders",
                                     "reviews", "rating", "found"]} />
      </StatsGrid>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      {!id ? <Card><Empty>Kartochka ID (prod_id) kiriting</Empty></Card> : null}
      <Row>
        <CardInfo data={data} />
        <div style={{ flex: "0 0 250px", display: "none" }} />
        <Card style={{ flex: 1 }}>
          <SkuTable data={data} height={200} />
        </Card>
      </Row>
      {id ? (
        <Row>
          <div style={{ flex: "0 0 140px" }} />
          <Link href={`/market/card-table?id=${id}${params.start ? `&start=${params.start}&end=${params.end}` : ""}`}
                className={styles.button} style={{ flex: "0 0 250px" }}>
            ↗ Jadvalda ochish
          </Link>
        </Row>
      ) : null}
      {data ? <CardCharts data={data} /> : null}
      {id ? (
        <Card>
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10,
                        fontFamily: "Roboto, system-ui, sans-serif" }}>
            <RefreshProduct productId={id} onDone={() => setReload((v) => v + 1)} />
            <ReviewsCard productId={id} reloadKey={reload} />
          </div>
        </Card>
      ) : null}
      {data?.sources?.length ? (
        <div className={styles.note}>
          Kunlik qatorlar: {data.sources.map((s) => (s === "import" ? "import qilingan tarix" : "o'z o'lchovimiz"))
            .join(" + ")}
        </div>
      ) : null}
    </ReportPage>
  );
}
