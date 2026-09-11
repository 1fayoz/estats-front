"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Failed, Grid, Loading, PeriodPicker, usePeriod, type Column } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { market, MARKET_BASE, type MarketPoint, type MarketProduct } from "@/lib/market";

type Detail = {
  shop: { id: number; title: string; seller: string | null; rating: number | null;
          reviews: number; orders_total: number; registered_at: string | null; url: string | null };
  totals: Record<string, number | null>;
  categories: { category_id: number; title: string; revenue: number; units: number }[];
};

const shortDay = (v: unknown) => {
  if (!v) return "";
  const [, m, d] = String(v).split("-");
  return `${d}.${m}`;
};

export default function MarketShopPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const days = usePeriod();
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [series, setSeries] = React.useState<MarketPoint[]>([]);
  const [products, setProducts] = React.useState<MarketProduct[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    Promise.all([
      fetch(`${MARKET_BASE}/shops/${id}?days=${days}`).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`Topilmadi (${r.status})`))),
      fetch(`${MARKET_BASE}/shops/${id}/timeline?days=${Math.max(days, 30)}`).then((r) =>
        r.ok ? r.json() : []),
      market.products({ days, shop: Number(id), limit: 100 }).catch(() => null),
    ])
      .then(([d, t, p]) => { setDetail(d); setSeries(t); setProducts(p?.items ?? []); })
      .catch((e) => setError(e.message));
  }, [id, days]);

  if (error) return <Failed message={error} />;
  if (!detail) return <Loading />;

  const t = detail.totals;
  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/market/shops"><ArrowLeft className="h-3.5 w-3.5" /> Do&apos;konlarga qaytish</Link>
      </Button>

      <PageHeader
        title={detail.shop.title}
        description={detail.shop.seller ?? undefined}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodPicker />
            {detail.shop.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={detail.shop.url} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" /> Uzumda
                </a>
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        {[
          ["Tushum", t.revenue != null ? formatCompact(t.revenue) : "—"],
          ["Sotuv, dona", t.units != null ? formatNumber(t.units) : "—"],
          ["Kunlik sotuv", t.daily_units != null ? formatNumber(t.daily_units) : "—"],
          ["Kartochkalar", t.products != null ? formatNumber(t.products) : "—"],
          ["Sotuvi borlari", t.products_with_sales != null ? formatNumber(t.products_with_sales) : "—"],
          ["Reyting", detail.shop.rating != null ? formatNumber(detail.shop.rating) : "—"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-card p-3.5">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="air-num mt-0.5 text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {series.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 text-xs font-medium text-muted-foreground">Kunlik dinamika</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series} margin={{ left: 4, right: 12 }}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
              <YAxis yAxisId="l" tickFormatter={(v: number) => formatCompact(v)} fontSize={11} />
              <YAxis yAxisId="r" orientation="right" fontSize={11} />
              <Tooltip labelFormatter={shortDay} />
              <Legend />
              <Line yAxisId="l" type="monotone" dataKey="revenue" name="Tushum" stroke="#0075ff" strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="units" name="Sotuv, dona" stroke="#faa72c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <section className="space-y-2.5">
        <div className="font-semibold">Turkumlar kesimi</div>
        <Grid
          columns={[
            { key: "title", label: "Turkum", align: "left", render: (c: Detail["categories"][number]) => c.title },
            { key: "revenue", label: "Tushum", render: (c: Detail["categories"][number]) => <span className="air-num">{formatCompact(c.revenue)}</span> },
            { key: "units", label: "Sotuv, dona", render: (c: Detail["categories"][number]) => <span className="air-num">{formatNumber(c.units)}</span> },
          ]}
          rows={detail.categories}
          rowKey={(c) => c.category_id}
          empty="Bu do'kon uchun turkum kesimi yig'ilmagan."
        />
      </section>

      <section className="space-y-2.5">
        <div className="font-semibold">Mahsulotlar — qaysi biri qancha tushum keltirgan</div>
        <Grid
          columns={
            [
              {
                key: "title", label: "Kartochka", align: "left",
                render: (r) => (
                  <div className="flex items-center gap-2.5">
                    {r.photo && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.photo} alt="" width={28} height={28}
                           className="h-7 w-7 shrink-0 rounded object-cover" />
                    )}
                    <Link href={`/market/products/${r.product_id}`}
                          className="max-w-[320px] whitespace-normal text-primary hover:underline">
                      {r.title}
                    </Link>
                  </div>
                ),
              },
              { key: "revenue", label: "Tushum", render: (r) => <span className="air-num">{formatCompact(r.revenue)}</span> },
              { key: "units", label: "Sotuv, dona", render: (r) => <span className="air-num">{formatNumber(r.units)}</span> },
              { key: "price", label: "O'rtacha narx", render: (r) => <span className="air-num">{r.avg_price ? formatCompact(r.avg_price) : "—"}</span> },
              { key: "stock", label: "Qoldiq", render: (r) => <span className="air-num">{r.stock != null ? formatNumber(r.stock) : "—"}</span> },
            ] satisfies Column<MarketProduct>[]
          }
          rows={products ?? []}
          rowKey={(r) => r.product_id}
          empty="Bu do'kon uchun mahsulot kesimi yig'ilmagan."
        />
      </section>
    </div>
  );
}
