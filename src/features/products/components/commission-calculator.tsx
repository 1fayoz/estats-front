"use client";

import * as React from "react";
import { Calculator, ChevronDown, Info } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { calculateCommission } from "@/lib/commission";
import { formatSum, formatPercent } from "@/lib/format";
import type { Product } from "@/types/domain";
import { cn } from "@/lib/utils";

const COLORS = {
  category: "var(--chart-1)",
  payment: "var(--chart-2)",
  pickup: "var(--chart-3)",
  fulfillment: "var(--chart-4)",
  advertising: "var(--chart-5)",
  returns: "oklch(0.62 0.2 27)",
  vat: "oklch(0.72 0.16 60)",
  net: "oklch(0.65 0.18 145)",
};

export function CommissionCalculator({ product }: { product: Product }) {
  const [price, setPrice] = React.useState(product.price);
  const [cost, setCost] = React.useState(product.cost);
  const [units, setUnits] = React.useState(1);
  const [ad, setAd] = React.useState(5);

  const b = calculateCommission({
    price,
    cost,
    category: product.category,
    units,
    advertisingPercent: ad,
  });

  const chartData = [
    { name: "Sof daromad", value: Math.max(0, b.netRevenue - b.totalCost), color: COLORS.net },
    { name: "Mahsulot tannarxi", value: b.totalCost, color: "var(--muted-foreground)" },
    { name: `Uzum komissiyasi ${b.categoryCommissionPercent}%`, value: b.categoryCommission, color: COLORS.category },
    { name: "To'lov tizimi 2.5%", value: b.paymentFee, color: COLORS.payment },
    { name: "Pickup 1.2%", value: b.pickupFee, color: COLORS.pickup },
    { name: "Fulfillment", value: b.fulfillment, color: COLORS.fulfillment },
    { name: `Reklama ${ad}%`, value: b.advertising, color: COLORS.advertising },
    { name: "Qaytarish 4.5%", value: b.returns, color: COLORS.returns },
    { name: "QQS 12%", value: b.vat, color: COLORS.vat },
  ].filter((s) => s.value > 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-4 w-4 text-primary" />
            Foyda va komissiya kalkulyatori
          </CardTitle>
          <CardDescription>
            Narx va xarajatlarni o'zgartiring — sof foydani real vaqtda ko'ring
          </CardDescription>
        </div>
        <Badge variant="info">{product.categoryName}</Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Field label="Sotuv narxi" value={price} onChange={setPrice} suffix="so'm" />
          <Field label="Tannarx (1 dona)" value={cost} onChange={setCost} suffix="so'm" />
          <Field label="Donalar" value={units} onChange={setUnits} step={1} min={1} />
          <Field label="Reklama %" value={ad} onChange={setAd} step={0.5} min={0} suffix="%" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="relative h-[260px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={1}
                    strokeWidth={0}
                  >
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const p = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-muted-foreground">{formatSum(p.value)}</div>
                        </div>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Sof foyda</span>
                <span
                  className={cn(
                    "text-xl font-bold tabular-nums",
                    b.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}
                >
                  {formatSum(b.profit)}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  marja {formatPercent(b.marginPercent)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 lg:col-span-3">
            <BreakdownRow
              label="Yalpi tushum"
              value={b.gross}
              color="var(--foreground)"
              bold
              tone="positive"
            />
            <Divider />
            <BreakdownRow
              label={`Uzum komissiyasi — ${b.categoryCommissionPercent}%`}
              value={-b.categoryCommission}
              color={COLORS.category}
              tooltip={`"${product.categoryName}" kategoriyasi uchun standart komissiya`}
            />
            <BreakdownRow label="To'lov tizimi (2.5%)" value={-b.paymentFee} color={COLORS.payment} />
            <BreakdownRow label="Pickup point (1.2%)" value={-b.pickupFee} color={COLORS.pickup} />
            <BreakdownRow
              label={`Fulfillment (${units}× 4 000 so'm)`}
              value={-b.fulfillment}
              color={COLORS.fulfillment}
            />
            <BreakdownRow label={`Reklama (${ad}%)`} value={-b.advertising} color={COLORS.advertising} />
            <BreakdownRow label="Qaytarish kutilmasi (4.5%)" value={-b.returns} color={COLORS.returns} />
            <BreakdownRow label="QQS (12%)" value={-b.vat} color={COLORS.vat} />
            <Divider />
            <BreakdownRow
              label="Tannarx"
              value={-b.totalCost}
              color="var(--muted-foreground)"
              tooltip="Mahsulotning sotib olish narxi × donalar soni"
            />
            <Divider />
            <BreakdownRow
              label="Sof foyda"
              value={b.profit}
              color={b.profit >= 0 ? COLORS.net : "var(--destructive)"}
              bold
              tone={b.profit >= 0 ? "positive" : "negative"}
            />
            <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3">
              <Stat label="Foyda marjasi" value={formatPercent(b.marginPercent)} />
              <Stat label="ROI" value={formatPercent(b.roiPercent)} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          min={min}
          step={step}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="pr-12 font-mono tabular-nums"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  color,
  bold,
  tone,
  tooltip,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
  tone?: "positive" | "negative";
  tooltip?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className={cn(bold && "font-semibold")}>{label}</span>
        {tooltip && (
          <span title={tooltip} className="text-muted-foreground">
            <Info className="h-3 w-3" />
          </span>
        )}
      </div>
      <span
        className={cn(
          "text-sm tabular-nums",
          bold && "font-bold",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-rose-600 dark:text-rose-400"
        )}
      >
        {formatSum(value)}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="my-1 h-px bg-border" />;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-base font-semibold tabular-nums">{value}</div>
    </div>
  );
}
