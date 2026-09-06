import Image from "next/image";
import { ArrowDown, ArrowUp, Building2, CheckCircle2, Crown, MapPin, Star, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { HeatmapCell } from "@/components/dashboard/heatmap-cell";
import { SELLERS } from "@/data/sellers";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAYMENT_BADGE = {
  verified: { label: "Tasdiqlangan", variant: "success" as const, icon: CheckCircle2 },
  premium: { label: "Premium", variant: "warning" as const, icon: Crown },
  pending: { label: "Tekshiruvda", variant: "secondary" as const, icon: ShieldCheck },
};

export default function SellersPage() {
  const sorted = [...SELLERS].sort((a, b) => b.revenue30d - a.revenue30d);
  const totalRevenue = sorted.reduce((acc, s) => acc + s.revenue30d, 0);
  const totalSales = sorted.reduce((acc, s) => acc + s.sales30d, 0);
  const maxRevenue30 = Math.max(...sorted.map((s) => s.revenue30d));
  const maxRevenue60 = Math.max(...sorted.map((s) => s.revenue60d));
  const maxSales = Math.max(...sorted.map((s) => s.sales30d));
  const maxProducts = Math.max(...sorted.map((s) => s.productsCount));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sotuvchilar"
        description="Uzum platformasidagi do'konlar, ularning yuridik shaxsi va sotuv hajmi."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Jami do'konlar
          </div>
          <div className="mt-1 text-2xl font-bold">{SELLERS.length}</div>
          <div className="text-xs text-muted-foreground">analitikada</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Yalpi daromad
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{formatSumShort(totalRevenue)}</div>
          <div className="text-xs text-muted-foreground">oxirgi 30 kun</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Jami sotuv
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{formatNumber(totalSales)}</div>
          <div className="text-xs text-muted-foreground">buyurtma · 30 kun</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Premium do'konlar
          </div>
          <div className="mt-1 text-2xl font-bold">
            {SELLERS.filter((s) => s.paymentStatus === "premium").length}
          </div>
          <div className="text-xs text-muted-foreground">verifikatsiyalangan</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Do'konlar reytingi</CardTitle>
          <CardDescription>
            Daromad bo'yicha tartiblangan · 30/60 kunlik daromad va o'sish dinamikasi
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-6 py-3 font-medium">Do'kon va yuridik shaxs</th>
                  <th className="px-6 py-3 font-medium">Shahar</th>
                  <th className="px-6 py-3 text-right font-medium">SKU</th>
                  <th className="px-6 py-3 text-right font-medium">Sotuv (30k)</th>
                  <th className="px-6 py-3 text-right font-medium">Daromad (30k)</th>
                  <th className="px-6 py-3 text-right font-medium">Daromad (60k)</th>
                  <th className="px-6 py-3 text-right font-medium">O'sish</th>
                  <th className="px-6 py-3 text-right font-medium">Bozor ulushi</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, idx) => {
                  const positive = s.growthPercent >= 0;
                  const payment = PAYMENT_BADGE[s.paymentStatus];
                  return (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-accent/30">
                      <td className="px-6 py-3 font-semibold tabular-nums text-muted-foreground">
                        {idx + 1}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Image src={s.logo} alt={s.store} width={36} height={36} className="rounded-lg border bg-white" unoptimized />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-semibold">
                              {s.store}
                              <div className="flex items-center gap-0.5 text-xs font-normal">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {s.rating}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">{s.legalEntity}</div>
                            <div className="font-mono text-[10px] text-muted-foreground">INN {s.inn}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        <div className="flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {s.city}
                        </div>
                        <div className="text-[10px]">{s.joinedYear} dan</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <HeatmapCell
                          value={s.productsCount}
                          max={maxProducts}
                          display={formatNumber(s.productsCount)}
                          tone="sky"
                        />
                        <div className="mt-0.5 text-[10px] text-muted-foreground text-right pr-2">{s.activeProducts} faol</div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <HeatmapCell
                          value={s.sales30d}
                          max={maxSales}
                          display={formatNumber(s.sales30d)}
                          tone="emerald"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <HeatmapCell
                          value={s.revenue30d}
                          max={maxRevenue30}
                          display={formatSumShort(s.revenue30d)}
                          tone="rose"
                        />
                      </td>
                      <td className="px-6 py-3 text-right">
                        <HeatmapCell
                          value={s.revenue60d}
                          max={maxRevenue60}
                          display={formatSumShort(s.revenue60d)}
                          tone="primary"
                        />
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
                          {Math.abs(s.growthPercent)}%
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">{s.marketShare}%</td>
                      <td className="px-6 py-3">
                        <Badge variant={payment.variant} className="gap-1">
                          <payment.icon className="h-3 w-3" />
                          {payment.label}
                        </Badge>
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
