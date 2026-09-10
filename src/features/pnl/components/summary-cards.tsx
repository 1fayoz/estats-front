"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Boxes,
  Coins,
  PackagePlus,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatNumber, formatPercent, formatSum } from "@/lib/format";
import type { PnlTotals } from "@/lib/types";
import { cn } from "@/lib/utils";

import styles from "./pnl.module.css";

export function SummaryCards({ totals }: { totals: PnlTotals }) {
  const isProfit = totals.profit >= 0;

  return (
    <section className={styles.summaryGrid} aria-label="Asosiy moliyaviy ko‘rsatkichlar">
      <article
        className={cn(styles.profitCard, !isProfit && styles.profitCardNegative)}
      >
        <div className={styles.profitTop}>
          <span className={styles.profitIcon}>
            {isProfit ? <TrendingUp aria-hidden="true" /> : <TrendingDown aria-hidden="true" />}
          </span>
          <span className={styles.profitState}>{isProfit ? "Ijobiy natija" : "Zarar qayd etildi"}</span>
        </div>

        <div className={styles.profitMain}>
          <span>{isProfit ? "Sof foyda" : "Umumiy zarar"}</span>
          <strong>{formatSum(totals.profit)}</strong>
          <small>Uzum to‘lovi − FIFO tan narx</small>
        </div>

        <div className={styles.profitFooter}>
          <div>
            <span>Marja</span>
            <strong>{formatPercent(totals.margin)}</strong>
          </div>
          <div>
            <span>Foydadagi tovarlar</span>
            <strong>{formatNumber(totals.productsInProfit)} ta</strong>
          </div>
          <div>
            <span>Zarardagi tovarlar</span>
            <strong>{formatNumber(totals.productsInLoss)} ta</strong>
          </div>
        </div>
      </article>

      <div className={styles.metricGrid}>
        <Metric
          icon={Coins}
          label="Uzum to‘lovi"
          value={formatSum(totals.revenue)}
          hint={`${formatSum(totals.gross)} savdo aylanmasidan`}
          tone="primary"
        />
        <Metric
          icon={TrendingDown}
          label="Tan narx (FIFO)"
          value={formatSum(totals.cogs)}
          hint="Sotilgan donalarning ombor qiymati"
        />
        <Metric
          icon={Boxes}
          label="Sotildi"
          value={`${formatNumber(totals.soldQuantity)} dona`}
          hint={
            totals.returnedQuantity > 0
              ? `${formatNumber(totals.returnedQuantity)} dona qaytdi · ${formatSum(totals.returnedAmount)}`
              : "Qaytarilgan mahsulot yo‘q"
          }
          tone={totals.returnedQuantity > 0 ? "warning" : undefined}
        />
        <Metric
          icon={PackagePlus}
          label="Davrdagi kirim"
          value={formatSum(totals.intakeCost)}
          hint={`${formatNumber(totals.intakeQuantity)} dona qabul qilindi`}
        />
      </div>
    </section>
  );
}

interface MetricProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint: string;
  tone?: "primary" | "warning";
}

function Metric({ icon: Icon, label, value, hint, tone }: MetricProps) {
  return (
    <article className={styles.metricCard} data-tone={tone}>
      <div className={styles.metricHead}>
        <span><Icon aria-hidden="true" /></span>
        <small>{label}</small>
      </div>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  );
}

export function ProfitBadge({ value }: { value: number }) {
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;

  return (
    <span className={styles.profitBadge} data-positive={positive}>
      <Icon aria-hidden="true" />
      {formatSum(value)}
    </span>
  );
}

export function MarginBadge({ value }: { value: number }) {
  return (
    <span className={styles.marginBadge}>
      <Percent aria-hidden="true" />
      {formatPercent(value)}
    </span>
  );
}
