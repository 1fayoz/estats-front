"use client";

import * as React from "react";

import { CategoryPathControl, ToifaControl } from "@/features/report/filters";
import { periodDays, productColumns } from "@/features/report/product-columns";
import {
  Card, Empty, InputControl, PeriodControl, ReportPage, Row, SelectControl, SourceNote, ZTable, fmt, styles, useLoad,
  useParams,
} from "@/features/report/ui";
import { report, type ProductRow } from "@/lib/report";

/*
  «kartochka asosida» — tanlangan davr va toifadagi kartochkalar,
  tashqi hisobot jadvalining 18 ustuni bilan. Sahifada 100 qator
  (tashqi xizmatdagi kabi «1 - 100 / 25161»).
*/

const LIMIT = 100;

export default function ProductsPage() {
  const [params, setParams] = useParams({
    period: "d30", toifa: "Elektronika", category: "", shop: "", sales: "yes", q: "", sort: "revenue", dir: "desc",
    offset: "0",
  });
  const offset = Number(params.offset) || 0;
  const { data, error } = useLoad(
    () => report.products({ period: params.period, toifa: params.toifa, category: params.category || undefined,
                            shop: params.shop || undefined, q: params.q || undefined, sort: params.sort,
                            dir: params.dir, offset, limit: LIMIT }),
    [params.period, params.toifa, params.category, params.shop, params.q, params.sort, params.dir, offset],
  );
  const columns = React.useMemo(() => productColumns(periodDays(params.period)), [params.period]);
  const reset = { offset: null };

  return (
    <ReportPage>
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period, ...reset })} style={{ width: 150 }} />
        <ToifaControl value={params.toifa} style={{ width: 235 }}
                      onChange={(toifa) => toifa && setParams({ toifa, category: null, ...reset })} />
        <CategoryPathControl value={params.category || null} period={params.period} root={params.toifa}
                             onChange={(category) => setParams({ category, ...reset })} style={{ flex: 1 }} />
      </Row>
      <Row>
        <InputControl label="Do'konlar soni" value={params.shop} placeholder="do'kon nomi"
                      onCommit={(shop) => setParams({ shop, ...reset })} style={{ width: 150 }} />
        <SelectControl label="Davrdagi sotuvlar" value={params.sales} searchable={false} allowClear={false}
                       options={[{ value: "yes", label: "Ha" }]} onChange={() => undefined}
                       style={{ width: 235 }} />
        <InputControl label="Nomi bo'yicha qidiruv" value={params.q}
                      onCommit={(q) => setParams({ q, ...reset })} style={{ flex: 1 }} />
      </Row>
      <Card title="Kartochkalar ro'yxati" bordered>
        {error ? <Empty>{error}</Empty> : null}
        <ZTable<ProductRow>
          numbered={false}
          rows={data?.items ?? []}
          rowKey={(r) => r.product_id}
          columns={columns}
          sort={params.sort}
          dir={params.dir as "asc" | "desc"}
          onSort={(sort, dir) => setParams({ sort, dir, ...reset })}
          offset={offset}
          total={data?.total}
          limit={LIMIT}
          onPage={(o) => setParams({ offset: String(o) })}
          height="calc(100vh - 300px)"
          totalsRow={data?.totals ? {
            title: "Jami",
            revenue: fmt.money(data.totals.revenue),
            units: fmt.int(data.totals.units),
          } : undefined}
        />
      </Card>
      <SourceNote meta={data?.meta} />
      <div className={styles.note}>
        «Davrdagi sotuvlar: Ha» — faqat tanlangan davrda sotuvi bo&apos;lgan kartochkalar ko&apos;rsatiladi.
      </div>
    </ReportPage>
  );
}
