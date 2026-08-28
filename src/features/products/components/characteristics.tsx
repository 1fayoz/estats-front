"use client";

import { Award, Palette, Ruler, Sparkles } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatNumber, formatPercent, formatSumShort } from "@/lib/format";
import type { Product } from "@/types/domain";
import { cn } from "@/lib/utils";

const COLORS = [
  { name: "Qora", hex: "#1a1a1a", share: 32, sales: 412, revenue: 0 },
  { name: "Oq", hex: "#f5f5f5", share: 24, sales: 308, revenue: 0 },
  { name: "Ko'k", hex: "#3b82f6", share: 16, sales: 205, revenue: 0 },
  { name: "Pushti", hex: "#ec4899", share: 12, sales: 154, revenue: 0 },
  { name: "Yashil", hex: "#10b981", share: 9, sales: 116, revenue: 0 },
  { name: "Qizil", hex: "#ef4444", share: 7, sales: 90, revenue: 0 },
];

const SIZES = [
  { name: "S", share: 12 },
  { name: "M", share: 28 },
  { name: "L", share: 32 },
  { name: "XL", share: 18 },
  { name: "XXL", share: 10 },
];

const MATERIALS = [
  { name: "Paxta 100%", share: 42, premium: true },
  { name: "Polyester aralash", share: 28, premium: false },
  { name: "Vis (vihris)", share: 14, premium: false },
  { name: "Bambuk", share: 10, premium: true },
  { name: "Sintetika", share: 6, premium: false },
];

const BEST_COMBOS = [
  { combo: "Qora · M · Paxta 100%", sales: 124, revenue: 78_500_000, score: 96 },
  { combo: "Oq · L · Paxta 100%", sales: 98, revenue: 62_200_000, score: 89 },
  { combo: "Qora · L · Polyester", sales: 84, revenue: 53_400_000, score: 82 },
];

export function ProductCharacteristics({ product }: { product: Product }) {
  COLORS.forEach((c) => {
    c.revenue = c.sales * product.price;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Mahsulot xarakteristikalari tahlili
        </CardTitle>
        <CardDescription>
          Qaysi rang, o'lcham va material eng ko'p sotilayotganini ko'ring — yangi SKU'larni
          shunga moslab tayyorlang
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Palette className="h-3.5 w-3.5" />
              Ranglar
            </div>
            <div className="space-y-2">
              {COLORS.map((c) => (
                <div key={c.name} className="flex items-center gap-2 text-xs">
                  <div
                    className="h-5 w-5 shrink-0 rounded-full border-2 border-background ring-1 ring-border shadow-sm"
                    style={{ background: c.hex }}
                  />
                  <span className="w-14 shrink-0 font-medium">{c.name}</span>
                  <Progress
                    value={c.share}
                    max={40}
                    className="h-2 flex-1"
                    indicatorClassName="bg-gradient-to-r from-primary to-info"
                  />
                  <span className="w-12 text-right font-semibold tabular-nums">{c.share}%</span>
                  <span className="w-14 text-right tabular-nums text-muted-foreground">
                    {formatNumber(c.sales)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Ruler className="h-3.5 w-3.5" />
              O'lchamlar
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={SIZES}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 12, fontWeight: 600 }}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  width={32}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.3 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const p = payload[0].payload as { name: string; share: number };
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
                        <div className="font-semibold">{p.name} o'lcham</div>
                        <div className="text-muted-foreground">sotuvlar ulushi: {p.share}%</div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="share" radius={[6, 6, 0, 0]}>
                  {SIZES.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i === 2 ? "var(--chart-1)" : "color-mix(in oklch, var(--chart-1) 50%, var(--background))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="text-center text-xs text-muted-foreground">
              Eng mashhur: <span className="font-bold text-primary">L o'lcham (32%)</span>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Materiallar
            </div>
            <div className="space-y-2.5">
              {MATERIALS.map((m) => (
                <div key={m.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      {m.name}
                      {m.premium && (
                        <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-bold uppercase text-amber-600">
                          Premium
                        </span>
                      )}
                    </span>
                    <span className="font-semibold tabular-nums">{m.share}%</span>
                  </div>
                  <Progress
                    value={m.share}
                    max={50}
                    className="h-1.5"
                    indicatorClassName={cn(
                      m.premium ? "bg-gradient-to-r from-amber-500 to-orange-500" : "bg-info"
                    )}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-info/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold">G'olib kombinatsiyalar</span>
            <Badge variant="default" className="ml-auto gap-1">
              <Sparkles className="h-3 w-3" /> AI
            </Badge>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {BEST_COMBOS.map((b, i) => (
              <div
                key={b.combo}
                className={cn(
                  "rounded-lg border bg-card p-3",
                  i === 0 && "border-amber-500/40 bg-gradient-to-br from-amber-500/10 to-card"
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge variant={i === 0 ? "warning" : "secondary"} className="text-[10px]">
                    #{i + 1} {i === 0 && "· G'olib"}
                  </Badge>
                  <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {b.score}/100
                  </span>
                </div>
                <div className="mt-2 text-sm font-semibold">{b.combo}</div>
                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {formatNumber(b.sales)} sotuv
                  </span>
                  <span className="font-semibold tabular-nums">{formatSumShort(b.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            💡 Maslahat: keyingi SKU'lar uchun ushbu kombinatsiyalarni asos qilib oling — daromad
            o'rtacha <span className="font-semibold text-foreground">3.4×</span> yuqori bo'ladi.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
