"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Download,
  RefreshCw,
  Scale,
  ShieldCheck,
} from "lucide-react";

import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PnlChart } from "@/features/pnl/components/pnl-chart";
import { PnlTable } from "@/features/pnl/components/pnl-table";
import { SummaryCards } from "@/features/pnl/components/summary-cards";
import { UzumReconcile } from "@/features/pnl/components/uzum-reconcile";
import { downloadPnlCsv } from "@/features/pnl/export";
import { usePnlReport, usePnlStore } from "@/features/pnl/store";
import { daysInRange } from "@/lib/date-range";
import { formatNumber, formatPercent } from "@/lib/format";
import type { PnlTotals, ProductPnl } from "@/lib/types";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { cn } from "@/lib/utils";

import styles from "@/features/pnl/components/pnl.module.css";

export default function PnlPage() {
  const range = usePnlStore((state) => state.range);
  const setRange = usePnlStore((state) => state.setRange);
  const allProducts = usePnlStore((state) => state.allProducts);
  const setAllProducts = usePnlStore((state) => state.setAllProducts);
  const { data, error, isInitialLoading, isRefreshing, refresh } = usePnlReport();

  useAutoRefresh(refresh);

  const periodDays = daysInRange(range);

  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="pnl-title">
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}>
            <Scale aria-hidden="true" /> FIFO foyda tahlili
          </span>
          <h1 id="pnl-title">Haqiqiy foyda va marjani ko‘ring</h1>
          <p>
            Uzum tushumi, komissiya, logistika va ombordagi real tan narxni bitta
            zanjirda solishtiring. Har bir so‘m qayerdan kelganini tushunarli ko‘ring.
          </p>
        </div>

        <div className={styles.heroMark}>
          <ShieldCheck aria-hidden="true" />
          <span>
            <strong>FIFO asosida</strong>
            <small>Kirimlar ketma-ketligi bo‘yicha</small>
          </span>
        </div>
      </section>

      <section className={styles.filterPanel} aria-label="Hisobot davri va amallar">
        <div className={styles.filterTop}>
          <div className={styles.filterTitle}>
            <span><CalendarRange aria-hidden="true" /></span>
            <div>
              <strong>Hisobot davri</strong>
              <small>{periodDays} kunlik moliyaviy kesim</small>
            </div>
          </div>

          <div className={styles.filterActions}>
            <span className={styles.refreshStatus} aria-live="polite">
              <Clock3 aria-hidden="true" />
              {isRefreshing ? "Yangilanmoqda…" : "Avtomatik yangilanadi"}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={styles.iconButton}
              onClick={refresh}
              disabled={isInitialLoading || isRefreshing}
              aria-label="Hisobotni yangilash"
              title="Yangilash"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn(isRefreshing && styles.spinning)}
              />
            </Button>
            <Button
              type="button"
              variant="outline"
              className={styles.exportButton}
              onClick={() => data && downloadPnlCsv(data)}
              disabled={!data?.rows.length}
            >
              <Download aria-hidden="true" /> CSV yuklash
            </Button>
          </div>
        </div>

        <DateRangePicker
          value={range}
          onChange={setRange}
          className={styles.dateRange}
        />
      </section>

      {error && !data ? (
        <section className={styles.errorPanel} role="alert">
          <span><AlertTriangle aria-hidden="true" /></span>
          <div>
            <h2>Hisobotni yuklab bo‘lmadi</h2>
            <p>{error}</p>
          </div>
          <Button type="button" variant="outline" onClick={refresh}>
            <RefreshCw aria-hidden="true" /> Qayta urinish
          </Button>
        </section>
      ) : null}

      {isInitialLoading ? (
        <LoadingState />
      ) : data ? (
        <div className={styles.content}>
          {error ? (
            <div className={styles.staleAlert} role="status">
              <AlertTriangle aria-hidden="true" />
              <span>
                Yangilashda xatolik yuz berdi. Quyida oxirgi muvaffaqiyatli hisobot
                ko‘rsatilmoqda.
              </span>
            </div>
          ) : null}

          <SummaryCards totals={data.totals} />

          <div className={styles.explainGrid}>
            <UzumReconcile totals={data.totals} />
            <CostCoverage totals={data.totals} rows={data.rows} />
          </div>

          {data.daily.length > 0 ? (
            <section className={styles.panel} aria-labelledby="pnl-chart-title">
              <header className={styles.panelHeader}>
                <div>
                  <span className={styles.sectionKicker}>Kunlik natija</span>
                  <h2 id="pnl-chart-title">Tushum, tan narx va foyda dinamikasi</h2>
                  <p>Qaysi kunlarda xarajat o‘sib, marja pasayganini tez aniqlang.</p>
                </div>
                <span className={styles.periodBadge}>{data.daily.length} kun</span>
              </header>
              <div className={styles.chartArea}>
                <PnlChart daily={data.daily} />
              </div>
            </section>
          ) : null}

          <PnlTable
            rows={data.rows}
            allProducts={allProducts}
            onAllProductsChange={setAllProducts}
          />
        </div>
      ) : null}
    </div>
  );
}

function CostCoverage({ totals, rows }: { totals: PnlTotals; rows: ProductPnl[] }) {
  const affectedProducts = rows.filter((row) => row.uncoveredQuantity > 0).length;
  const hasSales = totals.soldQuantity > 0;
  const coveredQuantity = Math.max(0, totals.soldQuantity - totals.uncoveredQuantity);
  const coverage = hasSales
    ? Math.max(
        0,
        Math.min(100, (coveredQuantity / totals.soldQuantity) * 100)
      )
    : 0;
  const isComplete = totals.uncoveredQuantity <= 0;

  return (
    <section
      className={cn(styles.coverageCard, isComplete && styles.coverageComplete)}
      aria-labelledby="cost-coverage-title"
    >
      <div className={styles.coverageIcon}>
        {isComplete ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
      </div>

      <div className={styles.coverageHeading}>
        <span className={styles.sectionKicker}>Ma’lumot sifati</span>
        <h2 id="cost-coverage-title">Tan narx qamrovi</h2>
        <p>
          {isComplete
            ? "Sotilgan barcha donalar ombordagi kirim bilan qoplangan."
            : "Kirim yetishmasa, ko‘rsatilgan foyda haqiqiy natijadan balandroq chiqishi mumkin."}
        </p>
      </div>

      <div className={styles.coverageValueRow}>
        <strong>{hasSales ? formatPercent(coverage) : "—"}</strong>
        <span>
          {hasSales
            ? `${formatNumber(coveredQuantity)} / ${formatNumber(totals.soldQuantity)} dona`
            : "Sotuv hali yo‘q"}
        </span>
      </div>

      <div
        className={styles.coverageTrack}
        role="progressbar"
        aria-label="Tan narxi kiritilgan sotuvlar ulushi"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(coverage)}
      >
        <span style={{ width: `${coverage}%` }} />
      </div>

      {isComplete ? (
        <div className={styles.coverageSuccess}>
          <CheckCircle2 aria-hidden="true" /> Hisob-kitob uchun ma’lumotlar tayyor
        </div>
      ) : (
        <div className={styles.coverageIssue}>
          <div>
            <strong>{formatNumber(totals.uncoveredQuantity)} dona tan narxsiz</strong>
            <span>{affectedProducts} ta mahsulotda kirim yetishmaydi</span>
          </div>
          <Button asChild className={styles.coverageAction}>
            <Link href="/intakes">
              Kirimlarni to‘ldirish <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}

function LoadingState() {
  return (
    <div className={styles.loading} aria-label="Hisobot yuklanmoqda">
      <div className={styles.loadingSummary}>
        <Skeleton className={styles.loadingHero} />
        <div className={styles.loadingMetrics}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className={styles.loadingMetric} />
          ))}
        </div>
      </div>
      <div className={styles.loadingPanels}>
        <Skeleton />
        <Skeleton />
      </div>
      <Skeleton className={styles.loadingChart} />
    </div>
  );
}
