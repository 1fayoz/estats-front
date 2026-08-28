"use client";

import * as React from "react";
import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import {
  CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Failed, Grid, Loading, PeriodPicker, usePeriod, type Column } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { MARKET_BASE } from "@/lib/market";

type Detail = {
  product: { id: number; title: string; photo: string | null; category: string | null;
             shop: string | null; first_seen: string; url: string };
  totals: Record<string, number | null>;
  skus: { sku_id: number; title: string; revenue: number; units: number;
          avg_price: number | null; stock: number | null }[];
};

type TimelineRow = {
  day: string;
  units: number | null;
  revenue: number | null;
  price: number | null;
  stock: number | null;
  category_position: number | null;
  positions: Record<string, number | null>;
};

const shortDay = (v: unknown) => {
  if (!v) return "";
  const [, m, d] = String(v).split("-");
  return `${d}.${m}`;
};

export default function MarketProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const days = usePeriod();
  const [detail, setDetail] = React.useState<Detail | null>(null);
  const [timeline, setTimeline] = React.useState<TimelineRow[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    Promise.all([
      fetch(`${MARKET_BASE}/products/${id}?days=${days}`).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`Topilmadi (${r.status})`))),
      fetch(`${MARKET_BASE}/products/${id}/timeline?days=${Math.max(days, 30)}`).then((r) =>
        r.ok ? r.json() : []),
    ])
      .then(([d, t]) => { setDetail(d); setTimeline(t); })
      .catch((e) => setError(e.message));
  }, [id, days]);

  if (error) return <Failed message={error} />;
  if (!detail) return <Loading />;

  // Kunlik jadvalda uchraydigan HAMMA so'rov ustun bo'ladi.
  // So'rovlar to'plami kundan kunga o'zgaradi va faqat birinchi
  // qatordan olinsa, keyingi kunlarda paydo bo'lgani ko'rinmay
  // qolardi.
  const phrases = Array.from(
    new Set(timeline.flatMap((row) => Object.keys(row.positions ?? {})))
  ).slice(0, 6);

  const columns: Column<TimelineRow>[] = [
    { key: "day", label: "Kun", align: "left", render: (r) => shortDay(r.day) },
    { key: "units", label: "Sotildi", render: (r) => <span className="air-num">{r.units != null ? formatNumber(r.units) : "—"}</span> },
    { key: "revenue", label: "Tushum", render: (r) => <span className="air-num">{r.revenue != null ? formatCompact(r.revenue) : "—"}</span> },
    { key: "price", label: "Narx", render: (r) => <span className="air-num">{r.price != null ? formatCompact(r.price) : "—"}</span> },
    { key: "stock", label: "Qoldiq", render: (r) => <span className="air-num">{r.stock != null ? formatNumber(r.stock) : "—"}</span> },
    { key: "catpos", label: "Turkumda", render: (r) => <span className="air-num">{r.category_position ?? "·"}</span> },
    ...phrases.map((phrase) => ({
      key: `p:${phrase}`,
      label: phrase,
      // ⚠️ UCHTA HOLAT, UCHTA KO'RINISH — aralashtirish tarixni
      // yolg'on qiladi:
      //   raqam  — o'lchandi va topildi;
      //   "·"    — o'lchandi, lekin ko'rilgan chuqurlikda yo'q;
      //   bo'sh  — o'sha kuni umuman o'lchov bo'lmagan.
      render: (r: TimelineRow) => {
        if (!(phrase in (r.positions ?? {}))) return <span className="text-muted-foreground/40">—</span>;
        const position = r.positions[phrase];
        return position == null
          ? <span className="text-muted-foreground">·</span>
          : <span className="air-num font-medium">{position}</span>;
      },
    })),
  ];

  const t = detail.totals;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/market/products"><ArrowLeft className="h-3.5 w-3.5" /> Tovarlarga qaytish</Link>
      </Button>

      <PageHeader
        title={detail.product.title}
        description={[detail.product.category, detail.product.shop].filter(Boolean).join(" · ")}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodPicker />
            <Button variant="outline" size="sm" asChild>
              <a href={detail.product.url} target="_blank" rel="noreferrer">
                <ExternalLink className="h-3.5 w-3.5" /> Uzumda
              </a>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:grid-cols-7">
        {[
          ["Tushum", t.revenue != null ? formatCompact(t.revenue) : "—"],
          ["Sotuv, dona", t.units != null ? formatNumber(t.units) : "—"],
          ["O'rtacha narx", t.avg_price != null ? formatCompact(t.avg_price) : "—"],
          ["Buyurtmalar", t.orders_total != null ? formatNumber(t.orders_total) : "—"],
          ["Sharhlar", t.reviews != null ? formatNumber(t.reviews) : "—"],
          ["Qoldiq", t.stock != null ? formatNumber(t.stock) : "—"],
          ["Qoldiqsiz kun", t.days_out != null ? formatNumber(t.days_out) : "—"],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border bg-card p-3.5">
            <div className="text-[11px] text-muted-foreground">{label}</div>
            <div className="air-num mt-0.5 text-lg font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {timeline.length > 0 && (
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 text-xs font-medium text-muted-foreground">Sotuv, narx va qoldiq</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timeline} margin={{ left: 4, right: 12 }}>
              <CartesianGrid stroke="var(--border)" />
              <XAxis dataKey="day" tickFormatter={shortDay} fontSize={11} />
              <YAxis yAxisId="l" fontSize={11} />
              <YAxis yAxisId="r" orientation="right" tickFormatter={(v: number) => formatCompact(v)} fontSize={11} />
              <Tooltip labelFormatter={shortDay} />
              <Legend />
              <Line yAxisId="l" type="monotone" dataKey="units" name="Sotildi, dona" stroke="#0075ff" strokeWidth={2} dot={false} />
              <Line yAxisId="l" type="monotone" dataKey="stock" name="Qoldiq" stroke="#1bce7b" strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="price" name="Narx" stroke="#faa72c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <section className="space-y-2.5">
        <div className="font-semibold">Kunlik tarix</div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Sotuv va qidiruvdagi o&apos;rin bitta jadvalda — alohida turganda eng
          muhim savol javobsiz qoladi: <i>o&apos;rin ko&apos;tarilgan kuni sotuv ham
          oshdimi?</i> Katakdagi <b>·</b> «o&apos;lchandi, lekin top-100 da yo&apos;q»,
          bo&apos;sh katak esa «o&apos;sha kuni o&apos;lchov bo&apos;lmagan» degani.
        </p>
        <Grid columns={columns} rows={timeline} rowKey={(r) => r.day}
              empty="Bu kartochka hali kuzatilmagan." />
      </section>

      {detail.skus.length > 0 && (
        <section className="space-y-2.5">
          <div className="font-semibold">SKU&apos;lar</div>
          <Grid
            columns={[
              { key: "title", label: "Variant", align: "left", render: (s: Detail["skus"][number]) => s.title || `SKU ${s.sku_id}` },
              { key: "revenue", label: "Tushum", render: (s: Detail["skus"][number]) => <span className="air-num">{formatCompact(s.revenue)}</span> },
              { key: "units", label: "Sotuv", render: (s: Detail["skus"][number]) => <span className="air-num">{formatNumber(s.units)}</span> },
              { key: "price", label: "O'rtacha narx", render: (s: Detail["skus"][number]) => <span className="air-num">{s.avg_price != null ? formatCompact(s.avg_price) : "—"}</span> },
              { key: "stock", label: "Qoldiq", render: (s: Detail["skus"][number]) => <span className="air-num">{s.stock != null ? formatNumber(s.stock) : "—"}</span> },
            ]}
            rows={detail.skus}
            rowKey={(s) => s.sku_id}
          />
        </section>
      )}
    </div>
  );
}
