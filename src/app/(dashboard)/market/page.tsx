"use client";

import * as React from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { StateBanner } from "@/features/market/state-banner";
import { Failed, Loading, NoData, PeriodPicker, Score, usePeriod } from "@/features/market/shared";
import { formatCompact, formatPercent } from "@/lib/format";
import { market, type MarketCategorySlice, type MarketOverview, type MarketPoint } from "@/lib/market";

// Toifa ranglari. Bittasi ham QIZIL emas: qizil bu mahsulotda
// "tushdi" degani va uni toifa rangi qilib qo'yish grafikda
// soxta ogohlantirish yasaydi.
const COLORS = ["#0075ff", "#5b4bc4", "#1bce7b", "#faa72c", "#00b8d4",
                "#8e7cff", "#00a870", "#ff8a3d", "#3d7bff", "#a86bd6"];

const shortDay = (v: unknown) => {
  if (!v) return "";
  const [y, m, d] = String(v).split("-");
  return `${d}.${m}`;
};
const tipMoney = (v: unknown) => (v == null ? "—" : formatCompact(Number(v)));
const tipPercent = (v: unknown) => (v == null ? "—" : `${Number(v)}%`);

export default function MarketOverviewPage() {
  const days = usePeriod();
  const [data, setData] = React.useState<MarketOverview | null>(null);
  const [slices, setSlices] = React.useState<MarketCategorySlice[]>([]);
  const [series, setSeries] = React.useState<MarketPoint[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    Promise.all([
      market.overview(days),
      market.categories(days, 1, 12),
      market.timeline(Math.max(days, 30)),
    ])
      .then(([o, c, t]) => { setData(o); setSlices(c); setSeries(t); })
      .catch((e) => setError(e.message));
  }, [days]);

  if (error) return <Failed message={error} />;
  if (!data) return <Loading />;

  const empty = !series.some((p) => p.revenue);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bozor holati"
        description="Butun Uzum bozorining kunlik kesimi — tushum, do'konlar, kartochkalar, oborot."
        actions={<PeriodPicker />}
      />

      <StateBanner />

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{data.period_start} — {data.period_end}</span>
        {data.coverage !== null && (
          // To'liqlik YASHIRILMAYDI. To'liq bo'lmagan kunni to'liq
          // deb o'qish "bozor qulabdi" degan yolg'on xulosa beradi —
          // bu mahsulotdagi eng xavfli yanglishish.
          <span className={data.coverage > 0.9 ? "air-ok" : "air-warn"}>
            ma&apos;lumot to&apos;liqligi {formatPercent(data.coverage * 100)}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
        {data.cards.map((c) => <Score key={c.key} card={c} />)}
      </div>

      {empty ? (
        <NoData>Hali o&apos;lchov yo&apos;q — bozor ma&apos;lumoti tez orada to&apos;planadi.</NoData>
      ) : (
        <>
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 text-xs font-medium text-muted-foreground">Toifalar ulushi</div>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={slices} layout="vertical" margin={{ left: 4, right: 24 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" tickFormatter={(v: number) => formatCompact(v)} fontSize={11} />
                  <YAxis type="category" dataKey="title" width={130} fontSize={11} />
                  <Tooltip formatter={tipMoney} />
                  <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                    {slices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 text-xs font-medium text-muted-foreground">Toifalar o&apos;sishi, %</div>
              <ResponsiveContainer width="100%" height={270}>
                <BarChart data={slices} layout="vertical" margin={{ left: 4, right: 24 }}>
                  <CartesianGrid horizontal={false} stroke="var(--border)" />
                  <XAxis type="number" fontSize={11} />
                  <YAxis type="category" dataKey="title" width={130} fontSize={11} />
                  <Tooltip formatter={tipPercent} />
                  <Bar dataKey="growth" radius={[0, 4, 4, 0]}>
                    {/* O'sish va tushish RANG bilan ajratiladi: bitta
                        rangda manfiy ustun chapga chiqadi, lekin ko'z
                        uni darrov ilg'amaydi. */}
                    {slices.map((s, i) => (
                      <Cell key={i} fill={(s.growth ?? 0) >= 0 ? "#1bce7b" : "#ff5752"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 text-xs font-medium text-muted-foreground">Kunlik tushum va sotuv</div>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={series} margin={{ left: 4, right: 12 }}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
                <YAxis yAxisId="l" tickFormatter={(v: number) => formatCompact(v)} fontSize={11} />
                <YAxis yAxisId="r" orientation="right" fontSize={11} />
                <Tooltip labelFormatter={shortDay} formatter={tipMoney} />
                <Legend />
                <Line yAxisId="l" type="monotone" dataKey="revenue" name="Tushum"
                      stroke="#0075ff" strokeWidth={2} dot={false} />
                <Line yAxisId="r" type="monotone" dataKey="units" name="Sotuv, dona"
                      stroke="#faa72c" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
