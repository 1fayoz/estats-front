"use client";

import * as React from "react";

import { CategoryPathControl } from "@/features/report/filters";
import { skuColumns } from "@/features/report/product-columns";
import {
  Card, Empty, InputControl, PeriodControl, ReportPage, Row, Scorecard, SourceNote, ZTable, useLoad, useParams,
} from "@/features/report/ui";
import { report, type SkuRow } from "@/lib/report";

/*
  «Sotuvchining SKUlari» — bitta yuridik shaxsning (bir nechta do'konining)
  hamma SKU'lari. tashqi xizmatda sukut — «ООО «Uzum market»».
*/

const LIMIT = 100;
const DEFAULT_SELLER = "ООО «Uzum market»";

export default function SellerSkusPage() {
  const [params, setParams] = useParams({
    period: "d30", seller: DEFAULT_SELLER, category: "", q: "", sort: "revenue", dir: "desc", offset: "0",
  });
  const offset = Number(params.offset) || 0;
  const { data, error } = useLoad(
    () => report.sellerSkus({ period: params.period, seller: params.seller, category: params.category || undefined,
                              q: params.q || undefined, sort: params.sort, dir: params.dir, offset, limit: LIMIT }),
    [params.period, params.seller, params.category, params.q, params.sort, params.dir, offset],
  );
  const columns = React.useMemo(() => skuColumns({ withSkuId: true }), []);
  const reset = { offset: null };

  return (
    <ReportPage>
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period, ...reset })} style={{ width: 160 }} />
        <InputControl label="Sotuvchilar:" value={params.seller}
                      onCommit={(seller) => setParams({ seller: seller || DEFAULT_SELLER, ...reset })}
                      style={{ width: 200 }} />
        <CategoryPathControl label="Toifa" value={params.category || null} period={params.period}
                             onChange={(category) => setParams({ category, ...reset })} style={{ width: 200 }} />
        <InputControl label="Nomi bo'yicha qidiruv" value={params.q}
                      onCommit={(q) => setParams({ q, ...reset })} style={{ flex: 1 }} />
        <Scorecard label="Tushim (soʻm)" value={data?.totals?.revenue ?? null} style={{ flex: "0 0 130px" }} />
      </Row>
      <Card title="SKU ro'yxati (davr bo'yicha sotuvlar bilan)" bordered>
        {error ? <Empty>{error}</Empty> : null}
        <ZTable<SkuRow>
          numbered={false}
          rows={data?.items ?? []}
          rowKey={(r) => r.sku_id}
          columns={columns}
          sort={params.sort}
          dir={params.dir as "asc" | "desc"}
          onSort={(sort, dir) => setParams({ sort, dir, ...reset })}
          offset={offset}
          total={data?.total}
          limit={LIMIT}
          onPage={(o) => setParams({ offset: String(o) })}
          height="calc(100vh - 260px)"
        />
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
