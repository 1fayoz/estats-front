"use client";

import * as React from "react";

import { CategoryPathControl, ToifaControl } from "@/features/report/filters";
import { skuColumns } from "@/features/report/product-columns";
import {
  Card, Empty, InputControl, PeriodControl, ReportPage, Row, SourceNote, ZTable, useLoad, useParams,
} from "@/features/report/ui";
import { report, type SkuRow } from "@/lib/report";

/*
  «SKU asosida» — variant (o'lcham/rang) darajasidagi ro'yxat.
  «Oborot, kunlik» bu jadvalda stokda bo'lgan kunlar bo'yicha:
  o'rtacha qoldiq ÷ (sotuv ÷ stokdagi kunlar) — tashqi xizmatda o'lchangan
  (SKU 9826764: 43,24).
*/

const LIMIT = 100;

export default function SkusPage() {
  const [params, setParams] = useParams({
    period: "d30", toifa: "Elektronika", category: "", shop: "", q: "", sort: "revenue", dir: "desc", offset: "0",
  });
  const offset = Number(params.offset) || 0;
  const { data, error } = useLoad(
    () => report.skus({ period: params.period, toifa: params.toifa, category: params.category || undefined,
                        q: params.q || undefined, sort: params.sort, dir: params.dir, offset, limit: LIMIT }),
    [params.period, params.toifa, params.category, params.q, params.sort, params.dir, offset],
  );
  const columns = React.useMemo(() => skuColumns(), []);
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
        <InputControl label="Nomi bo'yicha qidiruv" value={params.q}
                      onCommit={(q) => setParams({ q, ...reset })} style={{ flex: 1 }} />
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
          height="calc(100vh - 300px)"
        />
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
