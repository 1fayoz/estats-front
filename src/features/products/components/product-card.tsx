"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUp, Minus, Package2, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/charts/sparkline";
import { formatNumber, formatPercent, formatSum, formatSumShort } from "@/lib/format";
import { calculateCommission } from "@/lib/commission";
import type { Product } from "@/types/domain";
import { cn } from "@/lib/utils";

const STATUS: Record<Product["status"], { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  active: { label: "Faol", variant: "success" },
  low_stock: { label: "Kam qoldiq", variant: "warning" },
  out_of_stock: { label: "Tugagan", variant: "destructive" },
  paused: { label: "Pauza", variant: "secondary" },
};

export function ProductCard({ product }: { product: Product }) {
  const commission = calculateCommission({
    price: product.price,
    cost: product.cost,
    category: product.category,
    units: 1,
  });

  const TrendIcon =
    product.trend === "up" ? ArrowUp : product.trend === "down" ? ArrowDown : Minus;
  const trendColor =
    product.trend === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : product.trend === "down"
      ? "text-rose-600 dark:text-rose-400"
      : "text-muted-foreground";

  const status = STATUS[product.status];

  return (
    <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/products/${product.id}`} className="flex">
        <div className="relative h-32 w-32 shrink-0 overflow-hidden bg-muted">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="128px"
            unoptimized
          />
          <Badge variant={status.variant} className="absolute left-2 top-2 backdrop-blur">
            {status.label}
          </Badge>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{product.brand}</span>
                <span>·</span>
                <span className="truncate">{product.categoryName}</span>
                <span>·</span>
                <span className="font-mono">{product.sku}</span>
              </div>
              <h3 className="mt-1 line-clamp-1 text-sm font-semibold">{product.title}</h3>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{product.rating}</span>
              <span className="text-muted-foreground">({formatNumber(product.reviews)})</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
            <Metric label="Narx" value={formatSum(product.price)} accent />
            <Metric
              label="Sof daromad / dona"
              value={formatSum(commission.netRevenue)}
              hint={`komissiya ${commission.categoryCommissionPercent}%`}
            />
            <Metric label="30 kun sotuv" value={formatNumber(product.sold30d)} />
            <Metric label="30 kun daromad" value={formatSumShort(product.revenue30d)} />
            <div className="hidden md:block">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Dinamika
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className={cn("flex items-center text-xs font-semibold", trendColor)}>
                  <TrendIcon className="h-3 w-3" />
                  {Math.abs(product.growthPercent).toFixed(1)}%
                </span>
                <div className="h-7 flex-1">
                  <Sparkline data={product.history} dataKey="revenue" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Package2 className="h-3.5 w-3.5" />
              qoldiq: <span className="font-medium text-foreground">{product.stock}</span>
            </span>
            <span>konversiya: <span className="font-medium text-foreground">{product.conversionRate}%</span></span>
            <span>qidiruv: <span className="font-medium text-foreground">#{product.searchPosition}</span></span>
            <span className="ml-auto rounded-md bg-muted px-1.5 py-0.5 font-medium text-foreground">
              foyda {formatPercent(commission.marginPercent)}
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 text-sm font-semibold tabular-nums", accent && "text-primary")}>
        {value}
      </div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
