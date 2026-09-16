"use client";

import * as React from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import { CategoryFilter, useCategoryParam } from "@/features/market/category-filter";
import { StateBanner } from "@/features/market/state-banner";
import { Failed, Loading, NoData, PeriodPicker, usePeriod } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { market, type MarketPriceBucket } from "@/lib/market";

const tipMoney = (value: unknown) => value == null ? "—" : formatCompact(Number(value));
const tipNumber = (value: unknown) => value == null ? "—" : formatNumber(Number(value));
const rangeLabel = (bucket: MarketPriceBucket) => bucket.high == null
  ? `${formatCompact(bucket.low)}+`
  : `${formatCompact(bucket.low)}–${formatCompact(bucket.high)}`;

export default function PricesPage() {
  const days = usePeriod();
  const [category, setCategory] = useCategoryParam();
  const [step, setStep] = React.useState(50_000);
  const [bucketCount, setBucketCount] = React.useState(20);
  const [rows, setRows] = React.useState<MarketPriceBucket[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!category) { setRows(null); return; }
    setError(null);
    const timer = setTimeout(() => {
      market.nichePrices(category, {
        days,
        step: Math.max(1_000, step),
        buckets: Math.min(60, Math.max(2, bucketCount)),
      }).then(setRows).catch((e) => setError(e.message));
    }, 300);
    return () => clearTimeout(timer);
  }, [bucketCount, category, days, step]);

  const chartRows = rows?.map((row) => ({ ...row, range: rangeLabel(row) })) ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Narx asosida tahlil"
        description="Talab, tushum va raqobatning narx segmentlari bo'yicha taqsimoti."
        actions={<PeriodPicker />}
      />
      <StateBanner />
      <CategoryFilter value={category} onChange={setCategory} allowAll={false} />

      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3.5">
        <label className="space-y-1 text-xs text-muted-foreground">
          <span>Narx qadami, so&apos;m</span>
          <Input
            type="number"
            min={1000}
            step={10000}
            value={step}
            onChange={(event) => setStep(Number(event.target.value) || 50_000)}
            className="h-9 w-40 text-foreground"
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          <span>Segmentlar soni</span>
          <Input
            type="number"
            min={2}
            max={60}
            value={bucketCount}
            onChange={(event) => setBucketCount(Number(event.target.value) || 20)}
            className="h-9 w-32 text-foreground"
          />
        </label>
        <span className="pb-2 text-xs text-muted-foreground">
          Oxirgi segment ochiq: undan qimmat barcha tovarlar ham hisobga kiradi.
        </span>
      </div>

      {error ? <Failed message={error} /> : !category || !rows ? <Loading /> : rows.length === 0 ? (
        <NoData>Tanlangan toifa va davr uchun narx ma&apos;lumoti yetarli emas.</NoData>
      ) : (
        <>
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 text-xs font-medium text-muted-foreground">Narx bo&apos;yicha tushum va sotuv</div>
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={chartRows} margin={{ left: 6, right: 12 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="range" fontSize={10} angle={-35} textAnchor="end" height={72} />
                <YAxis yAxisId="money" tickFormatter={(value: number) => formatCompact(value)} fontSize={11} />
                <YAxis yAxisId="units" orientation="right" fontSize={11} />
                <Tooltip formatter={tipMoney} />
                <Legend />
                <Bar yAxisId="money" dataKey="revenue" name="Tushum" fill="#0075ff" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="units" dataKey="units" name="Sotuv, dona" fill="#faa72c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 text-xs font-medium text-muted-foreground">Narx bo&apos;yicha raqobat</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartRows} margin={{ left: 6, right: 12 }}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="range" fontSize={10} angle={-35} textAnchor="end" height={72} />
                <YAxis fontSize={11} />
                <Tooltip formatter={tipNumber} />
                <Legend />
                <Line type="monotone" dataKey="shops" name="Do'konlar" stroke="#1bce7b" strokeWidth={2} />
                <Line type="monotone" dataKey="products" name="Kartochkalar" stroke="#e05fa0" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="air-table-wrap border">
            <table className="air-table">
              <thead>
                <tr>
                  <th style={{ textAlign: "left" }}>Narx oralig&apos;i</th>
                  <th>Tushum</th><th>Sotuv, dona</th><th>Do&apos;konlar</th><th>Kartochkalar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td style={{ textAlign: "left" }}>{rangeLabel(row)}</td>
                    <td className="air-num">{formatCompact(row.revenue)}</td>
                    <td className="air-num">{formatNumber(row.units)}</td>
                    <td className="air-num">{formatNumber(row.shops)}</td>
                    <td className="air-num">{formatNumber(row.products)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
