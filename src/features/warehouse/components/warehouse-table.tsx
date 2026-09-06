"use client";

import * as React from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronDown,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { WarehouseItem } from "../types";
import { summarize, useCostStore, useWarehouseProducts } from "../store";

export function WarehouseTable() {
  const { data, error, isInitialLoading, refresh } = useWarehouseProducts();
  const batchesBySku = useCostStore((s) => s.batchesBySku);
  const [query, setQuery] = React.useState("");
  const [expanded, setExpanded] = React.useState<number | null>(null);

  const items = data?.items ?? [];

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.title, it.variant, it.sku, it.barcode, it.category]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [items, query]);

  const stats = React.useMemo(() => {
    let withCost = 0;
    let totalPurchase = 0;
    let inventoryValue = 0;
    let marginSum = 0;
    let marginCount = 0;
    for (const it of items) {
      const sum = summarize(batchesBySku[it.skuId] ?? []);
      if (sum.batches.length) withCost++;
      totalPurchase += sum.totalCostValue;
      if (sum.averageCost != null) {
        inventoryValue += sum.averageCost * it.marketplaceStock;
        if (it.price > 0) {
          marginSum += ((it.price - sum.averageCost) / it.price) * 100;
          marginCount++;
        }
      }
    }
    return {
      total: items.length,
      withCost,
      totalPurchase,
      inventoryValue,
      avgMargin: marginCount ? marginSum / marginCount : null,
    };
  }, [items, batchesBySku]);

  if (isInitialLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="text-sm font-medium">{error}</div>
          <Button variant="outline" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" /> Qayta urinish
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Boxes} label="Jami SKU" value={formatNumber(stats.total)} hint={`${stats.withCost} tasiga tan narx kiritilgan`} />
        <StatCard icon={Wallet} label="Ombor qiymati" value={formatSum(stats.inventoryValue)} hint="o'rtacha tan narx × qoldiq" />
        <StatCard icon={Package} label="Jami xarid" value={formatSum(stats.totalPurchase)} hint="barcha kirimlar summasi" />
        <StatCard
          icon={TrendingUp}
          label="O'rtacha margin"
          value={stats.avgMargin != null ? `${stats.avgMargin.toFixed(1)}%` : "—"}
          hint="narx va tan narx orasidagi"
        />
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Nom, SKU, barcode yoki kategoriya..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{filtered.length} ta ko'rsatilmoqda</span>
          </div>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Mahsulot topilmadi"
          description="Uzum do'koningizda mahsulot yo'q yoki qidiruvga mos kelmadi."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Mahsulot</th>
                  <th className="px-4 py-3 font-medium">SKU / Barcode</th>
                  <th className="px-4 py-3 text-right font-medium">Uzum narxi</th>
                  <th className="px-4 py-3 text-right font-medium">Qoldiq</th>
                  <th className="px-4 py-3 text-right font-medium">Tan narxi</th>
                  <th className="px-4 py-3 text-right font-medium">Margin</th>
                  <th className="px-4 py-3 text-right font-medium">Kirim</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <Row
                    key={item.skuId}
                    item={item}
                    expanded={expanded === item.skuId}
                    onToggle={() => setExpanded((cur) => (cur === item.skuId ? null : item.skuId))}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-4 w-4" /> {label}
        </div>
        <div className="mt-2 text-xl font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
      </CardContent>
    </Card>
  );
}

function Row({
  item,
  expanded,
  onToggle,
}: {
  item: WarehouseItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  const batches = useCostStore((s) => s.batchesBySku[item.skuId]);
  const sum = summarize(batches ?? []);
  const margin = sum.averageCost != null && item.price > 0 ? item.price - sum.averageCost : null;
  const marginPct = margin != null ? (margin / item.price) * 100 : null;

  return (
    <>
      <tr className={cn("border-b transition-colors hover:bg-muted/40", expanded && "bg-muted/30")}>
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            {item.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image}
                alt=""
                className="h-11 w-11 shrink-0 rounded-md border bg-muted object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
                }}
              />
            ) : (
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              <div className="truncate font-medium">{item.title}</div>
              <div className="truncate text-xs text-muted-foreground">
                {[item.variant, item.category].filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="font-mono text-xs">{item.sku ?? "—"}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{item.barcode ?? "—"}</div>
        </td>
        <td className="px-4 py-3 text-right font-medium">{formatSum(item.price)}</td>
        <td className="px-4 py-3 text-right">
          <span className={cn(item.marketplaceStock === 0 && "text-muted-foreground")}>
            {formatNumber(item.marketplaceStock)}
          </span>
          <div className="text-[11px] text-muted-foreground">sotilgan {formatNumber(item.sold)}</div>
        </td>
        <td className="px-4 py-3 text-right">
          {sum.averageCost != null ? (
            <>
              <div className="font-medium">{formatSum(sum.averageCost)}</div>
              <div className="text-[11px] text-muted-foreground">{sum.intakeQty} dona kirim</div>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">kiritilmagan</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          {marginPct != null ? (
            <Badge variant={marginPct >= 0 ? "success" : "destructive"}>{marginPct.toFixed(1)}%</Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <Button variant={expanded ? "default" : "outline"} size="sm" onClick={onToggle}>
            <Plus className="h-3.5 w-3.5" />
            Kirim
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          </Button>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b bg-muted/20">
          <td colSpan={7} className="px-4 py-4">
            <IntakePanel item={item} />
          </td>
        </tr>
      )}
    </>
  );
}

function IntakePanel({ item }: { item: WarehouseItem }) {
  const batches = useCostStore((s) => s.batchesBySku[item.skuId]);
  const addBatch = useCostStore((s) => s.addBatch);
  const removeBatch = useCostStore((s) => s.removeBatch);
  const sum = summarize(batches ?? []);

  const [qty, setQty] = React.useState("");
  const [cost, setCost] = React.useState("");
  const [note, setNote] = React.useState("");

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(qty);
    const c = Number(cost);
    if (!Number.isFinite(q) || q <= 0) return toast.error("Miqdor musbat bo'lishi kerak");
    if (!Number.isFinite(c) || c < 0) return toast.error("Tan narxi noto'g'ri");
    addBatch(item.skuId, q, c, note.trim() || undefined);
    setQty("");
    setCost("");
    setNote("");
    toast.success(`Kirim qo'shildi: ${q} dona × ${formatSum(c)}`);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Yangi kirim (tovar keldi)
        </div>
        <form onSubmit={onAdd} className="space-y-3 rounded-lg border bg-card p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Miqdor (dona)</label>
              <Input
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="100"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Tan narxi (so'm)</label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="45000"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Izoh (ixtiyoriy)</label>
            <Input placeholder="Yetkazib beruvchi / partiya raqami" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" size="sm">
            <Plus className="h-3.5 w-3.5" /> Kirimni saqlash
          </Button>
          <p className="text-[11px] text-muted-foreground">
            Har bir kirim o'z tan narxi bilan alohida saqlanadi. Tovar bir xil qoladi — o'rtacha
            tan narx avtomatik qayta hisoblanadi.
          </p>
        </form>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Kirimlar tarixi ({sum.batches.length})
          </span>
          {sum.averageCost != null && (
            <span className="text-xs text-muted-foreground">
              O'rtacha: <span className="font-semibold text-foreground">{formatSum(sum.averageCost)}</span>
              {" · "}Oxirgi: {formatSum(sum.lastCost ?? 0)}
            </span>
          )}
        </div>
        {sum.batches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-xs text-muted-foreground">
            Hali kirim qo'shilmagan. Chapdagi formadan birinchi partiyani kiriting.
          </div>
        ) : (
          <div className="space-y-2">
            {[...sum.batches].reverse().map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm">
                <div>
                  <div className="font-medium">
                    {formatNumber(b.qty)} dona × {formatSum(b.costPrice)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(b.receivedAt).toLocaleDateString("uz-UZ")}
                    {b.note ? ` · ${b.note}` : ""} · jami {formatSum(b.qty * b.costPrice)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeBatch(item.skuId, b.id)}
                  aria-label="O'chirish"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
