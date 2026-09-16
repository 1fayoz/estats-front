"use client";

import * as React from "react";

import { CategoryPathControl, ToifaControl } from "@/features/report/filters";
import {
  COLORS, Card, Empty, PeriodControl, ReportPage, Row, SourceNote, ZTable, fmt, useLoad, useParams,
} from "@/features/report/ui";
import { report, type LayerRow } from "@/lib/report";

/*
  «Qatlamlari» — hamma barg turkum bitta jadvalda. Ustun ranglari
  ZoomSelling'dagi bilan bir xil (heatmap alfa = qiymat / ustun maksimumi);
  «Defitsit» 30 kundan kam bo'lsa to'q ko'k fon bilan belgilanadi.
*/

const LIMIT = 500;

export default function LayersPage() {
  const [params, setParams] = useParams({ period: "d30", root: "", category: "", sort: "revenue", dir: "desc",
                                          offset: "0" });
  const offset = Number(params.offset) || 0;
  const { data, error } = useLoad(
    () => report.layers({ period: params.period, root: params.root || undefined,
                          category: params.category || undefined, sort: params.sort, dir: params.dir, offset,
                          limit: LIMIT }),
    [params.period, params.root, params.category, params.sort, params.dir, offset],
  );

  return (
    <ReportPage>
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period, offset: null })} style={{ width: 200 }} />
        <ToifaControl label="Asosiy Kategoriya" value={params.root || null} allowClear
                      onChange={(root) => setParams({ root, category: null, offset: null })} style={{ width: 200 }} />
        <CategoryPathControl value={params.category || null} period={params.period} root={params.root || null}
                             onChange={(category) => setParams({ category, offset: null })} style={{ flex: 1 }} />
      </Row>
      <Card>
        {error ? <Empty>{error}</Empty> : null}
        <ZTable<LayerRow>
          rows={data?.items ?? []}
          rowKey={(r) => r.path}
          sort={params.sort}
          dir={params.dir as "asc" | "desc"}
          onSort={(sort, dir) => setParams({ sort, dir, offset: null })}
          offset={offset}
          total={data?.total}
          limit={LIMIT}
          onPage={(o) => setParams({ offset: String(o) })}
          height="calc(100vh - 260px)"
          columns={[
            { key: "path", title: "Toifa", value: (r) => r.path, width: "34%", sortable: false },
            { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, format: fmt.compact,
              heat: COLORS.heatBlue },
            { key: "growth", title: "O'sish %", num: true, value: (r) => r.growth, format: fmt.pct(0) },
            { key: "units", title: "Sotuv, donada", num: true, value: (r) => r.units, heat: COLORS.heatDeep },
            { key: "avg_price", title: "O'rtacha narx", num: true, value: (r) => r.avg_price, heat: COLORS.heatLight },
            { key: "shops", title: "Do'konlar soni", num: true, value: (r) => r.shops, heat: COLORS.heatBlue },
            { key: "shops_with_sales", title: "... sotuvlar bilan", num: true, value: (r) => r.shops_with_sales,
              format: fmt.pct(0) },
            { key: "cards", title: "Kartochka", num: true, value: (r) => r.cards, heat: COLORS.heatBlue },
            { key: "cards_with_sales", title: "... sotuvlar bilan", num: true, value: (r) => r.cards_with_sales,
              format: fmt.pct(0) },
            { key: "shop_profit", title: "Magazin foydasi", num: true, value: (r) => r.shop_profit,
              format: fmt.compact, heat: COLORS.heatLight },
            { key: "turnover", title: "Defitsit (Oborot, kunlar)", num: true, center: true,
              value: (r) => r.turnover,
              tone: (r) => (r.turnover != null && r.turnover < 30 ? { background: "rgb(0, 172, 193)", color: "#fff" }
                                                                    : undefined) },
          ]}
        />
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
