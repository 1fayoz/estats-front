"use client";

import * as React from "react";
import { AlertTriangle, Boxes, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductTable } from "@/features/warehouse/components/product-table";
import { IntakeDialog } from "@/features/warehouse/components/intake-dialog";
import { useWarehouseProducts } from "@/features/warehouse/store";
import { useActiveShop } from "@/stores/user-store";
import { formatNumber, formatSum } from "@/lib/format";
import type { WarehouseProduct } from "@/lib/types";

export default function WarehousePage() {
  const { items, error, isInitialLoading, isRefreshing, syncing, refresh, syncCatalog } =
    useWarehouseProducts();
  const shop = useActiveShop();
  const [query, setQuery] = React.useState("");
  const [intakeFor, setIntakeFor] = React.useState<WarehouseProduct | null>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      [item.title, item.skuCode, item.barcode, item.sellerSku, item.categoryName]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(q))
    );
  }, [items, query]);

  const totals = React.useMemo(
    () => ({
      goods: items.length,
      onHand: items.reduce((sum, i) => sum + i.stockQuantity, 0),
      stockValue: items.reduce((sum, i) => sum + i.stockValue, 0),
      withoutCost: items.filter((i) => !i.lastCost && !i.averageCost).length,
    }),
    [items]
  );

  const onSync = async () => {
    try {
      await syncCatalog();
      toast.success("Uzum katalogi yangilandi");
    } catch {
      toast.error("Sinxronizatsiya bajarilmadi");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ombor"
        description="Uzum katalogingiz va har bir tovarning tan narxi. Tovar kelganda 'Kirim' tugmasi orqali qo'shing."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={refresh} disabled={isRefreshing}>
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Yangilash
            </Button>
            <Button size="sm" onClick={onSync} disabled={syncing}>
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              Uzum'dan sinxronlash
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Tovarlar" value={formatNumber(totals.goods)} />
        <StatTile label="Ombordagi qoldiq" value={`${formatNumber(totals.onHand)} dona`} />
        <StatTile label="Zaxira qiymati" value={formatSum(totals.stockValue)} />
        <StatTile
          label="Tan narxsiz"
          value={`${formatNumber(totals.withoutCost)} ta`}
          hint={totals.withoutCost > 0 ? "kirim kiriting" : undefined}
        />
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Nom, SKU, barcode yoki kategoriya..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Qoldiq = keldi − sotildi. "Sotildi" esa faqat YUKLANGAN sotuvlardan
          chiqadi, shuning uchun qaysi davr yuklangani yonida turishi shart —
          aks holda qoldiq to'liq haqiqatdek ko'rinadi. */}
      {shop && !shop.salesSyncedFrom && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
          <div>
            <div className="font-medium">Sotuvlar hali yuklanmagan</div>
            <div className="text-muted-foreground">
              &quot;Sotildi&quot; va &quot;Qoldiq&quot; ustunlari bo&apos;sh ko&apos;rinadi.
              Foyda va zarar sahifasida &quot;Sotuvlarni yuklash&quot; tugmasini bosing.
            </div>
          </div>
        </div>
      )}
      {shop?.salesSyncedFrom && (
        <div className="rounded-lg border bg-muted/40 px-4 py-2.5 text-xs text-muted-foreground">
          &quot;Sotildi&quot; va &quot;Qoldiq&quot; ustunlari{" "}
          <span className="font-medium text-foreground">
            {shop.salesSyncedFrom} … {shop.salesSyncedTo}
          </span>{" "}
          oralig&apos;idagi yuklangan sotuvlarga asoslangan. Undan oldingi sotuvlar
          hisobga olinmagan — kerak bo&apos;lsa o&apos;sha davrni ham yuklang.
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isInitialLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <ProductTable items={filtered} onIntake={setIntakeFor} />
      )}

      <IntakeDialog
        product={intakeFor}
        onOpenChange={(open) => !open && setIntakeFor(null)}
        onSaved={refresh}
      />
    </div>
  );
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Boxes className="h-3.5 w-3.5" />
          {label}
        </div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
        {hint && <div className="text-xs text-amber-600 dark:text-amber-500">{hint}</div>}
      </CardContent>
    </Card>
  );
}
