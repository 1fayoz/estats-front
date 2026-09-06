import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Star,
  Package2,
  Eye,
  TrendingUp,
  Search as SearchIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { SalesStockChart } from "@/components/charts/sales-stock-chart";
import { CommissionCalculator } from "@/features/products/components/commission-calculator";
import { SkuVariants } from "@/features/products/components/sku-variants";
import { ProductCharacteristics } from "@/features/products/components/characteristics";
import { KPIStripItem } from "@/components/dashboard/kpi-strip-item";
import { getSalesStockSeries, getKpiSparkline } from "@/data/market";
import { PRODUCTS, getProductById } from "@/data/products";
import {
  formatNumber,
  formatPercent,
  formatSum,
  formatSumShort,
} from "@/lib/format";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  if (!product) notFound();

  const positive = product.growthPercent >= 0;
  const totalRevenue = product.history.reduce((acc, p) => acc + p.revenue, 0);
  const peakDay = product.history.reduce(
    (max, p) => (p.revenue > max.revenue ? p : max),
    product.history[0]
  );
  const salesStock = getSalesStockSeries();
  const detectedDate = new Date();
  detectedDate.setMonth(detectedDate.getMonth() - 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/products"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Mahsulotlar ro'yxatiga
        </Link>
        <Badge variant="outline" className="font-mono">{product.sku}</Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-square w-full bg-muted">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="280px"
              unoptimized
            />
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary">{product.brand}</Badge>
              <span>·</span>
              <span>{product.categoryName}</span>
            </div>
            <h1 className="text-lg font-bold leading-tight">{product.title}</h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {formatNumber(product.reviews)} sharh
              </span>
            </div>
            <Separator />
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums">{formatSum(product.price)}</span>
              {product.oldPrice && (
                <span className="text-sm text-muted-foreground line-through tabular-nums">
                  {formatSum(product.oldPrice)}
                </span>
              )}
            </div>
            {product.oldPrice && (
              <Badge variant="destructive">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}% chegirma
              </Badge>
            )}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Package2 className="h-3.5 w-3.5" /> Qoldiq
                </span>
                <span className="font-medium tabular-nums">{product.stock} dona</span>
              </div>
              <Progress
                value={Math.min(100, (product.stock / 250) * 100)}
                indicatorClassName={cn(
                  product.stock === 0
                    ? "bg-destructive"
                    : product.stock < 30
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                )}
              />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <KPIStripItem
              label="Karta aniqlangan"
              value={detectedDate.toLocaleDateString("uz-UZ", { day: "2-digit", month: "short", year: "2-digit" })}
            />
            <KPIStripItem
              label="Sutkalik o'rtacha sotuv"
              value={(product.sold30d / 30).toFixed(1)}
              delta={-5.4}
              spark={getKpiSparkline(11)}
            />
            <KPIStripItem
              label="Sutkalik o'rtacha qoldiq"
              value={formatNumber(Math.round(product.stock * 12))}
              delta={-45.5}
              spark={getKpiSparkline(12)}
            />
            <KPIStripItem
              label="Aylanma, kun"
              value={String(Math.round(product.stock / Math.max(1, product.sold30d / 30)))}
              delta={-41.4}
              spark={getKpiSparkline(13)}
            />
            <KPIStripItem
              label="Jami buyurtma"
              value={formatNumber(product.sold30d * 4)}
              delta={-15}
              spark={getKpiSparkline(14)}
            />
            <KPIStripItem
              label="Sharhlar"
              value={formatNumber(product.reviews)}
              delta={-20.4}
              spark={getKpiSparkline(15)}
            />
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>30 kunlik daromad</CardTitle>
                <CardDescription>
                  Eng yuqori kun: {new Date(peakDay.date).toLocaleDateString("uz-UZ")} —{" "}
                  <span className="font-medium text-foreground">{formatSumShort(peakDay.revenue)}</span>
                </CardDescription>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-sm font-semibold",
                  positive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                )}
              >
                {positive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                {Math.abs(product.growthPercent).toFixed(1)}%
              </div>
            </CardHeader>
            <CardContent>
              <RevenueChart data={product.history} height={260} />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <MiniStat
              icon={SearchIcon}
              label="Qidiruvda pozitsiya"
              value={`#${product.searchPosition}`}
              hint="O'rtacha so'rovlar bo'yicha"
            />
            <MiniStat
              icon={Eye}
              label="Jami ko'rishlar (30k)"
              value={formatNumber(product.history.reduce((acc, p) => acc + (p.visits || 0), 0))}
              hint="Mahsulot kartochkasi"
            />
            <MiniStat
              icon={TrendingUp}
              label="O'rtacha kunlik daromad"
              value={formatSumShort(totalRevenue / 30)}
              hint="Oxirgi 30 kun"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sotuv va qoldiq dinamikasi</CardTitle>
          <CardDescription>Kunlik sotuv barlari va qolgan zaxira chizig'i</CardDescription>
        </CardHeader>
        <CardContent>
          <SalesStockChart data={salesStock} height={300} />
        </CardContent>
      </Card>

      <SkuVariants product={product} />

      <ProductCharacteristics product={product} />

      <CommissionCalculator product={product} />
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof SearchIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-lg font-bold tabular-nums">{value}</div>
          {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
        </div>
      </div>
    </Card>
  );
}
