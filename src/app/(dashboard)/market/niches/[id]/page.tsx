"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Failed, Loading, NoData, PeriodPicker, usePeriod } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { MARKET_BASE, type MarketPoint } from "@/lib/market";

type Bucket = {
  low: number; high: number | null; label: string;
  revenue: number; units: number; shops: number; products: number;
};

const shortDay = (v: unknown) => {
  if (!v) return "";
  const [, m, d] = String(v).split("-");
  return `${d}.${m}`;
};
const tipMoney = (v: unknown) => (v == null ? "—" : formatCompact(Number(v)));

export default function NicheDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const days = usePeriod();
  // Narx qadami — foydalanuvchi o'zgartira oladi. Zavod qiymati
  // 50 000: arzon toifada 1 mln lik qadam butun nishani bitta
  // ustunga tiqib qo'yadi, qimmatida esa 10 mln lik ham kam.
  const [step, setStep] = React.useState(50_000);
  const [series, setSeries] = React.useState<MarketPoint[]>([]);
  const [buckets, setBuckets] = React.useState<Bucket[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      Promise.all([
        fetch(`${MARKET_BASE}/niches/${id}/dynamics?days=${Math.max(days, 60)}`).then((r) => (r.ok ? r.json() : [])),
        fetch(`${MARKET_BASE}/niches/${id}/prices?days=${days}&step=${step}`).then((r) => (r.ok ? r.json() : [])),
      ])
        .then(([d, p]) => { setSeries(d); setBuckets(p); })
        .catch((e) => setError(e.message));
    }, 300);
    return () => clearTimeout(timer);
  }, [id, days, step]);

  if (error) return <Failed message={error} />;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/market/niches"><ArrowLeft className="h-3.5 w-3.5" /> Nishalarga qaytish</Link>
      </Button>

      <PageHeader
        title="Nisha tahlili"
        description="Kunlik dinamika va narx oralig'i bo'yicha talab."
        actions={<PeriodPicker />}
      />

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 text-xs font-medium text-muted-foreground">Kunlik dinamika</div>
        {series.length === 0 ? <NoData>Bu nisha hali o&apos;lchanmagan.</NoData> : (
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={series} margin={{ left: 4, right: 12 }}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
              <YAxis yAxisId="l" tickFormatter={(v: number) => formatCompact(v)} fontSize={11} />
              <YAxis yAxisId="r" orientation="right" fontSize={11} />
              <Tooltip labelFormatter={shortDay} formatter={tipMoney} />
              <Legend />
              <Line yAxisId="l" type="monotone" dataKey="revenue" name="Tushum" stroke="#0075ff" strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="units" name="Sotuv, dona" stroke="#faa72c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-medium text-muted-foreground">Narx oralig&apos;i bo&apos;yicha talab</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">qadam, so&apos;m:</span>
            <Input
              type="number"
              value={step}
              min={1000}
              step={10000}
              onChange={(e) => setStep(Math.max(1000, Number(e.target.value) || 50_000))}
              className="h-8 w-32"
            />
          </div>
        </div>
        {buckets.length === 0 ? <NoData>Narx taqsimoti uchun ma&apos;lumot yetarli emas.</NoData> : (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={buckets} margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" fontSize={10} angle={-35} textAnchor="end" height={64} />
                <YAxis yAxisId="l" tickFormatter={(v: number) => formatCompact(v)} fontSize={11} />
                <YAxis yAxisId="r" orientation="right" fontSize={11} />
                <Tooltip formatter={tipMoney} />
                <Legend />
                <Bar yAxisId="l" dataKey="revenue" name="Tushum" fill="#0075ff" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="r" dataKey="units" name="Sotuv, dona" fill="#e05fa0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            {/* Oxirgi oraliq ATAYLAB ochiq ("950000+"): yopiq
                ro'yxat qimmat tovarlarning uzun dumini kesib
                tashlaydi va "bu nishada qimmat hech nima
                sotilmaydi" degan yolg'on chiqadi. */}
            <div className="air-table-wrap mt-3 border">
              <table className="air-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: "left" }}>Narx oralig&apos;i</th>
                    <th>Tushum</th><th>Sotuv, dona</th><th>Do&apos;konlar</th><th>Kartochkalar</th>
                  </tr>
                </thead>
                <tbody>
                  {buckets.map((b) => (
                    <tr key={b.label}>
                      <td style={{ textAlign: "left" }}>{b.label}</td>
                      <td className="air-num">{formatCompact(b.revenue)}</td>
                      <td className="air-num">{formatNumber(b.units)}</td>
                      <td className="air-num">{formatNumber(b.shops)}</td>
                      <td className="air-num">{formatNumber(b.products)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
