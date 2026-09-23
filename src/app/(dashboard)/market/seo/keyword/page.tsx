"use client";

import * as React from "react";

import { TwoLines } from "@/features/report/charts";
import { useReportIndex } from "@/features/report/filters";
import {
  Card, DateRangeControl, Empty, FilterBar, InputControl, ReportPage, dayLabel, fmt, styles, useLoad, useParams,
} from "@/features/report/ui";
import { report } from "@/lib/report";

/*
  «Kalit soʻz tahlili» — bitta so'rovning kechagi holati (qamrov,
  qidiruvdagi va reklamadagi SKU, talab) va yil bo'yi dinamikasi.
  tashqi xizmatda sukut — «xiaomi».
*/

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function KeywordAnalysisPage() {
  const index = useReportIndex();
  const last = index?.as_of ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [params, setParams] = useParams({ keyword: "xiaomi", start: "", end: "" });
  const range = { start: params.start || shift(last, -370), end: params.end || last };
  const { data, error } = useLoad(
    () => report.keyword({ keyword: params.keyword, start: range.start, end: range.end }),
    [params.keyword, range.start, range.end],
  );
  const latest = data?.latest;
  const label = (iso: string) => dayLabel(iso).replace(" y.", "");

  return (
    <ReportPage>
      <FilterBar>
        <div style={{ flex: "0 0 316px", display: "flex", flexDirection: "column", gap: 8 }}>
          <DateRangeControl start={range.start} end={range.end} onChange={(start, end) => setParams({ start, end })} />
          <InputControl label="Kalit so'z" value={params.keyword}
                        onCommit={(keyword) => setParams({ keyword: keyword || "xiaomi" })} />
          <div style={{ fontSize: 12, padding: "4px 2px" }}>Tanlangan kalit bo&apos;yicha kechagi ma&apos;lumotlar</div>
          <Card>
            <table className={styles.ztable}>
              <tbody>
                {([
                  ["Kalit so'z", params.keyword],
                  ["Qamrov (kunlik ko'rinishlar)", fmt.dec(2)(latest?.coverage)],
                  ["Qidiruvdagi SKU", fmt.int(latest?.skus)],
                  ["Reklamadagi SKU", fmt.int(latest?.ads_skus)],
                  ["demand", fmt.dec(1)(latest?.demand)],
                ] as [string, string][]).map(([k, v]) => (
                  <tr key={k}>
                    <th style={{ width: "58%" }}>{k}</th>
                    <td style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
        <Card style={{ flex: 1 }}>
          {data?.series?.some((s) => s.coverage != null) ? (
            <TwoLines data={data.series} left="coverage" right="demand" leftName="Qamrov (kunlik ko'rinishlar)"
                      rightName="Talab koeffitsiyenti" height={300} dateLabel={label} />
          ) : <Empty>Qamrov tarixi hali yuklanmagan</Empty>}
        </Card>
      </FilterBar>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Card>
        {data?.series?.length ? (
          <TwoLines data={data.series} left="skus" right="ads_skus" leftName="Jami SKU" rightName="Reklamadagi SKU"
                    leftColor="var(--primary)" rightColor="var(--info)" height={300} dateLabel={label} />
        ) : <Empty>Bu so&apos;rov bo&apos;yicha kunlik qator yo&apos;q</Empty>}
      </Card>
    </ReportPage>
  );
}
