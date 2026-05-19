import {
  Activity,
  ArrowUpRight,
  Calendar,
  DollarSign,
  Download,
  Package,
  Percent,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/dashboard/page-header";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { CategoryDonut } from "@/components/charts/category-donut";

import {
  getOverviewMetrics,
  getRevenueSeries,
  getCategoryDistribution,
  getTopProducts,
  getGrowingProducts,
} from "@/data/overview";
import { ORDERS } from "@/data/orders";
import { formatSum, formatSumShort, formatNumber, formatPercent } from "@/lib/format";
import Image from "next/image";
import Link from "next/link";

const STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "info" | "destructive" | "secondary"> = {
  delivered: "success",
  shipping: "info",
  processing: "warning",
  returned: "destructive",
  cancelled: "destructive",
};

const STATUS_LABEL: Record<string, string> = {
  delivered: "Yetkazildi",
  shipping: "Yo'lda",
  processing: "Tayyorlanmoqda",
  returned: "Qaytarildi",
  cancelled: "Bekor qilindi",
};

export default function DashboardPage() {
  const metrics = getOverviewMetrics();
  const series = getRevenueSeries();
  const categoryDist = getCategoryDistribution();
  const topProducts = getTopProducts(5);
  const growing = getGrowingProducts(5);
  const recentOrders = ORDERS.slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Umumiy ko'rinish"
        description="Oxirgi 30 kun bo'yicha do'koningizning to'liq holati."
        badge={
          <Badge variant="success" className="gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
            jonli
          </Badge>
        }
        actions={
          <>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4" />
              Oxirgi 30 kun
            </Button>
            <Button variant="default" size="sm">
              <Download className="h-4 w-4" />
              Hisobotni yuklash
            </Button>
          </>
        }
      />

      <AiInsights />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Jami daromad"
          value={formatSumShort(metrics.totalRevenue)}
          delta={metrics.growth}
          helper="Oxirgi 30 kun"
          icon={DollarSign}
          tone="primary"
          sparkData={series}
        />
        <KPICard
          label="Buyurtmalar"
          value={formatNumber(metrics.totalSales)}
          delta={+(metrics.growth * 0.8).toFixed(1)}
          helper={`${metrics.activeProducts} faol mahsulot`}
          icon={ShoppingBag}
          tone="success"
          sparkData={series}
        />
        <KPICard
          label="Konversiya"
          value={`${metrics.avgConversion}%`}
          delta={2.3}
          helper="Ko'rishdan buyurtmaga"
          icon={Activity}
          tone="info"
          sparkData={series}
        />
        <KPICard
          label="Reyting"
          value={metrics.avgRating.toFixed(2)}
          delta={0.4}
          helper={`${formatNumber(metrics.totalReviews)} sharh`}
          icon={Star}
          tone="warning"
          sparkData={series}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Daromad dinamikasi</CardTitle>
              <CardDescription>Kunlik daromad va sotuvlar</CardDescription>
            </div>
            <Tabs defaultValue="revenue">
              <TabsList className="h-8">
                <TabsTrigger value="revenue" className="text-xs">Daromad</TabsTrigger>
                <TabsTrigger value="sales" className="text-xs">Sotuvlar</TabsTrigger>
              </TabsList>
              <TabsContent value="revenue" />
              <TabsContent value="sales" />
            </Tabs>
          </CardHeader>
          <CardContent className="pt-4">
            <RevenueChart data={series} metric="revenue" height={300} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kategoriya bo'yicha</CardTitle>
            <CardDescription>Daromadning kategoriyalar kesimi</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonut data={categoryDist} />
            <div className="mt-3 space-y-2">
              {categoryDist.slice(0, 4).map((c, i) => (
                <div key={c.key} className="flex items-center gap-2 text-xs">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      background: ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"][i],
                    }}
                  />
                  <span className="truncate">{c.name}</span>
                  <span className="ml-auto font-medium tabular-nums">
                    {formatSumShort(c.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Eng ko'p sotilgan
              </CardTitle>
              <CardDescription>Daromad bo'yicha top 5 mahsulot</CardDescription>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              Barchasini ko'rish
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {topProducts.map((p, idx) => (
              <Link
                key={p.id}
                href={`/products/${p.id}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold tabular-nums text-muted-foreground">
                  {idx + 1}
                </div>
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={p.image} alt={p.title} fill className="object-cover" sizes="44px" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatNumber(p.sold30d)} ta sotildi
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold tabular-nums">{formatSumShort(p.revenue30d)}</div>
                  <div className="text-xs text-emerald-600 dark:text-emerald-400">
                    +{p.growthPercent.toFixed(1)}%
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Tez o'sayotgan mahsulotlar
            </CardTitle>
            <CardDescription>Sotuvi eng ko'p o'sgan 5 ta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {growing.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg p-2">
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={p.image} alt={p.title} fill className="object-cover" sizes="44px" unoptimized />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.categoryName}</div>
                </div>
                <Badge variant="success" className="font-semibold">
                  <TrendingUp className="h-3 w-3" />+{p.growthPercent.toFixed(1)}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Oxirgi buyurtmalar
            </CardTitle>
            <CardDescription>Real vaqtda yangi buyurtmalar</CardDescription>
          </div>
          <Badge variant="outline">{ORDERS.length} ta jami</Badge>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Buyurtma</th>
                  <th className="px-6 py-3 font-medium">Mijoz</th>
                  <th className="px-6 py-3 font-medium">Shahar</th>
                  <th className="px-6 py-3 text-right font-medium">Summa</th>
                  <th className="px-6 py-3 font-medium">Holat</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 transition-colors hover:bg-accent/40">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-muted">
                          <Image src={o.productImage} alt={o.product} fill className="object-cover" sizes="36px" unoptimized />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{o.product}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{o.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm">{o.customer}</td>
                    <td className="px-6 py-3 text-sm text-muted-foreground">{o.city}</td>
                    <td className="px-6 py-3 text-right font-medium tabular-nums">{formatSum(o.amount)}</td>
                    <td className="px-6 py-3">
                      <Badge variant={STATUS_VARIANT[o.status]}>{STATUS_LABEL[o.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-primary" />
              Uzum komissiyasi haqida
            </CardTitle>
            <CardDescription>
              Sizning kategoriyalaringizdan Uzum oladigan o'rtacha foiz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryDist.slice(0, 5).map((c, i) => {
              const commission = [14, 22, 20, 18, 19][i] ?? 18;
              return (
                <div key={c.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="tabular-nums">
                      <span className="text-muted-foreground">komissiya </span>
                      <span className="font-semibold">{commission}%</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-info"
                      style={{ width: `${commission * 3}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 via-card to-info/5">
          <CardHeader>
            <CardTitle>Eslatmalar</CardTitle>
            <CardDescription>Diqqat talab qiluvchi narsalar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2 rounded-lg border bg-card p-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-500" />
              <div>
                <div className="font-medium">Tugab qolayotgan mahsulotlar</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {metrics.lowStock} ta mahsulot to'ldirilishi kerak
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border bg-card p-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
              <div>
                <div className="font-medium">SEO yangilanishi</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  3 ta kalit so'z bo'yicha pozitsiyangiz pasaydi
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-lg border bg-card p-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
              <div>
                <div className="font-medium">Yangi sharhlar</div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  12 ta sharhga javob berilmagan
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
