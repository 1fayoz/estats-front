"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bar, CartesianGrid, ComposedChart, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { MoversCard } from "@/features/market/movers-card";
import { RevenueTreemap } from "@/features/report/charts";
import { useReportIndex } from "@/features/report/filters";
import {
  COLORS, Card, DateRangeControl, Empty, InputControl, ReportPage, Row, Scorecard, ZTable, fmt, styles, useLoad,
  useParams,
} from "@/features/report/ui";
import { formatCompact, formatNumber } from "@/lib/format";
import { report } from "@/lib/report";

/*
  «Do'kon tahlili» — bitta do'kon: kunlik o'rtacha savdo va qoldiq
  (pulda), oborot, buyurtma va sharhlar; toifalar treemap'i; kartalar
  jadvali; tushum oldingi davr bilan; sotuv va qoldiq.

  Formulalar tashqi xizmat kartalaridan tiklangan: «O'rtacha kunlik savdo»
  = tushum / kunlar; «O'rtacha kunlik qoldiq» = Σ(qoldiq × narx) / kunlar;
  «Oborot» = ikkalasining nisbati (Xiaomi-Uzbekistan: 559,9 / 22,2 = 25,2 ✓).
*/

const axis = { fontSize: 11, fontFamily: "var(--font-geist-sans), system-ui, sans-serif", color: "#6e728d" };

function shift(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type TreeDatum = { name: string; size?: number; children?: TreeDatum[] };

function buildTree(paths: { path: string; revenue: number }[]): TreeDatum[] {
  const root: Record<string, { revenue: number; children: Record<string, number> }> = {};
  for (const p of paths) {
    const [head, second] = p.path.split(",").map((s) => s.trim());
    root[head] ??= { revenue: 0, children: {} };
    root[head].revenue += p.revenue;
    const key = second ?? head;
    root[head].children[key] = (root[head].children[key] ?? 0) + p.revenue;
  }
  return Object.entries(root).map(([name, node]) => ({
    name,
    children: Object.entries(node.children).map(([child, size]) => ({ name: child, size })),
  }));
}

export default function ShopAnalysisPage() {
  const index = useReportIndex();
  const last = index?.as_of ?? new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  const [params, setParams] = useParams({ shop_id: "", shop: "", start: "", end: "", offset: "0" });
  const range = { start: params.start || shift(last, -29), end: params.end || last };
  const offset = Number(params.offset) || 0;
  const hasShop = Boolean(params.shop_id || params.shop);
  const { data, error } = useLoad(
    () => (hasShop
      ? report.shop({ shop_id: params.shop_id || undefined, shop: params.shop || undefined, start: range.start,
                      end: range.end, offset, limit: 100 })
      : Promise.resolve(null)),
    [params.shop_id, params.shop, range.start, range.end, offset],
  );
  const days = data?.range.days ?? 30;
  const k = data?.kpis ?? {};
  const compare = `oldingi ${days} kunga`;
  const lines = (data?.series ?? []).map((s, i) => ({
    day: s.day, revenue: s.revenue, previous: data?.previous.find((p) => p.offset_day === i)?.revenue ?? null,
    units: s.units, stock: s.stock,
  }));

  return (
    <ReportPage>
      <Row>
        <div style={{ flex: "0 0 380px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <DateRangeControl start={range.start} end={range.end} style={{ flex: 1 }}
                              onChange={(start, end) => setParams({ start, end })} />
            <InputControl label="Do'kon:" value={data?.info.title ?? params.shop} style={{ flex: 1 }}
                          onCommit={(shop) => setParams({ shop, shop_id: null, offset: null })} />
          </div>
          {data?.info.uzum_url ? (
            <a className={styles.button} href={data.info.uzum_url} target="_blank" rel="noreferrer">
              ↗ Uzumda do&apos;konga xavola
            </a>
          ) : <div className={styles.button}>↗ Uzumda do&apos;konga xavola</div>}
        </div>
        <Scorecard label="Tushim (soʻm)" value={k.revenue?.value} growth={k.revenue?.growth} compare={compare}
                   spark={data?.sparks.revenue} />
        <Scorecard label="O'rtacha kunlik savdo (dona)" value={k.daily_revenue?.value}
                   growth={k.daily_revenue?.growth} compare={compare} spark={data?.sparks.revenue} />
        <Scorecard label="O'rtacha kunlik qoldiqlar (dona)" value={k.daily_stock_value?.value}
                   growth={k.daily_stock_value?.growth} compare={compare} spark={data?.sparks.daily_stock_value} />
        <Scorecard label="Oborot, kunlik" value={k.turnover?.value} growth={k.turnover?.growth} invert
                   format={fmt.dec(1)} compare={compare} spark={data?.sparks.daily_stock_value} />
        <Scorecard label="Buyurtmalar soni" value={k.orders?.value} format={fmt.int} style={{ flex: "0 0 86px" }} />
        <Scorecard label="Sharhlar soni" value={k.reviews?.value} format={fmt.int} style={{ flex: "0 0 76px" }} />
      </Row>
      {!hasShop ? <Card><Empty>Do&apos;kon nomini kiriting yoki reytingdan tanlang</Empty></Card> : null}
      {error ? <Card><Empty>{error}</Empty></Card> : null}
      <Row>
        <Card style={{ flex: "1 1 40%" }}>
          {data?.tree.length ? (
            <RevenueTreemap data={[{ name: data.info.title, children: buildTree(data.tree) }]} height={510} />
          ) : <Empty />}
        </Card>
        <div style={{ flex: "1 1 58%", display: "flex", flexDirection: "column", gap: 8 }}>
          <Card>
            <ZTable
              numbered={false}
              rows={data?.cards ?? []}
              rowKey={(r) => r.product_id}
              offset={offset}
              total={data?.cards_total}
              limit={100}
              onPage={(o) => setParams({ offset: String(o) })}
              height={150}
              columns={[
                { key: "title", title: "Kartasi", sortable: false,
                  render: (r) => <Link className={styles.link} href={`/market/card?id=${r.product_id}`}>{r.title}</Link> },
                { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, format: fmt.compact,
                  heat: COLORS.heatBlue, sortable: false },
                { key: "units", title: "Sotuv, donada", num: true, value: (r) => r.units, heat: COLORS.heatPink,
                  sortable: false },
                { key: "turnover", title: "Oborot, kunlik", num: true, value: (r) => r.turnover, format: fmt.dec(1),
                  sortable: false },
              ]}
            />
          </Card>
          {/* Kartalar jadvali oldingi davr bilan SOLISHTIRMAYDI: "bu
              karta 4 mln keltirdi" degan son o'sayotgani yoki
              qulayotganini aytmaydi. Tushib ketganini topish esa aynan
              shu sahifada qilinadigan ish. */}
          <MoversCard kind="shops" id={data?.info.id} start={range.start} end={range.end} />
          <Card>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={lines} margin={{ left: 10, right: 10, top: 20 }}>
                <Legend verticalAlign="top" wrapperStyle={{ ...axis, top: 0 }} />
                <CartesianGrid vertical={false} stroke="#ececf4" />
                <XAxis dataKey="day" tick={axis} tickFormatter={(v: string) => `${Number(v.slice(8))}.${v.slice(5, 7)}`} />
                <YAxis tick={axis} tickFormatter={(v: number) => formatCompact(v)} width={50} />
                <Tooltip formatter={(v) => formatNumber(Number(v))} />
                <Line dataKey="revenue" name="Tushim (soʻm)" stroke="#5b5ce2" strokeWidth={2} dot={false} type="monotone"
                      isAnimationActive={false} />
                <Line dataKey="previous" name={`Tushim (soʻm) (oldingi ${days} kun)`} stroke="#b7b8e9" dot={false}
                      type="monotone" isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card>
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart data={lines} margin={{ left: 10, right: 10, top: 20 }}>
                <Legend verticalAlign="top" wrapperStyle={{ ...axis, top: 0 }} />
                <CartesianGrid vertical={false} stroke="#ececf4" />
                <XAxis dataKey="day" tick={axis} tickFormatter={(v: string) => `${Number(v.slice(8))}.${v.slice(5, 7)}`} />
                <YAxis yAxisId="l" tick={axis} width={40} />
                <YAxis yAxisId="r" orientation="right" tick={axis} width={40} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip formatter={(v) => formatNumber(Number(v))} />
                <Bar yAxisId="r" dataKey="stock" name="Qoldiq, donada" fill="#7c7de8" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                <Line yAxisId="l" dataKey="units" name="Sotuv, donada" stroke="#dd5f96" strokeWidth={2} dot={false} type="monotone"
                      isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
      </Row>
    </ReportPage>
  );
}
