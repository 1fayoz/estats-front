"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Input } from "@/components/ui/input";
import {
  Failed, Grid, Growth, Loading, PeriodPicker, usePeriod, type Column,
} from "@/features/market/shared";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import { market, type MarketNiche, type MarketPage } from "@/lib/market";

export default function NichesPage() {
  const days = usePeriod();
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<MarketPage<MarketNiche> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    // Har harfda emas, 350 ms tinchlikdan keyin. 4 800 qatorli
    // jadvalda har bosishga so'rov yuborish serverni ham,
    // brauzerni ham bo'g'ib qo'yadi.
    const timer = setTimeout(() => {
      market.niches({ days, q: q || undefined }).then(setData).catch((e) => setError(e.message));
    }, 350);
    return () => clearTimeout(timer);
  }, [days, q]);

  const columns: Column<MarketNiche>[] = [
    { key: "niche", label: "Nisha", align: "left", render: (r) => r.niche },
    { key: "revenue", label: "Tushum", render: (r) => <span className="air-num">{formatCompact(r.revenue)}</span> },
    { key: "growth", label: "O'sish", render: (r) => <Growth value={r.growth} /> },
    { key: "units", label: "Sotuv, dona", render: (r) => <span className="air-num">{formatNumber(r.units)}</span> },
    { key: "median", label: "Median narx", render: (r) => <span className="air-num">{r.median_price ? formatCompact(r.median_price) : "—"}</span> },
    { key: "shops", label: "Do'konlar", render: (r) => <span className="air-num">{formatNumber(r.shops)}</span> },
    { key: "spct", label: "…sotuvlar bilan", render: (r) => <span className="air-num text-muted-foreground">{r.shops_with_sales_pct != null ? formatPercent(r.shops_with_sales_pct) : "—"}</span> },
    { key: "products", label: "Kartochka", render: (r) => <span className="air-num">{formatNumber(r.products)}</span> },
    { key: "ppct", label: "…sotuvlar bilan", render: (r) => <span className="air-num text-muted-foreground">{r.products_with_sales_pct != null ? formatPercent(r.products_with_sales_pct) : "—"}</span> },
    // ZoomSelling'da BU USTUN YO'Q va u aynan qaror qabul
    // qilinadigan raqam: nishaning umumiy hajmi emas, bir
    // do'konga tegadigan ulush.
    { key: "pershop", label: "Do'kon boshiga", render: (r) => <span className="air-num">{r.revenue_per_shop ? formatCompact(r.revenue_per_shop) : "—"}</span> },
    { key: "turnover", label: "Oborot, kun", render: (r) => <span className="air-num">{r.turnover_days ? formatNumber(r.turnover_days) : "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Nishalar"
        description="Qaysi nishada qancha aylanadi va bir do'konga qancha tegadi."
        actions={<PeriodPicker />}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Nisha nomi bo'yicha qidirish…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />
        {data && <span className="text-xs text-muted-foreground">{formatNumber(data.total)} nisha</span>}
      </div>
      {error ? <Failed message={error} /> : !data ? <Loading /> : (
        <Grid columns={columns} rows={data.items} rowKey={(r) => r.category_id}
              empty="Nishalar hali o'lchanmagan — «Ma'lumot manbai» bo'limiga qarang." />
      )}
    </div>
  );
}
