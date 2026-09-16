"use client";

import * as React from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { CategoryFilter, useCategoryParam } from "@/features/market/category-filter";
import { StateBanner } from "@/features/market/state-banner";
import { Failed, Loading, NoData, PeriodPicker, usePeriod } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { market, type MarketNichePoint } from "@/lib/market";

const shortDay = (value: unknown) => {
  const [, month, day] = String(value ?? "").split("-");
  return day && month ? `${day}.${month}` : "";
};
const tipMoney = (value: unknown) => value == null ? "—" : formatCompact(Number(value));
const tipNumber = (value: unknown) => value == null ? "—" : formatNumber(Number(value));

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="air-num mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

export default function DynamicsPage() {
  const days = usePeriod();
  const [category, setCategory] = useCategoryParam();
  const [series, setSeries] = React.useState<MarketNichePoint[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!category) { setSeries(null); return; }
    setError(null);
    market.nicheDynamics(category, Math.max(days, 7))
      .then(setSeries)
      .catch((e) => setError(e.message));
  }, [category, days]);

  const latest = series?.at(-1);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dinamikasi"
        description="Tanlangan kategoriya yoki nishaning kunlik o'zgarishi."
        actions={<PeriodPicker />}
      />
      <StateBanner />
      <CategoryFilter value={category} onChange={setCategory} allowAll={false} />

      {error ? <Failed message={error} /> : !category || !series ? <Loading /> : series.length === 0 ? (
        <NoData>Tanlangan toifa bo&apos;yicha hali kunlik o&apos;lchov yo&apos;q.</NoData>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
            <Fact label="Kunlik tushum" value={latest?.revenue ? formatCompact(latest.revenue) : "—"} />
            <Fact label="Sotuv, dona" value={latest?.units != null ? formatNumber(latest.units) : "—"} />
            <Fact label="Median narx" value={latest?.median_price ? formatCompact(latest.median_price) : "—"} />
            <Fact label="Do'konlar" value={latest?.shops != null ? formatNumber(latest.shops) : "—"} />
            <Fact label="Kartochkalar" value={latest?.products != null ? formatNumber(latest.products) : "—"} />
            <Fact label="Oborot, kun" value={latest?.turnover_days != null ? formatNumber(latest.turnover_days) : "—"} />
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 text-xs font-medium text-muted-foreground">Tushum va sotuv dinamikasi</div>
            <ResponsiveContainer width="100%" height={330}>
              <LineChart data={series} margin={{ left: 6, right: 12 }}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
                <YAxis yAxisId="money" tickFormatter={(value: number) => formatCompact(value)} fontSize={11} />
                <YAxis yAxisId="units" orientation="right" fontSize={11} />
                <Tooltip labelFormatter={shortDay} formatter={tipMoney} />
                <Legend />
                <Line yAxisId="money" type="monotone" dataKey="revenue" name="Tushum" stroke="#0075ff" strokeWidth={2} dot={false} />
                <Line yAxisId="units" type="monotone" dataKey="units" name="Sotuv, dona" stroke="#faa72c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 text-xs font-medium text-muted-foreground">Narx dinamikasi</div>
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={series} margin={{ left: 6, right: 12 }}>
                  <CartesianGrid stroke="var(--border)" />
                  <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
                  <YAxis tickFormatter={(value: number) => formatCompact(value)} fontSize={11} />
                  <Tooltip labelFormatter={shortDay} formatter={tipMoney} />
                  <Legend />
                  <Line type="monotone" dataKey="median_price" name="Median narx" stroke="#5b4bc4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="avg_price" name="O'rtacha narx" stroke="#00b8d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 text-xs font-medium text-muted-foreground">Raqobat dinamikasi</div>
              <ResponsiveContainer width="100%" height={270}>
                <LineChart data={series} margin={{ left: 6, right: 12 }}>
                  <CartesianGrid stroke="var(--border)" />
                  <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip labelFormatter={shortDay} formatter={tipNumber} />
                  <Legend />
                  <Line type="monotone" dataKey="shops" name="Do'konlar" stroke="#1bce7b" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="products" name="Kartochkalar" stroke="#e05fa0" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
