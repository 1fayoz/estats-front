"use client";

import * as React from "react";

import { GroupedBars } from "@/features/report/charts";
import { CategoryPathControl, ToifaControl } from "@/features/report/filters";
import {
  Card, Empty, InputControl, PeriodControl, ReportPage, Row, SourceNote, useLoad, useParams,
} from "@/features/report/ui";
import { formatNumber } from "@/lib/format";
import { report } from "@/lib/report";

/*
  «Narx asosida tahlil» — kartochkalar davrdagi o'rtacha narxi bo'yicha
  oraliqlarga bo'linadi («Narx qadami», sukut 50 000); har oraliqda
  tushum va sotuv (yuqorida), do'konlar va kartochkalar soni (pastda).
  «Segmentlar soni» — nechta oraliq chiziladi (hisobotdagi «Кол-во
  segmentov» bilan bir xil, sukut 20); oxirgi oraliq OCHIQ qoladi.
*/

export default function PricesPage() {
  const [params, setParams] = useParams({ period: "d30", step: "50000", toifa: "Elektronika", category: "",
                                         buckets: "20" });
  const { data, error } = useLoad(
    () => report.prices({ period: params.period, step: Number(params.step) || 50000, toifa: params.toifa,
                          category: params.category || undefined, buckets: Number(params.buckets) || 20 }),
    [params.period, params.step, params.toifa, params.category, params.buckets],
  );
  const buckets = data?.buckets ?? [];

  return (
    <ReportPage>
      <Row>
        <PeriodControl value={params.period} periods={data?.periods ?? []}
                       onChange={(period) => setParams({ period })} style={{ width: 150 }} />
        <InputControl label="Narx qadami" value={formatNumber(Number(params.step))} inputMode="numeric"
                      onCommit={(v) => setParams({ step: String(Number(v.replace(/\D/g, "")) || 50000) })}
                      style={{ width: 155 }} />
        <ToifaControl value={params.toifa} onChange={(toifa) => toifa && setParams({ toifa, category: null })}
                      style={{ width: 220 }} />
        <CategoryPathControl value={params.category || null} period={params.period} root={params.toifa}
                             onChange={(category) => setParams({ category })} style={{ flex: 1 }} />
        <InputControl label="Segmentlar soni" value={params.buckets} inputMode="numeric"
                      onCommit={(v) => setParams({ buckets: String(
                        Math.min(100, Math.max(2, Number(v.replace(/\D/g, "")) || 20)) )})}
                      style={{ width: 150 }} />
      </Row>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Card>
        {buckets.length ? (
          <GroupedBars data={buckets} category="range" height={280}
                       series={[{ key: "revenue", name: "Tushim (soʻm)", color: "#7eb2f4", axis: "l" },
                                { key: "units", name: "Sotuv, donada", color: "#e06c9f", axis: "r" }]} />
        ) : <Empty />}
      </Card>
      <Card>
        {buckets.length ? (
          <GroupedBars data={buckets} category="range" height={280}
                       series={[{ key: "shops", name: "Do'konlar soni", color: "#7eb2f4", axis: "l" },
                                { key: "cards", name: "Kartochkalar soni", color: "#e06c9f", axis: "r" }]} />
        ) : <Empty />}
      </Card>
      <SourceNote meta={data?.meta} />
    </ReportPage>
  );
}
