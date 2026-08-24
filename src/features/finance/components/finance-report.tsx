"use client";

import * as React from "react";
import {
  RefreshCw,
  Download,
  CalendarRange,
  AlertTriangle,
  Inbox,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";

import { daysInRange, formatDayLabel } from "@/lib/date-range";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useFinanceReport, useFinanceStore } from "../store";
import type { FinanceReport, OrderStatus } from "../types";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { SummaryCards } from "./summary-cards";
import { DailyChart } from "./daily-chart";
import { DailyTable } from "./daily-table";
import { reportToCsv, downloadCsv } from "../export";

const STATUS_META: Record<OrderStatus, { label: string; variant: "info" | "warning" | "destructive" | "secondary" }> = {
  TO_WITHDRAW: { label: "Yechishga tayyor", variant: "info" },
  PROCESSING: { label: "Jarayonda", variant: "warning" },
  CANCELED: { label: "Bekor qilingan", variant: "destructive" },
  PARTIALLY_CANCELLED: { label: "Qisman bekor", variant: "secondary" },
};

export function FinanceReport() {
  const range = useFinanceStore((s) => s.range);
  const setRange = useFinanceStore((s) => s.setRange);
  const { data, error, isInitialLoading, isRefreshing, refresh } = useFinanceReport(range);
  // Moliya sahifasi ham o'zi yangilanadi — tugma yo'q.
  useAutoRefresh(refresh);

  return (
    <div className="space-y-5">
      <Card>
        <CardContent className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <DateRangePicker value={range} onChange={setRange} />
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              <UpdatedLabel data={data} refreshing={isRefreshing} />
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => data && downloadCsv(reportToCsv(data), `uzum-moliya_${range.from}_${range.to}.csv`)}
              disabled={!data || !data.daily.length}
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && !data ? (
        <ErrorCard message={error} onRetry={refresh} />
      ) : (
        <>
          {error && data && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Yangilashda xatolik: {error}. Eski ma'lumot ko'rsatilmoqda.
            </div>
          )}

          <SummaryCards totals={data?.totals} loading={isInitialLoading} />

          {isInitialLoading ? (
            <ChartSkeleton />
          ) : data && data.daily.length ? (
            <>
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <CalendarRange className="h-4 w-4 text-primary" />
                      Kunlik dinamika
                    </CardTitle>
                    <CardDescription>
                      {daysInRange(range)} kun · yalpi savdo taqsimoti va buyurtmalar
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DailyChart daily={data.daily} />
                  </CardContent>
                </Card>

                <div className="flex flex-col gap-4">
                  <StatusCard report={data} />
                  <ExpensesCard report={data} />
                </div>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Kunlar bo'yicha batafsil</CardTitle>
                  <CardDescription>
                    Har kuni: buyurtma, savdo summasi, komissiya foizi, logistika va Uzum yechimlari
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <DailyTable daily={data.daily} totals={data.totals} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-4">
                <EmptyState
                  icon={Inbox}
                  title="Bu davrda ma'lumot yo'q"
                  description="Tanlangan sana oralig'ida buyurtma yoki to'lov topilmadi. Boshqa oraliqni tanlang."
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

function UpdatedLabel({ data, refreshing }: { data: FinanceReport | null; refreshing: boolean }) {
  if (refreshing) return <>Yangilanmoqda…</>;
  if (!data) return null;
  const t = new Date(data.generatedAt).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return <>Yangilandi: {t}</>;
}

function StatusCard({ report }: { report: FinanceReport }) {
  const entries = (Object.keys(STATUS_META) as OrderStatus[])
    .map((s) => ({ status: s, count: report.statusCounts[s] ?? 0 }))
    .filter((e) => e.count > 0);
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Buyurtma statuslari</CardTitle>
        <CardDescription>Davr bo'yicha pozitsiyalar soni</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {entries.length ? (
          entries.map(({ status, count }) => (
            <Badge key={status} variant={STATUS_META[status].variant} className="gap-1.5">
              {STATUS_META[status].label}
              <span className="font-mono font-semibold">{count}</span>
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </CardContent>
    </Card>
  );
}

function ExpensesCard({ report }: { report: FinanceReport }) {
  if (!report.topExpenses.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Uzum yechimlari (top)</CardTitle>
        <CardDescription>Jarima, saqlash va boshqa to'lovlar</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {report.topExpenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="truncate">{e.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {formatDayLabel(e.date)}
                {e.code ? ` · ${e.code}` : ""}
              </div>
            </div>
            <div className="shrink-0 font-medium tabular-nums text-rose-600 dark:text-rose-400">
              −{formatSum(e.amount)}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="font-medium">Ma'lumotni yuklab bo'lmadi</div>
        <div className="max-w-md text-sm text-muted-foreground">{message}</div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4" />
          Qayta urinish
        </Button>
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
      <Card>
        <CardContent className="py-6">
          <Skeleton className="h-[320px] w-full" />
        </CardContent>
      </Card>
      <div className="flex flex-col gap-4">
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
