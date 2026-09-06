import Image from "next/image";
import { AlertTriangle, CheckCircle2, Clock, Download, FileWarning, MapPin, PackageX } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { LOST_PRODUCTS } from "@/data/lost-products";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS = {
  investigating: { label: "Tekshiruvda", variant: "warning" as const, icon: Clock },
  compensated: { label: "Qoplandi", variant: "success" as const, icon: CheckCircle2 },
  rejected: { label: "Rad etilgan", variant: "destructive" as const, icon: FileWarning },
  pending: { label: "Yangi", variant: "info" as const, icon: AlertTriangle },
};

export default function LostProductsPage() {
  const totalLoss = LOST_PRODUCTS.reduce((acc, p) => acc + p.estimatedLoss, 0);
  const totalUnits = LOST_PRODUCTS.reduce((acc, p) => acc + p.lostUnits, 0);
  const compensated = LOST_PRODUCTS.filter((p) => p.status === "compensated").length;
  const pending = LOST_PRODUCTS.filter((p) => p.status === "pending" || p.status === "investigating").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yo'qolgan mahsulotlar"
        description="Omborga kelmagan yoki yo'qolgan mahsulotlar — Uzumdan kompensatsiya so'rash uchun rasmiy hisobot."
        actions={
          <Button size="sm">
            <Download className="h-4 w-4" />
            Uzum uchun hisobot
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card className="border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-card p-4">
          <div className="flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <PackageX className="h-4 w-4" />
            <span className="uppercase tracking-wider">Yo'qotish summasi</span>
          </div>
          <div className="mt-2 text-2xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {formatSumShort(totalLoss)}
          </div>
          <div className="text-xs text-muted-foreground">jami 30 kunda</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Yo'qolgan donalar
          </div>
          <div className="mt-1 text-2xl font-bold tabular-nums">{formatNumber(totalUnits)}</div>
          <div className="text-xs text-muted-foreground">birlik</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Qoplangan holatlar
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {compensated}
          </div>
          <div className="text-xs text-muted-foreground">muvaffaqiyatli</div>
        </Card>
        <Card className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Kutilayotgan
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{pending}</div>
          <div className="text-xs text-muted-foreground">javob</div>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aniqlangan yo'qotishlar</CardTitle>
          <CardDescription>
            Har 4 soatda monitoring boti omborni tekshiradi va farqlarni qayd etadi
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {LOST_PRODUCTS.map((p) => {
            const status = STATUS[p.status];
            const lossPercent = (p.lostUnits / p.expectedUnits) * 100;
            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-xl border p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center"
              >
                <Image
                  src={p.productImage}
                  alt={p.productTitle}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-lg border object-cover"
                  unoptimized
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{p.productTitle}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-mono">{p.sku}</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.warehouse}
                        </span>
                        <span>
                          {new Date(p.detectedAt).toLocaleDateString("uz-UZ", {
                            day: "2-digit",
                            month: "short",
                          })}{" "}
                          aniqlangan
                        </span>
                      </div>
                    </div>
                    <Badge variant={status.variant} className="gap-1 shrink-0">
                      <status.icon className="h-3 w-3" />
                      {status.label}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <div className="text-muted-foreground">Kutilgan</div>
                      <div className="font-semibold tabular-nums">{p.expectedUnits} dona</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Kelgan</div>
                      <div className="font-semibold tabular-nums">{p.receivedUnits} dona</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Yo'qolgan</div>
                      <div
                        className={cn(
                          "font-semibold tabular-nums text-rose-600 dark:text-rose-400"
                        )}
                      >
                        −{p.lostUnits} ({lossPercent.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/40 p-3 text-right sm:min-w-[160px]">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Yo'qotish summasi
                  </div>
                  <div className="text-lg font-bold tabular-nums text-rose-600 dark:text-rose-400">
                    {formatSum(p.estimatedLoss)}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
