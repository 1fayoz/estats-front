"use client";

import * as React from "react";
import Link from "next/link";

import { CardFilters, CardKpis, SkuTable } from "@/features/report/card-parts";
import { useReportIndex } from "@/features/report/filters";
import { COLORS, Card, Empty, FilterBar, ReportPage, Row, StatsGrid, ZTable, dayLabel, fmt, styles, useLoad, useParams } from "@/features/report/ui";
import { report, type SkuDay } from "@/lib/report";

/*
  «Kartochka (tablica)» — tovarning kun × SKU jadvali: narx, qoldiq,
  sotuv, tushum, sharhlar, reyting. Bu tashqi xizmatning xom fakti —
  qolgan hamma ko'rsatkich shundan hisoblanadi.

  Jami qatori tashqi xizmatdagi kabi: narx — o'rtacha, qoldiq — stokda
  bo'lgan kunlar soni, sotuv va tushum — yig'indi.
*/

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function CardTablePage() {
  const index = useReportIndex();
  const last = index?.as_of ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [params, setParams] = useParams({ id: "", start: "", end: "" });
  const range = { start: params.start || shift(last, -29), end: params.end || last };
  const id = Number(params.id);
  const { data, error } = useLoad(
    () => (id ? report.cardTable(id, range) : Promise.resolve(null)),
    [id, range.start, range.end],
  );
  const rows = React.useMemo(
    () => [...(data?.sku_days ?? [])].sort((a, b) => (a.day === b.day ? a.sku_title.localeCompare(b.sku_title)
                                                                      : a.day.localeCompare(b.day))),
    [data],
  );
  const info = data?.info;

  return (
    <ReportPage>
      <FilterBar>
        <CardFilters start={range.start} end={range.end} id={params.id}
                     onRange={(start, end) => setParams({ start, end })} onId={(v) => setParams({ id: v })} />
      </FilterBar>
      <StatsGrid>
        <CardKpis data={data} keys={["found", "daily_units", "daily_stock", "turnover", "orders", "rating",
                                     "reviews"]} />
      </StatsGrid>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Row>
        <Card style={{ flex: "1 1 38%" }}>
          <ZTable
            numbered={false}
            rows={info ? [info] : []}
            rowKey={(r) => r.product_id}
            columns={[
              { key: "photo", title: "UZUM↗", sortable: false, width: 90,
                render: (r) => (
                  <a href={r.uzum_url} target="_blank" rel="noreferrer">
                    {r.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo} alt="" style={{ width: 70, maxHeight: 100, objectFit: "contain" }} />
                    ) : "↗"}
                  </a>
                ) },
              { key: "shop", title: "Do'kon (↗ZS)", sortable: false,
                render: (r) => r.shop_id ? <Link className={styles.link} href={`/market/shop?shop_id=${r.shop_id}`}>
                  {r.shop}</Link> : r.shop },
              { key: "title", title: "Nomi (↗UZUM)", sortable: false,
                render: (r) => <a className={styles.link} href={r.uzum_url} target="_blank" rel="noreferrer">{r.title}</a> },
            ]}
          />
        </Card>
        <Card style={{ flex: "1 1 60%" }}>
          <SkuTable data={data} height={170} />
        </Card>
      </Row>
      <Card>
        <ZTable<SkuDay>
          numbered={false}
          rows={rows}
          rowKey={(r) => `${r.day}|${r.sku_title}`}
          height="calc(100vh - 360px)"
          columns={[
            { key: "day", title: "Sana", sortable: false,
              render: (r) => (rows.find((x) => x.day === r.day) === r ? dayLabel(r.day) : "") },
            { key: "sku_title", title: "Texnik xususiyatlar (SKU)", sortable: false, value: (r) => r.sku_title },
            { key: "price", title: "Narx", num: true, sortable: false, value: (r) => r.price },
            { key: "stock", title: "Qoldiq", num: true, sortable: false, value: (r) => r.stock, heat: COLORS.heatTeal },
            { key: "units", title: "Sotuv, donada", num: true, sortable: false, value: (r) => r.units,
              heat: COLORS.heatOrange },
            { key: "revenue", title: "Tushim (soʻm)", num: true, sortable: false, value: (r) => r.revenue,
              heat: COLORS.heatPurple },
            { key: "reviews", title: "Sharhlar", num: true, sortable: false, value: (r) => r.reviews,
              heat: COLORS.heatRed },
            { key: "rating", title: "Reyting", num: true, sortable: false, value: (r) => r.rating, format: fmt.dec(1) },
          ]}
          totalsRow={data?.totals ? {
            day: "Jami",
            price: fmt.dec(2)(data.totals.price),
            stock: fmt.int(data.totals.stock),
            units: fmt.int(data.totals.units),
            revenue: fmt.money(data.totals.revenue),
            reviews: fmt.int(data.totals.reviews),
            rating: fmt.dec(1)(data.totals.rating),
          } : undefined}
          empty={id ? "Bu davr uchun kunlik qator yo'q" : "Kartochka ID (prod_id) kiriting"}
        />
      </Card>
    </ReportPage>
  );
}
