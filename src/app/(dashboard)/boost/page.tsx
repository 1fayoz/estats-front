import Image from "next/image";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Ban,
  Download,
  MousePointerClick,
  Rocket,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { BOOST_CAMPAIGNS, NEGATIVE_KEYWORDS } from "@/data/boost";
import { formatNumber, formatPercent, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS = {
  active: { label: "Faol", variant: "success" as const },
  paused: { label: "Pauza", variant: "secondary" as const },
  ended: { label: "Tugagan", variant: "outline" as const },
};

export default function BoostPage() {
  const totalSpend = BOOST_CAMPAIGNS.reduce((a, b) => a + b.spend, 0);
  const totalRevenue = BOOST_CAMPAIGNS.reduce((a, b) => a + b.revenue, 0);
  const totalImpr = BOOST_CAMPAIGNS.reduce((a, b) => a + b.impressions, 0);
  const totalClicks = BOOST_CAMPAIGNS.reduce((a, b) => a + b.clicks, 0);
  const avgCtr = totalImpr > 0 ? (totalClicks / totalImpr) * 100 : 0;
  const avgDrr = totalRevenue > 0 ? (totalSpend / totalRevenue) * 100 : 0;
  const roas = totalSpend > 0 ? totalRevenue / totalSpend : 0;
  const totalSaved = NEGATIVE_KEYWORDS.reduce((a, b) => a + b.savedSpend, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boost va reklama"
        description="Boost TOP kampaniyalari, har bir karta bo'yicha DRR va minus so'zlar boshqaruvi."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Eksport
            </Button>
            <Button size="sm">
              <Rocket className="h-4 w-4" /> Yangi kampaniya
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Reklama xarajati" value={formatSumShort(totalSpend)} icon={Target} />
        <StatCard label="Daromad" value={formatSumShort(totalRevenue)} icon={TrendingUp} tone="success" />
        <StatCard
          label="ROAS"
          value={`${roas.toFixed(2)}×`}
          icon={Activity}
          tone={roas >= 3 ? "success" : "warning"}
        />
        <StatCard label="O'rt. DRR" value={`${avgDrr.toFixed(2)}%`} icon={TrendingDown} tone="info" />
        <StatCard label="O'rt. CTR" value={`${avgCtr.toFixed(2)}%`} icon={MousePointerClick} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-primary" />
            Boost TOP kampaniyalari
          </CardTitle>
          <CardDescription>
            Har bir karta bo'yicha pozitsiya, sarflangan summa va DRR (Reklama xarajati ulushi)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Mahsulot</th>
                  <th className="px-6 py-3 font-medium">Kalit so'z</th>
                  <th className="px-6 py-3 text-right font-medium">Pozitsiya</th>
                  <th className="px-6 py-3 text-right font-medium">Stavka</th>
                  <th className="px-6 py-3 text-right font-medium">Ko'rishlar</th>
                  <th className="px-6 py-3 text-right font-medium">CTR</th>
                  <th className="px-6 py-3 text-right font-medium">Buyurtma</th>
                  <th className="px-6 py-3 text-right font-medium">Xarajat</th>
                  <th className="px-6 py-3 text-right font-medium">Daromad</th>
                  <th className="px-6 py-3 text-right font-medium">DRR</th>
                  <th className="px-6 py-3 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody>
                {BOOST_CAMPAIGNS.map((c) => {
                  const drrOk = c.drr < 25;
                  return (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Image src={c.productImage} alt={c.productTitle} width={36} height={36} className="rounded-md border" unoptimized />
                          <div className="max-w-[180px]">
                            <div className="truncate text-sm font-medium">{c.productTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs">{c.keyword}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-2 py-0.5 font-semibold tabular-nums text-primary">
                          #{c.position}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">{formatSum(c.bid)}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{formatNumber(c.impressions)}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{c.ctr}%</td>
                      <td className="px-6 py-3 text-right tabular-nums">{c.conversions}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-rose-600 dark:text-rose-400">
                        −{formatSumShort(c.spend)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatSumShort(c.revenue)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums",
                            drrOk
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          )}
                        >
                          {c.drr}%
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={STATUS[c.status].variant}>{STATUS[c.status].label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-rose-500" />
              Minus so'zlar
            </CardTitle>
            <CardDescription>
              Bu so'zlar uchun reklamangiz ko'rsatilmaydi · jami{" "}
              <span className="font-semibold text-foreground">{formatSumShort(totalSaved)}</span>{" "}
              tejaldi
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> CSV
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {NEGATIVE_KEYWORDS.map((k) => (
              <div
                key={k.id}
                className="group flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5 text-sm transition-colors hover:border-destructive/40 hover:bg-destructive/5"
                title={`${formatNumber(k.blockedImpressions)} ta ko'rinish bloklandi · ${formatSum(k.savedSpend)} tejaldi`}
              >
                <Ban className="h-3 w-3 text-rose-500" />
                <span className="font-mono">{k.word}</span>
                <span className="text-xs text-muted-foreground">
                  ·{formatNumber(k.blockedImpressions)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: typeof Activity;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const tones = {
    primary: "from-primary/10 text-primary",
    success: "from-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "from-amber-500/10 text-amber-600 dark:text-amber-400",
    info: "from-sky-500/10 text-sky-600 dark:text-sky-400",
  };
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 text-xl font-bold tabular-nums">{value}</div>
        </div>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br to-card", tones[tone])}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}
