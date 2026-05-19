"use client";

import { ArrowUp, ArrowDown, Boxes, Building2, Clock, Crown, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/page-header";
import { ScoreGauge } from "@/components/dashboard/score-gauge";
import { CATEGORIES } from "@/data/categories";
import { UZUM_CATEGORY_COMMISSION } from "@/lib/commission";
import { formatNumber, formatPercent, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

function calcNicheScore(growth: number, share: number, turnover: number, commission: number): number {
  const growthScore = Math.min(100, Math.max(0, 50 + growth));
  const competitionScore = Math.min(100, Math.max(0, 100 - share));
  const turnoverScore = Math.min(100, Math.max(0, 100 - turnover));
  const marginScore = Math.min(100, Math.max(0, 100 - commission * 2));
  return Math.round((growthScore + competitionScore + turnoverScore + marginScore) / 4);
}

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kategoriyalar tahlili"
        description="Nishlar bo'yicha bozor sig'imi, o'rtacha narx, o'sish va Uzum komissiyasi."
      />

      <Card>
        <CardHeader>
          <CardTitle>Kategoriya o'sishi (so'nggi 30 kun)</CardTitle>
          <CardDescription>Daromad o'sish foizi bo'yicha taqqoslash</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={CATEGORIES} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                angle={-12}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tickFormatter={(v) => `${v}%`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
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
                        o'sish: <span className="font-medium text-foreground">{p.growthPercent}%</span>
                      </div>
                      <div className="text-muted-foreground">
                        bozor: <span className="font-medium text-foreground">{formatSumShort(p.marketRevenue)}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar dataKey="growthPercent" radius={[6, 6, 0, 0]}>
                {CATEGORIES.map((c) => (
                  <Cell
                    key={c.id}
                    fill={c.growthPercent >= 0 ? "var(--chart-1)" : "var(--destructive)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const commission = UZUM_CATEGORY_COMMISSION[cat.key];
          const positive = cat.growthPercent >= 0;
          const nicheScore = calcNicheScore(cat.growthPercent, cat.topShare, cat.turnoverDays, commission);
          return (
            <Card key={cat.id} className={cn("transition-all hover:shadow-md", nicheScore >= 75 && "border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.04] to-card")}>
              <CardHeader className="space-y-2 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{cat.name}</CardTitle>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant="default">Uzum {commission}%</Badge>
                      {nicheScore >= 75 && (
                        <Badge variant="success" className="gap-1">
                          🔥 Hot nisha
                        </Badge>
                      )}
                    </div>
                  </div>
                  <ScoreGauge score={nicheScore} size={64} label="nisha" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold tabular-nums">
                    {formatSumShort(cat.marketRevenue)}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold",
                      positive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                    {Math.abs(cat.growthPercent)}%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <Mini icon={Boxes} label="Mahsulotlar" value={formatNumber(cat.productsCount)} />
                  <Mini icon={Building2} label="Do'konlar" value={formatNumber(cat.activeStores)} />
                  <Mini icon={Clock} label="Aylanma" value={`${cat.turnoverDays} kun`} />
                  <Mini icon={Crown} label="Top 10 ulushi" value={`${cat.topShare}%`} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>O'rtacha narx</span>
                    <span className="font-medium text-foreground">{formatSum(cat.averagePrice)}</span>
                  </div>
                </div>
                <div className="space-y-1.5 border-t pt-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Narx segmentlari
                  </div>
                  {cat.priceSegments.map((s) => (
                    <div key={s.range} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>{s.range}</span>
                        <span className="font-medium tabular-nums">{formatPercent(s.share)}</span>
                      </div>
                      <Progress
                        value={s.share}
                        className="h-1.5"
                        indicatorClassName="bg-gradient-to-r from-primary to-info"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Mini({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      <div className="min-w-0">
        <div className="text-[10px] text-muted-foreground">{label}</div>
        <div className="truncate font-medium tabular-nums">{value}</div>
      </div>
    </div>
  );
}
