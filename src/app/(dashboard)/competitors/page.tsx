import Image from "next/image";
import { ArrowDown, ArrowUp, Crown, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { COMPETITORS } from "@/data/competitors";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function CompetitorsPage() {
  const sorted = [...COMPETITORS].sort((a, b) => b.revenue30d - a.revenue30d);
  const leader = sorted[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Raqobatchilar"
        description="Sizning nishingizdagi top do'konlar, ularning daromadi va o'sish dinamikasi."
      />

      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-info/5">
        <div className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
            <Crown className="h-7 w-7" />
          </div>
          <div className="flex-1">
            <Badge variant="warning" className="mb-2">#1 Bozor lideri</Badge>
            <h2 className="text-xl font-bold">{leader.store}</h2>
            <p className="text-sm text-muted-foreground">
              {leader.niche} · {formatNumber(leader.productsCount)} mahsulot · reyting {leader.rating}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <Stat label="30 kun daromad" value={formatSumShort(leader.revenue30d)} />
            <Stat label="Sotuvlar" value={formatNumber(leader.sales30d)} />
            <Stat label="O'sish" value={`+${leader.growthPercent}%`} positive />
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Raqobatchilar reytingi</CardTitle>
          <CardDescription>Daromad bo'yicha tartiblangan</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Do'kon</th>
                  <th className="px-6 py-3 font-medium">Mahsulotlar</th>
                  <th className="px-6 py-3 text-right font-medium">30 kun sotuv</th>
                  <th className="px-6 py-3 text-right font-medium">Daromad</th>
                  <th className="px-6 py-3 text-right font-medium">O'rt. narx</th>
                  <th className="px-6 py-3 text-right font-medium">O'sish</th>
                  <th className="px-6 py-3 font-medium">Reyting</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c, idx) => {
                  const positive = c.growthPercent >= 0;
                  return (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 transition-colors hover:bg-accent/30"
                    >
                      <td className="px-6 py-4 font-semibold text-muted-foreground tabular-nums">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={c.logo}
                            alt={c.store}
                            width={36}
                            height={36}
                            className="rounded-lg border bg-white"
                            unoptimized
                          />
                          <div>
                            <div className="font-semibold">{c.store}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.niche} · top: {c.topProduct}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 tabular-nums">{formatNumber(c.productsCount)}</td>
                      <td className="px-6 py-4 text-right tabular-nums">
                        {formatNumber(c.sales30d)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold tabular-nums">
                        {formatSumShort(c.revenue30d)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-muted-foreground">
                        {formatSum(c.averagePrice)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 rounded-md px-2 py-0.5 text-xs font-semibold",
                            positive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(c.growthPercent)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{c.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({formatNumber(c.reviews)})
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-lg font-bold tabular-nums",
          positive && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {value}
      </div>
    </div>
  );
}
