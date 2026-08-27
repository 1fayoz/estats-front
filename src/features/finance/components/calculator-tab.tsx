"use client";

import * as React from "react";
import { Calculator } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardHead, CardList, CardStats, DataCard } from "@/components/dashboard/data-cards";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UZUM_CATEGORY_COMMISSION, calculateCommission } from "@/lib/commission";
import { formatPercent, formatSum } from "@/lib/format";
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

export function CalculatorTab() {
  const [price, setPrice] = React.useState(500_000);
  const [cost, setCost] = React.useState(220_000);
  const [units, setUnits] = React.useState(100);
  const [category, setCategory] = React.useState<CategoryCommissionKey>("fashion");
  const [ad, setAd] = React.useState(8);

  const b = calculateCommission({ price, cost, category, units, advertisingPercent: ad });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Tezkor foyda kalkulyatori
          </CardTitle>
          <CardDescription>Istalgan mahsulot uchun sof foydani sanab ko&apos;ring</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Narx (so'm)" value={price} onChange={setPrice} />
              <Field label="Tannarx (so'm)" value={cost} onChange={setCost} />
              <Field label="Donalar" value={units} onChange={setUnits} step={1} min={1} />
              <Field label="Reklama (%)" value={ad} onChange={setAd} step={0.5} min={0} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Kategoriya</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as CategoryCommissionKey)}>
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
          </div>

          <div className="rounded-xl border bg-muted/40 p-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Row label="Yalpi tushum" value={formatSum(b.gross)} />
              <Row
                label={`Komissiya (${b.categoryCommissionPercent}%)`}
                value={`−${formatSum(b.categoryCommission)}`}
                tone="negative"
              />
              <Row
                label="Boshqa to'lovlar"
                value={`−${formatSum(b.totalFees - b.categoryCommission)}`}
                tone="negative"
              />
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
                <span className="font-medium">
                  {formatPercent(b.marginPercent)} · ROI {formatPercent(b.roiPercent)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uzum komissiya tariflari</CardTitle>
          <CardDescription>
            Kategoriya bo&apos;yicha sotuv summasidan olinadigan komissiya foizi
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <CardList className="px-4">
            {COMMISSION_TABLE.map((c) => (
              <DataCard key={c.key}>
                <CardHead
                  title={c.name}
                  right={
                    <Badge variant="default" className="font-mono">
                      {c.commission}%
                    </Badge>
                  }
                />
                <CardStats
                  items={[
                    { label: "100 000 dan", value: formatSum((100_000 * c.commission) / 100) },
                    { label: "500 000 dan", value: formatSum((500_000 * c.commission) / 100) },
                    { label: "1 000 000 dan", value: formatSum((1_000_000 * c.commission) / 100) },
                  ]}
                />
              </DataCard>
            ))}
            <p className="px-1 text-xs text-muted-foreground">
              * Komissiyaga qo&apos;shimcha: to&apos;lov tizimi 2.5%, pickup 1.2%, QQS 12%,
              1 dona uchun fulfillment ~4 000 so&apos;m.
            </p>
          </CardList>

          <div className="hidden overflow-x-auto md:block">
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
                      <Badge variant="default" className="font-mono">
                        {c.commission}%
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {formatSum((100_000 * c.commission) / 100)}
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums">
                      {formatSum((500_000 * c.commission) / 100)}
                    </td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums">
                      {formatSum((1_000_000 * c.commission) / 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 pt-3 text-xs text-muted-foreground">
              * Komissiyaga qo&apos;shimcha: to&apos;lov tizimi 2.5%, pickup 1.2%, QQS 12%, 1 dona uchun
              fulfillment ~4 000 so&apos;m. Aniq summa tarif rejasiga qarab farq qilishi mumkin.
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
