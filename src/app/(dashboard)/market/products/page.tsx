"use client";

import * as React from "react";
import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { StateBanner } from "@/features/market/state-banner";
import { ColumnSettingsButton, useColumnPrefs } from "@/components/air/column-settings";
import { ExportButtons } from "@/features/market/export-buttons";
import { Input } from "@/components/ui/input";
import {
  Failed, Grid, Growth, Loading, PeriodPicker, usePeriod, type Column,
} from "@/features/market/shared";
import { formatCompact, formatNumber } from "@/lib/format";
import { market, type MarketPage, type MarketProduct } from "@/lib/market";

export default function MarketProductsPage() {
  const days = usePeriod();
  const [q, setQ] = React.useState("");
  const [data, setData] = React.useState<MarketPage<MarketProduct> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    const timer = setTimeout(() => {
      market.products({ days, q: q || undefined }).then(setData).catch((e) => setError(e.message));
    }, 350);
    return () => clearTimeout(timer);
  }, [days, q]);

  const columns: Column<MarketProduct>[] = [
    {
      key: "title", label: "Kartochka", align: "left",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          {r.photo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={r.photo} alt="" width={28} height={28}
                 className="h-7 w-7 shrink-0 rounded object-cover" />
          )}
          {/* Nom ICHKI sahifaga olib boradi, Uzumga emas: kunlik
              tarix, SKU'lar va o'rinlar shu yerda. Uzumga havola
              esa ichki sahifada alohida tugma bilan. */}
          <Link href={`/market/products/${r.product_id}`}
                className="max-w-[320px] whitespace-normal text-primary hover:underline">
            {r.title}
          </Link>
        </div>
      ),
    },
    { key: "shop", label: "Do'kon", align: "left", render: (r) => r.shop ?? "—" },
    { key: "revenue", label: "Tushum", render: (r) => <span className="air-num">{formatCompact(r.revenue)}</span> },
    { key: "growth", label: "O'sish", render: (r) => <Growth value={r.growth} /> },
    {
      // Yo'qotilgan foyda — TAXMIN: qoldiqsiz kunlar × sotuvli
      // kunlardagi o'rtacha kunlik tushum. Aniq raqam emas va
      // shunday deb o'qilishi kerak.
      key: "lost", label: "Yo'qotilgan",
      render: (r) => <span className={`air-num ${r.lost_revenue ? "air-bad" : ""}`}>
        {r.lost_revenue ? formatCompact(r.lost_revenue) : "—"}
      </span>,
    },
    { key: "units", label: "Sotuv, dona", render: (r) => <span className="air-num">{formatNumber(r.units)}</span> },
    { key: "daily", label: "Kunlik", render: (r) => <span className="air-num">{r.daily_units ? formatNumber(r.daily_units) : "—"}</span> },
    { key: "price", label: "O'rtacha narx", render: (r) => <span className="air-num">{r.avg_price ? formatCompact(r.avg_price) : "—"}</span> },
    { key: "stock", label: "Qoldiq", render: (r) => <span className="air-num">{r.stock != null ? formatNumber(r.stock) : "—"}</span> },
    { key: "out", label: "Qoldiqsiz kun", render: (r) => <span className="air-num text-muted-foreground">{r.days_out_of_stock ?? "—"}</span> },
    { key: "rating", label: "Reyting", render: (r) => <span className="air-num">{r.rating ? formatNumber(Number(r.rating.toFixed(1))) : "—"}</span> },
    { key: "age", label: "Uzumda, kun", render: (r) => <span className="air-num text-muted-foreground">{r.days_on_uzum ?? "—"}</span> },
  ];

  // Ustun tanlovi — `columns` dan keyin, chunki ro'yxat undan
  // olinadi. Zavod holatida hammasi ko'rinadi.
  const options = React.useMemo(
    () => columns.map((c) => ({ key: c.key, label: c.label })),
    [columns],
  );
  const { visible, setVisible, reset } = useColumnPrefs("market-products", options);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bozordagi tovarlar"
        description="Raqobatchilarning kartochkalari: tushum, o'sish, qoldiqsiz kunlarda yo'qotilgan foyda."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <PeriodPicker />
            <ColumnSettingsButton
              title="Bozordagi tovarlar"
              options={options}
              visible={visible}
              onApply={setVisible}
              onReset={reset}
            />
            <ExportButtons report="products" days={days} />
          </div>
        }
      />
      <StateBanner />

      <div className="flex flex-wrap items-center gap-3">
        <Input placeholder="Tovar nomi…" value={q} onChange={(e) => setQ(e.target.value)}
               className="max-w-xs" />
        {data && <span className="text-xs text-muted-foreground">{formatNumber(data.total)} kartochka</span>}
      </div>
      {error ? <Failed message={error} /> : !data ? <Loading /> : (
        <Grid columns={columns} visible={visible} rows={data.items} rowKey={(r) => r.product_id}
              empty="Tovarlar hali o'lchanmagan — «Bozor → Ma'lumot manbai» bo'limiga qarang." />
      )}
    </div>
  );
}
