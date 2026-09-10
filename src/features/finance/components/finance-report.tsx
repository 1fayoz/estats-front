"use client";

import {
  AlertTriangle,
  CalendarRange,
  Clock3,
  Download,
  Inbox,
  Info,
  ReceiptText,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { daysInRange, formatDayLabel } from "@/lib/date-range";
import { formatNumber, formatSum } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { cn } from "@/lib/utils";

import { downloadCsv, reportToCsv } from "../export";
import { useFinanceReport, useFinanceStore } from "../store";
import type { FinanceReport, OrderStatus } from "../types";
import { DailyChart } from "./daily-chart";
import { DailyTable } from "./daily-table";
import { SummaryCards } from "./summary-cards";
import styles from "./finance.module.css";

const STATUS_META: Record<OrderStatus, { label: string; tone: string }> = {
  TO_WITHDRAW: { label: "Yechishga tayyor", tone: "ready" },
  PROCESSING: { label: "Jarayonda", tone: "processing" },
  CANCELED: { label: "Bekor qilingan", tone: "cancelled" },
  PARTIALLY_CANCELLED: { label: "Qisman bekor", tone: "partial" },
};

export function FinanceReport() {
  const range = useFinanceStore((state) => state.range);
  const setRange = useFinanceStore((state) => state.setRange);
  const { data, error, isInitialLoading, isRefreshing, refresh } = useFinanceReport(range);
  useAutoRefresh(refresh);

  return (
    <div className={styles.report}>
      <section className={styles.filterPanel} aria-label="Hisobot davri va eksport">
        <div className={styles.filterTop}>
          <div className={styles.filterTitle}>
            <span><CalendarRange aria-hidden="true" /></span>
            <div>
              <strong>Hisobot davri</strong>
              <small>{daysInRange(range)} kunlik Uzum hisob-kitobi</small>
            </div>
          </div>
          <div className={styles.filterActions}>
            <span className={styles.updatedLabel} aria-live="polite">
              {isRefreshing ? <RefreshCw className={styles.spinning} aria-hidden="true" /> : <Clock3 aria-hidden="true" />}
              <UpdatedLabel data={data} refreshing={isRefreshing} />
            </span>
            <Button
              variant="outline"
              onClick={() => data && downloadCsv(reportToCsv(data), "uzum-moliya_" + range.from + "_" + range.to + ".csv")}
              disabled={!data || !data.daily.length}
              className={styles.exportButton}
            >
              <Download aria-hidden="true" />
              CSV yuklash
            </Button>
          </div>
        </div>
        <DateRangePicker value={range} onChange={setRange} className={styles.dateRange} />
      </section>

      {error && !data ? (
        <ErrorCard message={error} onRetry={refresh} />
      ) : (
        <>
          {error && data ? (
            <div className={styles.staleAlert} role="status">
              <AlertTriangle aria-hidden="true" />
              <p><strong>Yangilash amalga oshmadi.</strong> Eski ma&apos;lumot ko&apos;rsatilmoqda: {error}</p>
            </div>
          ) : null}

          <SummaryCards totals={data?.totals} loading={isInitialLoading} />

          <div className={styles.ledgerNote}>
            <Info aria-hidden="true" />
            <p>
              <strong>Uzum o&apos;tkazmasi — bu biznes foydasi emas.</strong>
              {" "}Unda marketplace ushlanmalari hisoblangan, lekin mahsulot tannarxi va ichki xarajatlaringiz yo&apos;q.
            </p>
          </div>

          {isInitialLoading ? (
            <ReportSkeleton />
          ) : data && data.daily.length ? (
            <>
              <div className={styles.analyticsGrid}>
                <section className={styles.panel} aria-labelledby="daily-chart-title">
                  <header className={styles.panelHeader}>
                    <div>
                      <span className={styles.sectionKicker}>Pul oqimi</span>
                      <h2 id="daily-chart-title">Kunlik dinamika</h2>
                      <p>Yalpi savdo taqsimoti va buyurtmalar soni</p>
                    </div>
                    <span className={styles.periodBadge}>{daysInRange(range)} kun</span>
                  </header>
                  <div className={styles.chartArea}>
                    <DailyChart daily={data.daily} />
                  </div>
                </section>

                <aside className={styles.insights} aria-label="Hisobot tafsilotlari">
                  <StatusCard report={data} />
                  <ExpensesCard report={data} />
                </aside>
              </div>

              <section className={cn(styles.panel, styles.tablePanel)} aria-labelledby="daily-table-title">
                <header className={styles.panelHeader}>
                  <div>
                    <span className={styles.sectionKicker}>Batafsil ledger</span>
                    <h2 id="daily-table-title">Kunlar bo&apos;yicha hisob-kitob</h2>
                    <p>Har bir kun uchun savdo, barcha ushlanmalar va yakuniy o&apos;tkazma</p>
                  </div>
                  <span className={styles.periodBadge}>{formatNumber(data.daily.length)} qator</span>
                </header>
                <DailyTable daily={data.daily} totals={data.totals} />
              </section>
            </>
          ) : (
            <section className={styles.emptyPanel}>
              <EmptyState
                icon={Inbox}
                title="Bu davrda ma'lumot yo'q"
                description="Tanlangan sana oralig'ida buyurtma yoki to'lov topilmadi. Boshqa oraliqni tanlang."
              />
            </section>
          )}
        </>
      )}
    </div>
  );
}

function UpdatedLabel({ data, refreshing }: { data: FinanceReport | null; refreshing: boolean }) {
  if (refreshing) return <>Yangilanmoqda…</>;
  if (!data) return <>Ma&apos;lumot kutilmoqda</>;
  const time = new Date(data.generatedAt).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return <>Yangilandi {time}</>;
}

function StatusCard({ report }: { report: FinanceReport }) {
  const entries = (Object.keys(STATUS_META) as OrderStatus[]).map((status) => ({
    status,
    count: report.statusCounts[status] ?? 0,
  }));
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <section className={cn(styles.panel, styles.insightPanel)} aria-labelledby="finance-status-title">
      <header className={styles.insightHeader}>
        <div>
          <span className={styles.sectionKicker}>Pozitsiyalar</span>
          <h2 id="finance-status-title">Buyurtma statuslari</h2>
        </div>
        <strong>{formatNumber(total)}</strong>
      </header>
      <div className={styles.statusList}>
        {entries.map(({ status, count }) => (
          <div key={status} className={styles.statusRow} data-tone={STATUS_META[status].tone}>
            <span className={styles.statusDot} aria-hidden="true" />
            <span>{STATUS_META[status].label}</span>
            <strong>{formatNumber(count)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function ExpensesCard({ report }: { report: FinanceReport }) {
  return (
    <section className={cn(styles.panel, styles.insightPanel)} aria-labelledby="finance-expenses-title">
      <header className={styles.insightHeader}>
        <div>
          <span className={styles.sectionKicker}>Qo&apos;shimcha</span>
          <h2 id="finance-expenses-title">Yirik yechimlar</h2>
        </div>
        <span className={styles.insightIcon}><ReceiptText aria-hidden="true" /></span>
      </header>
      {report.topExpenses.length ? (
        <ol className={styles.expenseList}>
          {report.topExpenses.map((expense) => (
            <li key={expense.id}>
              <div>
                <strong>{expense.name}</strong>
                <span>
                  {formatDayLabel(expense.date)}
                  {expense.code ? " · " + expense.code : ""}
                </span>
              </div>
              <b className={cn(expense.amount < 0 && styles.expenseCredit)}>
                {expense.amount > 0 ? "−" : expense.amount < 0 ? "+" : ""}
                {formatSum(Math.abs(expense.amount))}
              </b>
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.noExpenses}>
          <ReceiptText aria-hidden="true" />
          <span>Bu davrda boshqa yechimlar yo&apos;q</span>
        </div>
      )}
    </section>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className={styles.errorPanel} role="alert">
      <span><AlertTriangle aria-hidden="true" /></span>
      <div>
        <h2>Ma&apos;lumotni yuklab bo&apos;lmadi</h2>
        <p>{message}</p>
      </div>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw aria-hidden="true" />
        Qayta urinish
      </Button>
    </section>
  );
}

function ReportSkeleton() {
  return (
    <div className={styles.analyticsGrid}>
      <section className={styles.panel}>
        <div className={styles.skeletonHeader}>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <div className={styles.chartArea}>
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      </section>
      <div className={styles.insights}>
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
