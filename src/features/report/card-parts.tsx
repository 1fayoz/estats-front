"use client";

import * as React from "react";
import Link from "next/link";

import { formatNumber } from "@/lib/format";
import type { CardData } from "@/lib/report";

import { MultiLine, StackedDaily, shortDay } from "./charts";
import { COLORS, Card, DateRangeControl, Empty, InputControl, Row, Scorecard, ZTable, fmt, styles } from "./ui";

/*
  «Maxsulot kartochkasi» va «Kartochka (tablica)» sahifalarining umumiy
  qismlari: filtr qatori, KPI kartalari va SKU jadvali.
*/

export function CardFilters({
  start, end, id, onRange, onId,
}: {
  start: string;
  end: string;
  id: string;
  onRange: (start: string, end: string) => void;
  onId: (id: string) => void;
}) {
  return (
    <div className={styles.cardFilters}>
      <DateRangeControl start={start} end={end} onChange={onRange} />
      <InputControl label="prod_id" value={id} inputMode="numeric" onCommit={(v) => onId(v.replace(/\D/g, ""))} />
    </div>
  );
}

const compare = (days: number) => `oldingi ${days} kunga`;

export function CardKpis({
  data, keys,
}: {
  data: CardData | null;
  keys: ("revenue" | "units" | "daily_units" | "daily_stock" | "turnover" | "orders" | "reviews" | "rating" | "found")[];
}) {
  const days = data?.range.days ?? 30;
  const k = data?.kpis ?? {};
  const spark = data?.sparks ?? {};
  const map: Record<string, React.ReactNode> = {
    revenue: <Scorecard key="revenue" label="Tushim (soʻm)" value={k.revenue?.value} growth={k.revenue?.growth}
                        compare={compare(days)} spark={spark.revenue} />,
    units: <Scorecard key="units" label="Sotuv, donada" value={k.units?.value} growth={k.units?.growth}
                      format={fmt.int} compare={compare(days)} spark={spark.units} />,
    daily_units: <Scorecard key="daily_units" label="O'rtacha kunlik savdo (dona)" value={k.daily_units?.value}
                            growth={k.daily_units?.growth} format={fmt.dec(1)} compare={compare(days)}
                            spark={spark.units} />,
    daily_stock: <Scorecard key="daily_stock" label="O'rtacha kunlik qoldiqlar (dona)" value={k.daily_stock?.value}
                            growth={k.daily_stock?.growth} format={fmt.dec(1)} compare={compare(days)}
                            spark={spark.daily_stock} />,
    turnover: <Scorecard key="turnover" label="Oborot, kunlik" value={k.turnover?.value} growth={k.turnover?.growth}
                         format={fmt.dec(1)} compare={compare(days)} invert spark={spark.daily_stock} />,
    orders: <Scorecard key="orders" label="Buyurtmalar soni" value={k.orders?.value} growth={k.orders?.growth}
                       format={fmt.int} compare={compare(days)} spark={spark.orders} />,
    reviews: <Scorecard key="reviews" label="Sharhlar" value={k.reviews?.value} growth={k.reviews?.growth}
                        format={fmt.int} compare={compare(days)} />,
    rating: <Scorecard key="rating" label="Reyting" value={k.rating?.value} growth={k.rating?.growth}
                       format={fmt.dec(1)} compare={compare(days)} />,
    found: (
      <div key="found" className={styles.score}>
        <span className={styles.scoreLabel}>Kartochka topilgan sana</span>
        <span className={styles.scoreValue} style={{ fontSize: 18 }}>
          {data?.info.first_seen ? data.info.first_seen.split("-").reverse().join(".") : "-"}
        </span>
      </div>
    ),
  };
  return <>{keys.map((key) => map[key])}</>;
}

export function SkuTable({ data, height = 190 }: { data: CardData | null; height?: number }) {
  return (
    <ZTable
      rows={data?.skus ?? []}
      rowKey={(r) => r.sku_title}
      height={height}
      columns={[
        { key: "sku_id", title: "SKU", value: (r) => (r.sku_id == null ? "" : String(r.sku_id)), sortable: false },
        { key: "sku_title", title: "SKU nomi", value: (r) => r.sku_title, sortable: false },
        { key: "revenue", title: "Tushim (soʻm)", num: true, value: (r) => r.revenue, bar: "var(--info)", sortable: false },
        { key: "units", title: "Sotuv, donada", value: (r) => r.units, bar: "var(--primary)", sortable: false,
          render: (r) => (
            <span className={styles.barCell} style={{ justifyContent: "flex-start" }}>
              {formatNumber(r.units)}
              <span className={styles.bar} style={{
                width: `${Math.max(2, (r.units / Math.max(1, ...(data?.skus ?? []).map((x) => x.units))) * 80)}px`,
                background: "var(--primary)" }} />
            </span>
          ) },
        { key: "avg_price", title: "O'rtacha narx", num: true, value: (r) => r.avg_price, sortable: false },
        { key: "turnover", title: "Oborot, kunlik", num: true, center: true, value: (r) => r.turnover,
          format: fmt.int, heat: COLORS.heatBlue, sortable: false },
      ]}
    />
  );
}

export function CardInfo({ data }: { data: CardData | null }) {
  const info = data?.info;
  return (
    <>
      <Card style={{ flex: "0 0 140px" }}>
        <div className={styles.dropdownHead} style={{ height: 20, fontSize: 11, padding: "0 6px" }}>UZUM↗</div>
        {info ? (
          <a href={info.uzum_url} target="_blank" rel="noreferrer" style={{ display: "block", padding: 12 }}>
            {info.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={info.photo} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "contain" }} />
            ) : <Empty>↗ Uzum</Empty>}
          </a>
        ) : <Empty>Ma&apos;lumot yo&apos;q</Empty>}
      </Card>
      <div style={{ flex: "0 0 250px", display: "flex", flexDirection: "column", gap: 8 }}>
        <Card>
          <div className={styles.dropdownHead} style={{ height: 20, fontSize: 11, padding: "0 6px" }}>Do&apos;kon (↗ZS)</div>
          <div style={{ padding: 8, fontSize: 12 }}>
            {info?.shop_id ? (
              <Link className={styles.link} href={`/market/shop?shop_id=${info.shop_id}`}>{info.shop}</Link>
            ) : info?.shop ?? "Ma'lumot yo'q"}
          </div>
        </Card>
        <Card>
          <div className={styles.dropdownHead} style={{ height: 20, fontSize: 11, padding: "0 6px" }}>Nomi</div>
          <div style={{ padding: 8, fontSize: 12, minHeight: 50 }}>{info?.title ?? "Ma'lumot yo'q"}</div>
        </Card>
      </div>
    </>
  );
}

export function PositionPivot({
  rows, days, rowLabel,
}: {
  rows: { label: string; values: Record<string, number | null> }[];
  days: string[];
  rowLabel: string;
}) {
  const max = Math.max(1, ...rows.flatMap((r) => Object.values(r.values).filter((v): v is number => v != null)));
  return (
    <div className={styles.tableWrap} style={{ maxHeight: 420 }}>
      <table className={`${styles.ztable} ${styles.pivot}`}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", fontSize: 11 }}>{rowLabel}</th>
            {days.map((d) => (
              <th key={d} style={{ fontSize: 11, textAlign: "center" }}>
                {d.slice(8)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td style={{ textAlign: "left", whiteSpace: "nowrap", maxWidth: 160, overflow: "hidden" }}>
                <span className={styles.link}>{r.label}</span>
              </td>
              {days.map((d) => {
                const v = r.values[d];
                const alpha = v == null ? 0 : Math.max(0.08, 1 - (v - 1) / max);
                return (
                  <td key={d} style={{ background: v == null ? undefined : `color-mix(in oklch, var(--primary) ${Math.round(alpha * 58)}%, var(--card))` }}>
                    {v == null ? "-" : formatNumber(v)}
                  </td>
                );
              })}
            </tr>
          ))}
          {!rows.length ? (
            <tr><td colSpan={days.length + 1}><Empty /></td></tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export function dayList(start: string, end: string): string[] {
  const out: string[] = [];
  const d = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`);
  while (d <= last) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

export function CardCharts({ data }: { data: CardData }) {
  const days = dayList(data.range.start, data.range.end);
  const skuNames = Array.from(new Set(data.sku_days.map((r) => r.sku_title)));
  const priceRows = days.map((day) => {
    const row: Record<string, unknown> = { day };
    for (const r of data.sku_days.filter((x) => x.day === day)) row[r.sku_title] = r.price;
    return row;
  });
  const salesRows = [...days].reverse().map((day) => {
    const row: Record<string, unknown> = { day };
    for (const r of data.sku_days.filter((x) => x.day === day)) row[r.sku_title] = r.units;
    return row;
  });
  const skuIds = new Map(data.skus.map((s) => [s.sku_title, s.sku_id]));

  const levels = Array.from(new Set(data.category_positions.map((p) => `${p.level}|${p.category}`)));
  const categoryRows = levels.map((key) => {
    const [, category] = key.split("|");
    const values: Record<string, number | null> = {};
    for (const p of data.category_positions.filter((x) => `${x.level}|${x.category}` === key)) values[p.day] = p.position;
    return { label: category, values };
  });
  const keywords = Array.from(new Set(data.keyword_positions.map((p) => p.keyword)));
  const keywordRows = keywords.map((keyword) => {
    const values: Record<string, number | null> = {};
    for (const p of data.keyword_positions.filter((x) => x.keyword === keyword)) values[p.day] = p.position;
    return { label: keyword, values };
  });

  return (
    <>
      <Card>
        <div className={styles.dropdownHead} style={{ height: 24, fontSize: 12, padding: "0 8px", fontWeight: 400 }}>
          Karta ishtirok etadigan aksiyalar
        </div>
        {data.promos.length ? (
          <div style={{ padding: 8, fontSize: 12 }}>
            {data.promos.map((p) => (
              <div key={p.promo}>{p.promo} · {shortDay(p.first_day)} – {shortDay(p.last_day)}</div>
            ))}
          </div>
        ) : <Empty>Aksiya yo&apos;q</Empty>}
      </Card>
      <Card>
        <div className={styles.dropdownHead} style={{ height: 24, fontSize: 12, padding: "0 8px", fontWeight: 400 }}>
          SKU narxi (soʻm)
        </div>
        <MultiLine data={priceRows} keys={skuNames.map((n) => ({ key: n, name: n }))} height={160} />
      </Card>
      <Card>
        <div className={styles.dropdownHead} style={{ height: 24, fontSize: 12, padding: "0 8px", fontWeight: 400 }}>
          Sotuv, donada / Tushim (soʻm)
        </div>
        <StackedDaily data={salesRows}
                      keys={skuNames.map((n) => ({ key: n, name: skuIds.get(n) ? `${n} (${skuIds.get(n)})` : n }))} />
      </Card>
      <Card>
        <div className={styles.dropdownHead} style={{ height: 24, fontSize: 12, padding: "0 8px", fontWeight: 400 }}>
          1-2-3 darajali toifadagi joylashish
        </div>
        <PositionPivot rows={categoryRows} days={days} rowLabel="Oyning kunlari" />
      </Card>
      <Card>
        <div className={styles.dropdownHead} style={{ height: 24, fontSize: 12, padding: "0 8px", fontWeight: 400 }}>
          kalit so&apos;zlar bo&apos;yicha joylashish
        </div>
        <PositionPivot rows={keywordRows} days={days} rowLabel="Pozitsiya po klyuchu" />
      </Card>
    </>
  );
}

export { Row };
