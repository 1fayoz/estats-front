"use client";

import * as React from "react";
import { Wallet, TrendingUp, ArrowDownRight, ArrowUpRight, Calculator } from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";

import { PRODUCTS } from "@/data/products";
import { UZUM_CATEGORY_COMMISSION, calculateCommission } from "@/lib/commission";
import { formatNumber, formatPercent, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryCommissionKey } from "@/types/domain";

const COMMISSION_TABLE: { key: CategoryCommissionKey; name: string; commission: number }[] = [
  { key: "electronics", name: "Elektronika", commission: UZUM_CATEGORY_COMMISSION.electronics },
  { key: "fashion", name: "Kiyim-kechak", commission: UZUM_CATEGORY_COMMISSION.fashion },
  { key: "beauty", name: "Go'zallik", commission: UZUM_CATEGORY_COMMISSION.beauty },
  { key: "home", name: "Uy va bog'", commission: UZUM_CATEGORY_COMMISSION.home },
  { key: "kids", name: "Bolalar tovarlari", commission: UZUM_CATEGORY_COMMISSION.kids },
  { key: "sports", name: "Sport", commission: UZUM_CATEGORY_COMMISSION.sports },
  { key: "auto", name: "Avto", commission: UZUM_CATEGORY_COMMISSION.auto },
  { key: "food", name: "Oziq-ovqat", commission: UZUM_CATEGORY_COMMISSION.food },
  { key: "books", name: "Kitoblar", commission: UZUM_CATEGORY_COMMISSION.books },
];

export default function FinancePage() {
  const [price, setPrice] = React.useState(500_000);
  const [cost, setCost] = React.useState(220_000);
  const [units, setUnits] = React.useState(100);
  const [category, setCategory] = React.useState<CategoryCommissionKey>("fashion");
  const [ad, setAd] = React.useState(8);

  const b = calculateCommission({ price, cost, category, units, advertisingPercent: ad });

  const totalRevenue = PRODUCTS.reduce((acc, p) => acc + p.revenue30d, 0);
  const totalCommission = PRODUCTS.reduce(
    (acc, p) =>
      acc +
      (p.revenue30d * UZUM_CATEGORY_COMMISSION[p.category]) / 100,
    0
  );
  const estimatedNet = totalRevenue - totalCommission - totalRevenue * 0.16;

  const byCategory = COMMISSION_TABLE.map((c) => {
    const items = PRODUCTS.filter((p) => p.category === c.key);
    const rev = items.reduce((acc, p) => acc + p.revenue30d, 0);
    return { name: c.name, revenue: rev, commission: (rev * c.commission) / 100 };
  }).filter((c) => c.revenue > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moliya va komissiyalar"
        description="Uzum komissiyalari, kategoriya tariflari va daromadni hisoblang."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 via-card to-info/5 p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Wallet className="h-4 w-4" /> Yalpi daromad (30 kun)
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums">{formatSumShort(totalRevenue)}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Jami {PRODUCTS.length} mahsulot bo'yicha
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowDownRight className="h-4 w-4 text-rose-500" /> Uzum komissiyasi
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            −{formatSumShort(totalCommission)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            O'rtacha {formatPercent((totalCommission / totalRevenue) * 100)}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowUpRight className="h-4 w-4 text-emerald-500" /> Taxminiy sof tushum
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {formatSumShort(estimatedNet)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Komissiya + boshqa to'lovlardan keyin
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              Tezkor foyda kalkulyatori
            </CardTitle>
            <CardDescription>
              Istalgan mahsulot uchun sof foydani sanab ko'ring
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Narx (so'm)" value={price} onChange={setPrice} />
              <Field label="Tannarx (so'm)" value={cost} onChange={setCost} />
              <Field label="Donalar" value={units} onChange={setUnits} step={1} min={1} />
              <Field label="Reklama (%)" value={ad} onChange={setAd} step={0.5} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Kategoriya</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as CategoryCommissionKey)}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMMISSION_TABLE.map((c) => (
                    <SelectItem key={c.key} value={c.key}>
                      {c.name} — {c.commission}% komissiya
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border bg-muted/40 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <Row label="Yalpi tushum" value={formatSum(b.gross)} />
                <Row
                  label={`Komissiya (${b.categoryCommissionPercent}%)`}
                  value={`−${formatSum(b.categoryCommission)}`}
                  tone="negative"
                />
                <Row label="Boshqa to'lovlar" value={`−${formatSum(b.totalFees - b.categoryCommission)}`} tone="negative" />
                <Row label="Tannarx" value={`−${formatSum(b.totalCost)}`} tone="negative" />
              </div>
              <div className="mt-4 border-t pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Sof foyda</span>
                  <span
                    className={cn(
                      "text-xl font-bold tabular-nums",
                      b.profit >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {formatSum(b.profit)}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>marja</span>
                  <span className="font-medium">{formatPercent(b.marginPercent)} · ROI {formatPercent(b.roiPercent)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Kategoriyalar bo'yicha komissiya
            </CardTitle>
            <CardDescription>
              Sizning kategoriyalaringizdan to'langan komissiya
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byCategory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  interval={0}
                  angle={-18}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tickFormatter={(v) => formatSumShort(v)}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  width={70}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-muted-foreground">
                          komissiya: <span className="font-medium text-foreground">{formatSum(p.commission)}</span>
                        </div>
                        <div className="text-muted-foreground">
                          daromad: <span className="font-medium text-foreground">{formatSumShort(p.revenue)}</span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="commission" radius={[6, 6, 0, 0]}>
                  {byCategory.map((_, i) => (
                    <Cell key={i} fill={i % 2 === 0 ? "var(--chart-1)" : "var(--chart-2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uzum komissiya tariflari</CardTitle>
          <CardDescription>
            Kategoriya bo'yicha sotuv summasidan olinadigan komissiya foizi
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Kategoriya</th>
                  <th className="px-6 py-3 text-right font-medium">Komissiya</th>
                  <th className="px-6 py-3 text-right font-medium">100 000 dan</th>
                  <th className="px-6 py-3 text-right font-medium">500 000 dan</th>
                  <th className="px-6 py-3 text-right font-medium">1 000 000 dan</th>
                </tr>
              </thead>
              <tbody>
                {COMMISSION_TABLE.map((c) => (
                  <tr key={c.key} className="border-b last:border-0 hover:bg-accent/30">
                    <td className="px-6 py-3 font-medium">{c.name}</td>
                    <td className="px-6 py-3 text-right">
                      <Badge variant="default" className="font-mono">{c.commission}%</Badge>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">{formatSum((100_000 * c.commission) / 100)}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{formatSum((500_000 * c.commission) / 100)}</td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums">
                      {formatSum((1_000_000 * c.commission) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 pt-3 text-xs text-muted-foreground">
              * Komissiyaga qo'shimcha: to'lov tizimi 2.5%, pickup 1.2%, QQS 12%, 1 dona uchun fulfillment ~4 000 so'm.
              Aniq summa tarif rejasiga qarab farq qilishi mumkin.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="font-mono tabular-nums"
      />
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "negative";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "negative" && "text-rose-600 dark:text-rose-400"
        )}
      >
        {value}
      </div>
    </div>
  );
}
