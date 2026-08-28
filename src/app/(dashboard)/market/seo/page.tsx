"use client";

import * as React from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { ExportButtons } from "@/features/market/export-buttons";
import { Input } from "@/components/ui/input";
import { Failed, Grid, Loading, type Column } from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { market, type MarketKeyword, type MarketPage } from "@/lib/market";

export default function MarketSeoPage() {
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<MarketPage<MarketKeyword> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      market.keywords({ q: q || undefined }).then(setData).catch((e) => setError(e.message));
    }, 350);
    return () => clearTimeout(timer);
  }, [q]);

  const columns: Column<MarketKeyword>[] = [
    {
      key: "text", label: "So'rov", align: "left",
      render: (r) => (
        <a href={r.url ?? "#"} target="_blank" rel="noreferrer" className="text-primary hover:underline">
          {r.text}
        </a>
      ),
    },
    { key: "coverage", label: "Qamrov (1 kun)", render: (r) => <span className="air-num">{r.coverage != null ? formatNumber(r.coverage) : "—"}</span> },
    { key: "cards", label: "Kartochkalar", render: (r) => <span className="air-num">{r.cards != null ? formatNumber(r.cards) : "—"}</span> },
    { key: "ads", label: "Reklamada", render: (r) => <span className="air-num text-muted-foreground">{r.cards_in_ads ?? "—"}</span> },
    // Talab koeffitsiyenti = qamrov / kartochkalar. Nisha
    // tanlashda eng kerakli raqam: ommabop so'z ustida 5 000
    // raqobatchi bo'lsa, ommaboplik foyda emas.
    { key: "demand", label: "Talab koeff.", render: (r) => <span className="air-num">{r.demand_ratio != null ? formatNumber(Number(r.demand_ratio.toFixed(2))) : "—"}</span> },
    { key: "revenue", label: "TOP-100 tushumi", render: (r) => <span className="air-num">{r.top100_revenue != null ? formatCompact(r.top100_revenue) : "—"}</span> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Qidiruv so'rovlari"
        description="Xaridor nima deb yozadi, u so'rov ustida qancha raqobat bor."
        actions={<ExportButtons report="keywords" days={30} />} />
      <Input placeholder="So'rov…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      {error ? <Failed message={error} /> : !data ? <Loading /> : (
        <Grid columns={columns} rows={data.items} rowKey={(r) => r.keyword_id}
              empty="Kalit so'zlar hali o'lchanmagan — «Ma'lumot manbai» bo'limida KEYWORDS qadamini ishga tushiring." />
      )}
    </div>
  );
}
