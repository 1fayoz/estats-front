"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StateBanner } from "@/features/market/state-banner";
import { Failed, Grid, Growth, Loading, PeriodPicker, usePeriod, type Column } from "@/features/market/shared";
import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import {
  market, type MarketCategorySlice, type MarketPage, type MarketShop,
} from "@/lib/market";

const COLORS = ["#0075ff", "#5b4bc4", "#1bce7b", "#faa72c", "#00b8d4", "#8e7cff"];
const tipMoney = (value: unknown) => value == null ? "—" : formatCompact(Number(value));

export default function CategoriesPage() {
  const days = usePeriod();
  const [level, setLevel] = React.useState("1");
  const [categories, setCategories] = React.useState<MarketCategorySlice[] | null>(null);
  const [shops, setShops] = React.useState<MarketPage<MarketShop> | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setError(null);
    Promise.all([
      market.categories(days, Number(level), 40),
      market.shops({ days, order: "revenue", limit: 10 }),
    ])
      .then(([categoryRows, shopRows]) => { setCategories(categoryRows); setShops(shopRows); })
      .catch((e) => setError(e.message));
  }, [days, level]);

  const columns: Column<MarketCategorySlice>[] = [
    {
      key: "title", label: "Kategoriya", align: "left",
      render: (row) => (
        <Link href={`/market/dynamics?category=${row.category_id}&days=${days}`} className="text-primary hover:underline">
          {row.title}
        </Link>
      ),
    },
    { key: "revenue", label: "Tushum", render: (row) => <span className="air-num">{formatCompact(row.revenue)}</span> },
    { key: "share", label: "Bozor ulushi", render: (row) => <span className="air-num">{formatPercent(row.share)}</span> },
    { key: "growth", label: "O'sish", render: (row) => <Growth value={row.growth} /> },
    { key: "units", label: "Sotuv, dona", render: (row) => <span className="air-num">{formatNumber(row.units)}</span> },
  ];

  if (error) return <Failed message={error} />;
  if (!categories || !shops) return <Loading />;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kategoriyalar"
        description="Kategoriya hajmi, o'sishi va yetakchi do'konlar."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={level} onValueChange={setLevel}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((value) => (
                  <SelectItem key={value} value={String(value)}>{value}-qatlam</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <PeriodPicker />
          </div>
        }
      />
      <StateBanner />
      <div className="rounded-xl border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
        Raqobatchilarning tannarxi ochiq emas. Shu sabab grafiklar foyda deb taxmin qilmaydi —
        Uzumdagi sotuv va narxdan hisoblangan tushumni ko&apos;rsatadi.
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 text-xs font-medium text-muted-foreground">Kategoriyalar tushum bo&apos;yicha</div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={categories.slice(0, 15)} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tickFormatter={(value: number) => formatCompact(value)} fontSize={11} />
              <YAxis type="category" dataKey="title" width={145} fontSize={11} />
              <Tooltip formatter={tipMoney} />
              <Bar dataKey="revenue" name="Tushum" radius={[0, 4, 4, 0]}>
                {categories.slice(0, 15).map((row, index) => (
                  <Cell key={row.category_id} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 text-xs font-medium text-muted-foreground">Top-do&apos;konlar tushum bo&apos;yicha</div>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={shops.items} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" />
              <XAxis type="number" tickFormatter={(value: number) => formatCompact(value)} fontSize={11} />
              <YAxis type="category" dataKey="title" width={145} fontSize={11} />
              <Tooltip formatter={tipMoney} />
              <Bar dataKey="revenue" name="Tushum" fill="#0075ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Grid
        columns={columns}
        rows={categories}
        rowKey={(row) => row.category_id}
        empty="Bu qatlam bo'yicha hali o'lchov yo'q."
      />
    </div>
  );
}
