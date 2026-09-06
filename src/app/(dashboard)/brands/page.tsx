import Image from "next/image";
import { ArrowDown, ArrowUp, Award, Crown, Globe, Star } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/page-header";
import { BRANDS_DATA } from "@/data/brands";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function BrandsPage() {
  const sorted = [...BRANDS_DATA].sort((a, b) => b.revenue30d - a.revenue30d);
  const top = sorted.slice(0, 3);
  const totalRevenue = sorted.reduce((acc, b) => acc + b.revenue30d, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Brendlar"
        description="Bozordagi top brendlar, ularning sotuvchilari, daromadi va bozor ulushi."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {top.map((brand, i) => (
          <Card
            key={brand.id}
            className={cn(
              "relative overflow-hidden p-5",
              i === 0 && "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card"
            )}
          >
            {i === 0 && (
              <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <Crown className="h-4 w-4" />
              </div>
            )}
            <div className="flex items-start gap-3">
              <Image src={brand.logo} alt={brand.name} width={48} height={48} className="rounded-lg border bg-white" unoptimized />
              <div className="flex-1">
                <div className="text-lg font-bold">{brand.name}</div>
                <div className="text-xs text-muted-foreground">{brand.country}</div>
              </div>
              <Badge variant="default">#{i + 1}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="text-muted-foreground">Daromad</div>
                <div className="font-semibold tabular-nums">{formatSumShort(brand.revenue30d)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Bozor ulushi</div>
                <div className="font-semibold tabular-nums">{brand.marketShare}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Mahsulot</div>
                <div className="font-semibold tabular-nums">{formatNumber(brand.productsCount)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sotuvchilar</div>
                <div className="font-semibold tabular-nums">{brand.sellersCount}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Barcha brendlar reytingi
          </CardTitle>
          <CardDescription>
            Daromad va bozor ulushi bo'yicha · {formatSumShort(totalRevenue)} jami daromad
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Brend</th>
                  <th className="px-6 py-3 font-medium">Kategoriya</th>
                  <th className="px-6 py-3 text-right font-medium">Mahsulot</th>
                  <th className="px-6 py-3 text-right font-medium">Sotuvchilar</th>
                  <th className="px-6 py-3 text-right font-medium">O'rt. narx</th>
                  <th className="px-6 py-3 text-right font-medium">Daromad (30k)</th>
                  <th className="px-6 py-3 text-right font-medium">O'sish</th>
                  <th className="px-6 py-3 font-medium">Bozor ulushi</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((b, idx) => {
                  const positive = b.growthPercent >= 0;
                  return (
                    <tr key={b.id} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="px-6 py-3 font-semibold tabular-nums text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Image src={b.logo} alt={b.name} width={32} height={32} className="rounded-md border bg-white" unoptimized />
                          <div>
                            <div className="flex items-center gap-1.5 font-semibold">
                              {b.name}
                              <span className="flex items-center gap-0.5 text-xs font-normal text-muted-foreground">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {b.rating}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Globe className="h-3 w-3" />
                              {b.country}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">{b.category}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{formatNumber(b.productsCount)}</td>
                      <td className="px-6 py-3 text-right tabular-nums">{b.sellersCount}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {formatSum(b.averagePrice)}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold tabular-nums">
                        {formatSumShort(b.revenue30d)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold",
                            positive
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(b.growthPercent)}%
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={b.marketShare * 10} className="h-1.5 w-16" indicatorClassName="bg-gradient-to-r from-primary to-info" />
                          <span className="font-medium tabular-nums">{b.marketShare}%</span>
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
