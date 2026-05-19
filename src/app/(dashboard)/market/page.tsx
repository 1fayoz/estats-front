"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, BarChart3, Building2, Calendar, Globe2, PieChart, ScatterChart, TrendingUp } from "lucide-react";
import { PieChart as ReChartsPie, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { KPIStripItem } from "@/components/dashboard/kpi-strip-item";
import { TreemapChart } from "@/components/charts/treemap-chart";
import { BubbleChart } from "@/components/charts/bubble-chart";
import { DualPeriodBars } from "@/components/charts/dual-period-bars";
import { HeatmapCell } from "@/components/dashboard/heatmap-cell";

import {
  getAssortmentBubbles,
  getCategoryTreemap,
  getDualPeriodRevenue,
  getKpiSparkline,
  getMarketKpi,
  getTop100Stores,
  getTopCategoriesDonut,
} from "@/data/market";
import { formatCompact, formatNumber, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function MarketPage() {
  const kpi = getMarketKpi();
  const treemap = getCategoryTreemap();
  const bubbles = getAssortmentBubbles();
  const dualPeriod = getDualPeriodRevenue();
  const donut = getTopCategoriesDonut();
  const top100 = getTop100Stores();
  const maxRevenue = Math.max(...top100.map((s) => s.revenue));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bozor sharhi"
        description="Uzum Market umumiy holati: kategoriyalar, top-100 do'konlar, assortiment va raqobat darajasi."
        badge={
          <Badge variant="info" className="gap-1.5">
            <Globe2 className="h-3 w-3" />
            Uzbekistan
          </Badge>
        }
        actions={
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" />
            13 dek — 11 yan
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-7">
        <KPIStripItem
          label="Yalpi daromad"
          value={formatSumShort(kpi.revenue)}
          delta={kpi.revenueDelta}
          hint="oldingi 30 kunga"
          spark={getKpiSparkline(1)}
        />
        <KPIStripItem
          label="Do'konlar"
          value={formatCompact(kpi.stores)}
          delta={kpi.storesDelta}
          spark={getKpiSparkline(2)}
        />
        <KPIStripItem
          label="...faol"
          value={`${kpi.activeStoresPercent}%`}
          delta={-3}
          hint={formatNumber(kpi.activeStores)}
          spark={getKpiSparkline(3)}
        />
        <KPIStripItem
          label="Kartochkalar"
          value={formatCompact(kpi.cards)}
          delta={kpi.cardsDelta}
          spark={getKpiSparkline(4)}
        />
        <KPIStripItem
          label="...faol"
          value={`${kpi.activeCardsPercent}%`}
          delta={-3}
          hint={formatNumber(kpi.activeCards)}
          spark={getKpiSparkline(5)}
        />
        <KPIStripItem
          label="SKU"
          value={formatCompact(kpi.skus)}
          delta={kpi.skusDelta}
          spark={getKpiSparkline(6)}
        />
        <KPIStripItem
          label="Aylanma, kun"
          value={String(kpi.turnoverDays)}
          delta={kpi.turnoverDelta}
          spark={getKpiSparkline(7)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Top kategoriyalar
            </CardTitle>
            <CardDescription>Daromaddagi ulush bo'yicha</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[200px_1fr]">
              <div className="relative h-[220px]">
                <ResponsiveContainer>
                  <ReChartsPie>
                    <Pie
                      data={donut}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={88}
                      paddingAngle={1}
                      strokeWidth={0}
                    >
                      {donut.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0].payload as { name: string; value: number };
                        return (
                          <div className="rounded-lg border bg-popover px-2 py-1.5 text-xs shadow-xl">
                            <div className="font-semibold">{p.name}</div>
                            <div className="text-muted-foreground">{p.value}%</div>
                          </div>
                        );
                      }}
                    />
                  </ReChartsPie>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 max-h-[220px] overflow-y-auto scrollbar-thin">
                {donut.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="truncate">{d.name}</span>
                    <span className="ml-auto font-semibold tabular-nums">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                TOP-100 do'konlar
              </CardTitle>
              <CardDescription>Daromad bo'yicha, jami {formatSumShort(top100.reduce((a, s) => a + s.revenue, 0))}</CardDescription>
            </div>
            <Badge variant="outline">jami 15 645</Badge>
          </CardHeader>
          <CardContent className="px-0">
            <div className="max-h-[440px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-card">
                  <tr className="border-y bg-muted/30 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-2 font-medium">#</th>
                    <th className="px-4 py-2 font-medium">Do'kon</th>
                    <th className="px-4 py-2 text-right font-medium">Daromad</th>
                    <th className="px-4 py-2 text-right font-medium">% Δ</th>
                    <th className="px-4 py-2 text-right font-medium">Bozor %</th>
                  </tr>
                </thead>
                <tbody>
                  {top100.map((s) => {
                    const positive = s.deltaPercent >= 0;
                    return (
                      <tr key={s.rank} className="border-b last:border-0 hover:bg-accent/30">
                        <td className="px-4 py-2 font-semibold tabular-nums text-muted-foreground">
                          {s.rank}.
                        </td>
                        <td className="px-4 py-2">
                          <a className="font-medium text-primary hover:underline">{s.name}</a>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <HeatmapCell
                            value={s.revenue}
                            max={maxRevenue}
                            display={formatSumShort(s.revenue)}
                            tone="sky"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                              positive
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                            )}
                          >
                            {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(s.deltaPercent)}%
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums font-medium">{s.marketShare}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Kategoriyalar daromad bo'yicha
          </CardTitle>
          <CardDescription>Treemap — har bir blok hajmi kategoriya daromadini ifodalaydi</CardDescription>
        </CardHeader>
        <CardContent>
          <TreemapChart data={treemap} height={400} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ScatterChart className="h-4 w-4" />
              Assortiment vs Raqobat
            </CardTitle>
            <CardDescription>
              Bubble hajmi = daromad · pastki-o'ng burchak = qiziqarli nishlar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BubbleChart data={bubbles} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Daromad: joriy davr vs oldingi 30 kun
            </CardTitle>
            <CardDescription>Kunlik solishtirma — dinamika tendentsiyasi</CardDescription>
          </CardHeader>
          <CardContent>
            <DualPeriodBars data={dualPeriod} height={320} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
