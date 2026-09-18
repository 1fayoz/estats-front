"use client";

import * as React from "react";

import { ComboDaily, TwoLines } from "@/features/report/charts";
import { CategoryPathControl, useReportIndex } from "@/features/report/filters";
import {
  Card, DateRangeControl, Empty, ReportPage, Row, dayLabel, styles, useLoad, useParams,
} from "@/features/report/ui";
import { report } from "@/lib/report";

/*
  «Dinamikasi» — barg turkumning kunlik qatori: tushum (ustun) va
  sotuvdagi kartochkalar narxining medianasi (chiziq); pastda do'konlar
  va kartochkalar soni. import qilingan tarix 2024-01-02 dan boshlanadi.
*/

const DEFAULT_PATH = "elektronika, smartfonlar va telefonlar, smartfonlar, smartfonlar android";

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function DynamicsPage() {
  const index = useReportIndex();
  const end = index?.as_of ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [params, setParams] = useParams({ path: DEFAULT_PATH, start: "", end: "" });
  const range = { start: params.start || shift(end, -360), end: params.end || end };
  const { data, error } = useLoad(
    () => report.dynamics({ path: params.path, start: range.start, end: range.end }),
    [params.path, range.start, range.end],
  );
  const series = data?.series ?? [];
  const label = (iso: string) => dayLabel(iso).replace(" y.", "");

  return (
    <ReportPage>
      <Row>
        <DateRangeControl start={range.start} end={range.end} style={{ width: 205 }}
                          onChange={(start, e) => setParams({ start, end: e })} />
        <CategoryPathControl value={params.path} onChange={(path) => setParams({ path: path ?? DEFAULT_PATH })}
                             style={{ flex: 1 }} />
      </Row>
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Card>
        {series.length ? (
          <>
            <ComboDaily data={series} bars="revenue" line="median_price" barName="Tushim (soʻm)"
                        lineName="O'rtacha narxlar (sotuvdagi kartochkalar narxining medianasi)" height={310}
                        dateLabel={label} />
            <TwoLines data={series} left="shops" right="cards" leftName="Do'konlar" rightName="Kartochkalar"
                      height={230} dateLabel={label} />
          </>
        ) : <Empty>Bu turkum uchun kunlik qator hali yo&apos;q</Empty>}
      </Card>
      {series.length ? (
        <div className={styles.note}>
          Manba: {series.some((s) => s.source === "import") ? "import qilingan tarix" : ""}
          {series.some((s) => s.source === "import") && series.some((s) => s.source === "estats") ? " + " : ""}
          {series.some((s) => s.source === "estats") ? "o'z o'lchovimiz" : ""}
        </div>
      ) : null}
    </ReportPage>
  );
}
