"use client";

import * as React from "react";
import Link from "next/link";

import { MARKET_TABS, ModuleTabs } from "@/components/air/module-tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { StateBanner } from "@/features/market/state-banner";
import { ColumnSettingsButton, useColumnPrefs } from "@/components/air/column-settings";
import { ExportButtons } from "@/features/market/export-buttons";
import { Input } from "@/components/ui/input";
import { Failed, Grid, Growth, Loading, PeriodPicker, usePeriod, type Column } from "@/features/market/shared";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import { market, type MarketPage, type MarketShop } from "@/lib/market";

export default function MarketShopsPage() {
  const days = usePeriod();
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<MarketPage<MarketShop> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      market.shops({ days, q: q || undefined }).then(setData).catch((e) => setError(e.message));
    }, 350);
    return () => clearTimeout(timer);
  }, [days, q]);

  const columns: Column<MarketShop>[] = [
    {
      key: "title", label: "Do'kon", align: "left",
      render: (r) => (
        <Link href={`/market/shops/${r.shop_id}`} className="text-primary hover:underline">
          {r.title}
        </Link>
      ),
    },
    { key: "seller", label: "Yuridik shaxs", align: "left", render: (r) => r.seller ?? "—" },
    { key: "revenue", label: "Tushum", render: (r) => <span className="air-num">{formatCompact(r.revenue)}</span> },
    { key: "growth", label: "O'sish", render: (r) => <Growth value={r.growth} /> },
    // Bozor ulushi FAQAT tanlangan kesim ichida hisoblanadi.
    // Butun bozorga nisbatan ulush hamma do'kon uchun 0,0% chiqadi
    // va hech nimani ko'rsatmaydi.
    { key: "share", label: "Bozor ulushi", render: (r) => <span className="air-num">{r.share != null ? formatPercent(r.share) : "—"}</span> },
    { key: "units", label: "Sotuv, dona", render: (r) => <span className="air-num">{formatNumber(r.units)}</span> },
    { key: "daily", label: "Kunlik sotuv", render: (r) => <span className="air-num">{r.daily_units ? formatNumber(r.daily_units) : "—"}</span> },
    { key: "orders", label: "Har doimgi buyurtma", render: (r) => <span className="air-num text-muted-foreground">{r.orders_total != null ? formatNumber(r.orders_total) : "—"}</span> },
  ];

  // Ustun tanlovi — `columns` dan keyin, chunki ro'yxat undan
  // olinadi. Zavod holatida hammasi ko'rinadi.
  const options = React.useMemo(
    () => columns.map((c) => ({ key: c.key, label: c.label })),
    [columns],
  );
  const { visible, setVisible, reset } = useColumnPrefs("market-shops", options);

  return (
    <div className="space-y-4">
      <ModuleTabs tabs={MARKET_TABS} />

      <PageHeader title="Do'konlar reytingi"
        description="Kim qancha sotyapti va bozorning qancha qismini egallagan."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodPicker />
            <ColumnSettingsButton
              title="Do'konlar"
              options={options}
              visible={visible}
              onApply={setVisible}
              onReset={reset}
            />
            <ExportButtons report="shops" days={days} />
          </div>
        }
      />
      <StateBanner />

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Do'kon nomi…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        {data && <span className="text-xs text-muted-foreground">{formatNumber(data.total)} do&apos;kon</span>}
      </div>
      {error ? <Failed message={error} /> : !data ? <Loading /> : (
        <Grid columns={columns} visible={visible} rows={data.items} rowKey={(r) => r.shop_id}
              empty="Do'konlar hali o'lchanmagan — «Bozor → Ma'lumot manbai» bo'limiga qarang." />
      )}
    </div>
  );
}
