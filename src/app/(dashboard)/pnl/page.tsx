"use client";

import * as React from "react";
import { AlertTriangle, Download } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "@/features/pnl/components/summary-cards";
import { PnlChart } from "@/features/pnl/components/pnl-chart";
import { PnlTable } from "@/features/pnl/components/pnl-table";
import { usePnlReport, usePnlStore } from "@/features/pnl/store";
import { downloadPnlCsv } from "@/features/pnl/export";
import { useAutoRefresh } from "@/lib/use-auto-refresh";

export default function PnlPage() {
  const range = usePnlStore((s) => s.range);
  const setRange = usePnlStore((s) => s.setRange);
  const allProducts = usePnlStore((s) => s.allProducts);
  const setAllProducts = usePnlStore((s) => s.setAllProducts);
  const { data, error, isInitialLoading, refresh } = usePnlReport();
  useAutoRefresh(refresh);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Foyda va zarar"
        description="Har bir tovar bo'yicha: qanchadan keldi, nechtasi sotildi, tan narxi (FIFO) qancha va oxirida qancha foyda yoki zarar qoldi."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => data && downloadPnlCsv(data)}
              disabled={!data?.rows.length}
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateRangePicker value={range} onChange={setRange} />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--primary)]"
            checked={allProducts}
            onChange={(e) => setAllProducts(e.target.checked)}
          />
          Harakatsiz tovarlarni ham ko'rsatish
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isInitialLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : data ? (
        <>
          <SummaryCards totals={data.totals} />

          {data.totals.uncoveredQuantity > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
              <div>
                <div className="font-medium">
                  {data.totals.uncoveredQuantity} dona sotilgan tovarning tan narxi
                  kiritilmagan
                </div>
                <div className="text-muted-foreground">
                  Bu donalar uchun tan narx 0 deb emas, umuman hisobga olinmagan holda
                  ko'rsatilgan — shuning uchun haqiqiy foyda bundan kamroq bo'lishi
                  mumkin. Omborda o'sha tovarlarga kirim qo'shsangiz, hisob avtomatik
                  qayta hisoblanadi.
                </div>
              </div>
            </div>
          )}

          {data.daily.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Kunlik dinamika</CardTitle>
              </CardHeader>
              <CardContent>
                <PnlChart daily={data.daily} />
              </CardContent>
            </Card>
          )}

          <PnlTable rows={data.rows} />
        </>
      ) : null}
    </div>
  );
}
