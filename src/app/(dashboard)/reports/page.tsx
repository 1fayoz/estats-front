"use client";

import * as React from "react";
import { AlertTriangle, Download, FileSpreadsheet, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CommissionerPanel } from "@/features/reports/components/commissioner-panel";
import {
  Comparison,
  Deductions,
  KpiCards,
  ProductsTable,
  TaxBlock,
  Waterfall,
} from "@/features/reports/components/report-parts";
import type { MonthlyReport, ReportBasis } from "@/features/reports/types";
import { ApiError, downloadMonthlyReport, fetchMonthlyReport } from "@/lib/api";
import { presetRange, todayUz, type DateRange } from "@/lib/date-range";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const RATE_KEY = "estats:reports:taxRate";

/** O'tgan oy — oylik yopish odatda shu oy uchun qilinadi. */
function lastMonth(): string {
  const [y, m] = todayUz().split("-").map(Number);
  const index = y * 12 + (m - 1) - 1;
  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

function readRate(): number {
  try {
    const v = Number(window.localStorage.getItem(RATE_KEY));
    return Number.isFinite(v) && v > 0 && v <= 100 ? v : 4;
  } catch {
    return 4;
  }
}

export default function ReportsPage() {
  const [mode, setMode] = React.useState<"month" | "range">("month");
  const [month, setMonth] = React.useState(lastMonth);
  const [range, setRange] = React.useState<DateRange>(() => presetRange("30d"));
  const [basis, setBasis] = React.useState<ReportBasis>("ordered");
  const [rate, setRate] = React.useState(4);
  const [data, setData] = React.useState<MonthlyReport | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => setRate(readRate()), []);

  const params = React.useMemo(
    () => (mode === "month" ? { month, basis, taxRate: rate } : { from: range.from, to: range.to, basis, taxRate: rate }),
    [mode, month, range, basis, rate],
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setData(await fetchMonthlyReport<MonthlyReport>(params));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Hisobotni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [params]);

  React.useEffect(() => { void load(); }, [load]);

  const changeRate = (v: number) => {
    setRate(v);
    try { window.localStorage.setItem(RATE_KEY, String(v)); } catch { /* shaxsiy rejim */ }
  };

  const exportAs = async (format: "xlsx" | "csv") => {
    try {
      await downloadMonthlyReport(params, format);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Fayl chiqmadi");
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-5 text-primary" aria-hidden="true" />
            <div>
              <h1 className="text-base font-semibold">Oylik yopish</h1>
              <p className="text-xs text-muted-foreground">
                Sotuv, Uzum ushlanmalari, reklama, FIFO tannarx va o&apos;z xarajatlaringiz — bitta hisobotda.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => void load()} disabled={loading} aria-label="Yangilash">
              <RefreshCw className={cn("size-4", loading && "animate-spin")} />
            </Button>
            <Button size="sm" variant="outline" onClick={() => void exportAs("xlsx")} disabled={!data}>
              <Download className="mr-2 size-4" /> Excel
            </Button>
            <Button size="sm" variant="outline" onClick={() => void exportAs("csv")} disabled={!data}>
              <Download className="mr-2 size-4" /> CSV
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border p-0.5 text-sm" role="tablist" aria-label="Davr turi">
            {(["month", "range"] as const).map((m) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m}
                      className={cn("rounded-md px-3 py-1", mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                      onClick={() => setMode(m)}>
                {m === "month" ? "Oy" : "Ixtiyoriy oraliq"}
              </button>
            ))}
          </div>
          {mode === "month" ? (
            <input type="month" value={month} max={todayUz().slice(0, 7)} aria-label="Oy"
                   onChange={(e) => e.target.value && setMonth(e.target.value)}
                   className="h-9 rounded-md border bg-background px-2 text-sm" />
          ) : (
            <DateRangePicker value={range} onChange={setRange} />
          )}
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sana:</span>
            <select value={basis} onChange={(e) => setBasis(e.target.value as ReportBasis)}
                    className="h-9 rounded-md border bg-background px-2">
              <option value="ordered">buyurtma sanasi (P&amp;L bilan bir xil)</option>
              <option value="issued">xaridor olgan sana (Uzum hisoboti kabi)</option>
            </select>
          </label>
        </div>
      </Card>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-lg border border-[var(--bad)] p-3 text-sm text-[var(--bad)]">
          <AlertTriangle className="size-4" /> {error}
        </div>
      )}

      {loading && !data ? (
        <div className="grid gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : data ? (
        <>
          {!data.sources.salesComplete && (
            <div className="rounded-lg border border-[var(--warn-line)] bg-[var(--warn-bg)] p-3 text-sm text-[var(--warn-ink)]">
              Sotuv tarixi {data.sources.salesSyncedFrom ? formatDate(data.sources.salesSyncedFrom) : "hali"} dan yuklangan —
              davrning boshi to&apos;liq bo&apos;lmasligi mumkin.
            </div>
          )}
          <KpiCards report={data} />
          <div className="grid gap-4 xl:grid-cols-2">
            <Waterfall steps={data.waterfall} />
            {data.tax ? (
              <TaxBlock tax={data.tax} rate={rate} onRate={changeRate} />
            ) : (
              <Card className="p-4 text-sm text-muted-foreground">
                Aylanma soliq va komissioner hisoboti faqat kalendar oy uchun — «Oy» rejimini tanlang.
              </Card>
            )}
          </div>
          <Comparison report={data} />
          <ProductsTable report={data} />
          <Deductions report={data} />
          {data.period.month && <CommissionerPanel period={data.period.month} onChanged={() => void load()} />}
        </>
      ) : null}
    </div>
  );
}
