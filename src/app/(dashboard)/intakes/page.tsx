"use client";

import * as React from "react";
import Link from "next/link";
import { PackagePlus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ApiError, deleteIntake, fetchIntakes } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import type { IntakeRow } from "@/lib/types";

export default function IntakesPage() {
  const [rows, setRows] = React.useState<IntakeRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchIntakes());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kirimlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const onDelete = async (row: IntakeRow) => {
    setRemoving(row.id);
    try {
      await deleteIntake(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success("Kirim o'chirildi — hisob-kitob qayta hisoblandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirib bo'lmadi");
    } finally {
      setRemoving(null);
    }
  };

  const totals = React.useMemo(
    () => ({
      count: rows.length,
      quantity: rows.reduce((sum, r) => sum + r.quantity, 0),
      cost: rows.reduce((sum, r) => sum + r.totalCost, 0),
      remaining: rows.reduce((sum, r) => sum + r.remainingQuantity, 0),
    }),
    [rows]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kirimlar"
        description="Har bir tovar partiyasi: qachon, nechta va qanchadan keldi. FIFO shu partiyalardan eng eskisidan boshlab hisoblaydi."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Yangilash
            </Button>
            <Button size="sm" asChild>
              <Link href="/warehouse">
                <PackagePlus className="h-3.5 w-3.5" /> Yangi kirim
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="Partiyalar" value={`${formatNumber(totals.count)} ta`} />
        <Tile label="Jami kelgan" value={`${formatNumber(totals.quantity)} dona`} />
        <Tile label="Jami sarflangan" value={formatSum(totals.cost)} />
        <Tile label="Sotilmagan qoldiq" value={`${formatNumber(totals.remaining)} dona`} />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {loading && rows.length === 0 ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={PackagePlus}
          title="Hali kirim kiritilmagan"
          description="Ombor sahifasida tovarni topib, 'Kirim' tugmasi orqali nechtadan va qanchadan kelganini yozing."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Sana</th>
                <th className="px-4 py-3 text-left font-medium">Tovar</th>
                <th className="px-3 py-3 text-right font-medium">Keldi</th>
                <th className="px-3 py-3 text-right font-medium">Tan narx</th>
                <th className="px-3 py-3 text-right font-medium">Jami</th>
                <th className="px-3 py-3 text-right font-medium">Sotildi / qoldi</th>
                <th className="px-4 py-3 text-left font-medium">Yetkazib beruvchi</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                    {row.receivedAt.slice(0, 10)}
                  </td>
                  <td className="max-w-[320px] px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.image}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-md border object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-9 w-9 shrink-0 rounded-md border bg-muted" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium">{row.title}</div>
                        <div className="truncate text-xs text-muted-foreground">
                          {row.skuCode ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatNumber(row.quantity)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {formatSum(row.costPrice)}
                  </td>
                  <td className="px-3 py-3 text-right font-medium tabular-nums">
                    {formatSum(row.totalCost)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {row.remainingQuantity === 0 ? (
                      <Badge variant="secondary">tugagan</Badge>
                    ) : (
                      <>
                        {formatNumber(row.soldQuantity)} / {formatNumber(row.remainingQuantity)}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    <div className="truncate">{row.supplier ?? "—"}</div>
                    {row.reference && (
                      <div className="truncate text-xs">{row.reference}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onDelete(row)}
                      disabled={removing === row.id}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-lg font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
