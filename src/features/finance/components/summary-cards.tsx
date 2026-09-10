"use client";

import {
  ArrowDownRight,
  CircleDollarSign,
  Percent,
  ReceiptText,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber, formatPercent, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FinanceTotals } from "../types";
import styles from "./finance.module.css";

export function SummaryCards({
  totals,
  loading,
}: {
  totals?: FinanceTotals;
  loading?: boolean;
}) {
  if (loading || !totals) return <SummarySkeleton />;

  const withheldRate = totals.gross > 0
    ? ((totals.gross - totals.net) / totals.gross) * 100
    : 0;
  const payoutRate = totals.gross > 0 ? (totals.net / totals.gross) * 100 : 0;

  return (
    <section className={styles.summaryGrid} aria-label="Davr bo'yicha moliyaviy ko'rsatkichlar">
      <article className={styles.payoutCard}>
        <div className={styles.metricHeading}>
          <span className={styles.metricIcon}><CircleDollarSign aria-hidden="true" /></span>
          <div>
            <span>Uzum o&apos;tkazmasi</span>
            <small>Tannarx hisobga olinmagan</small>
          </div>
        </div>

        <strong
          className={cn(styles.payoutValue, totals.net < 0 ? styles.valueNegative : styles.valuePositive)}
          title={formatSum(totals.net)}
        >
          {formatSumShort(totals.net)}
        </strong>

        <div className={styles.payoutFooter}>
          <span>
            <small>Yalpi savdodan</small>
            <b>{formatPercent(payoutRate)}</b>
          </span>
          <span>
            <small>Buyurtma / dona</small>
            <b>{formatNumber(totals.orders)} / {formatNumber(totals.units)}</b>
          </span>
        </div>
      </article>

      <article className={styles.breakdownCard}>
        <header className={styles.breakdownHeader}>
          <div>
            <span className={styles.sectionKicker}>Hisob-kitob tarkibi</span>
            <h2>Savdo va ushlanmalar</h2>
          </div>
          <span className={styles.withheldRate}>
            <Percent aria-hidden="true" />
            {formatPercent(withheldRate)} ushlangan
          </span>
        </header>

        <div className={styles.breakdownGrid}>
          <BreakdownMetric
            icon={ShoppingBag}
            label="Yalpi savdo"
            value={formatSumShort(totals.gross)}
            exact={formatSum(totals.gross)}
            hint={formatNumber(totals.orders) + " ta buyurtma"}
          />
          <BreakdownMetric
            icon={ArrowDownRight}
            label="Komissiya"
            value={deduction(totals.commission)}
            exact={deduction(totals.commission, false)}
            hint={"o'rtacha " + formatPercent(totals.commissionRate)}
            tone={deductionTone(totals.commission)}
          />
          <BreakdownMetric
            icon={Truck}
            label="Logistika"
            value={deduction(totals.logistics)}
            exact={deduction(totals.logistics, false)}
            hint={formatNumber(totals.units) + " dona yetkazish"}
            tone={deductionTone(totals.logistics)}
          />
          <BreakdownMetric
            icon={ReceiptText}
            label="Boshqa yechimlar"
            value={deduction(totals.expenses)}
            exact={deduction(totals.expenses, false)}
            hint="jarima, saqlash va boshqalar"
            tone={deductionTone(totals.expenses)}
          />
        </div>
      </article>
    </section>
  );
}

function BreakdownMetric({
  icon: Icon,
  label,
  value,
  exact,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  exact: string;
  hint: string;
  tone?: "negative" | "positive";
}) {
  return (
    <div className={styles.breakdownMetric}>
      <span className={styles.breakdownIcon}><Icon aria-hidden="true" /></span>
      <div>
        <span>{label}</span>
        <strong
          className={cn(tone === "negative" && styles.valueNegative, tone === "positive" && styles.valuePositive)}
          title={exact}
        >
          {value}
        </strong>
        <small>{hint}</small>
      </div>
    </div>
  );
}

function deduction(value: number, short = true) {
  if (value === 0) return short ? formatSumShort(0) : formatSum(0);
  const formatted = short ? formatSumShort(Math.abs(value)) : formatSum(Math.abs(value));
  return (value > 0 ? "−" : "+") + formatted;
}

function deductionTone(value: number) {
  if (value > 0) return "negative" as const;
  if (value < 0) return "positive" as const;
  return undefined;
}

function SummarySkeleton() {
  return (
    <section className={styles.summaryGrid} aria-label="Moliyaviy ko'rsatkichlar yuklanmoqda">
      <article className={styles.payoutCard}>
        <Skeleton className="h-10 w-40 rounded-xl" />
        <Skeleton className="mt-8 h-10 w-48 max-w-full" />
        <div className={styles.payoutFooter}>
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-28" />
        </div>
      </article>
      <article className={styles.breakdownCard}>
        <Skeleton className="h-10 w-52 max-w-full" />
        <div className={styles.breakdownGrid}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </article>
    </section>
  );
}
