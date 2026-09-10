"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { formatDayLabel, formatWeekday } from "@/lib/date-range";
import { formatNumber, formatPercent, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DailyFinance, FinanceTotals } from "../types";

import styles from "./daily-table.module.css";

const COLUMNS = [
  { key: "date", label: "Sana", align: "left" },
  { key: "orders", label: "Buyurtma", align: "right" },
  { key: "units", label: "Dona", align: "right" },
  { key: "returns", label: "Qaytgan", align: "right" },
  { key: "gross", label: "Yalpi savdo", align: "right" },
  { key: "commission", label: "Komissiya", align: "right" },
  { key: "logistics", label: "Logistika", align: "right" },
  { key: "expenses", label: "Boshqa yechim", align: "right" },
  { key: "sellerProfit", label: "Bazaviy to'lov", align: "right" },
  { key: "net", label: "Sof to'lov", align: "right" },
] as const;

type FinanceMetrics = Pick<
  DailyFinance,
  | "orders"
  | "units"
  | "returns"
  | "gross"
  | "commission"
  | "commissionRate"
  | "logistics"
  | "expenses"
  | "sellerProfit"
  | "net"
>;

function hasActivity(metrics: FinanceMetrics) {
  return (
    metrics.orders !== 0 ||
    metrics.units !== 0 ||
    metrics.returns !== 0 ||
    metrics.gross !== 0 ||
    metrics.commission !== 0 ||
    metrics.logistics !== 0 ||
    metrics.expenses !== 0 ||
    metrics.sellerProfit !== 0 ||
    metrics.net !== 0
  );
}

function payoutTone(value: number) {
  return value < 0 ? styles.negative : styles.positive;
}

function MoneyValue({ value, muted = false }: { value: number; muted?: boolean }) {
  if (value === 0 && muted) {
    return <span className={styles.mutedValue}>—</span>;
  }

  return <>{formatSum(value)}</>;
}

function MetricsGrid({ metrics }: { metrics: FinanceMetrics }) {
  const active = hasActivity(metrics);

  return (
    <dl className={styles.metricsGrid}>
      <div className={styles.metric}>
        <dt>Buyurtmalar</dt>
        <dd>{formatNumber(metrics.orders)}</dd>
      </div>
      <div className={styles.metric}>
        <dt>Sotilgan dona</dt>
        <dd>{formatNumber(metrics.units)}</dd>
      </div>
      <div className={cn(styles.metric, metrics.returns > 0 && styles.returnMetric)}>
        <dt>Qaytgan dona</dt>
        <dd>{formatNumber(metrics.returns)}</dd>
      </div>
      <div className={styles.metric}>
        <dt>Yalpi savdo</dt>
        <dd>
          <MoneyValue value={metrics.gross} muted={!active} />
        </dd>
      </div>
      <div className={cn(styles.metric, metrics.commission < 0 ? styles.creditMetric : styles.deductionMetric)}>
        <dt>Komissiya</dt>
        <dd>
          <MoneyValue value={metrics.commission} muted={!active} />
          {metrics.commission !== 0 ? (
            <span className={styles.rate}>{formatPercent(metrics.commissionRate)}</span>
          ) : null}
        </dd>
      </div>
      <div className={cn(styles.metric, metrics.logistics < 0 ? styles.creditMetric : styles.deductionMetric)}>
        <dt>Logistika</dt>
        <dd>
          <MoneyValue value={metrics.logistics} muted={!active} />
        </dd>
      </div>
      <div className={cn(styles.metric, metrics.expenses < 0 ? styles.creditMetric : styles.deductionMetric)}>
        <dt>Boshqa yechimlar</dt>
        <dd>
          <MoneyValue value={metrics.expenses} muted={!active} />
        </dd>
      </div>
      <div className={styles.metric}>
        <dt>Bazaviy to&apos;lov</dt>
        <dd>
          <MoneyValue value={metrics.sellerProfit} muted={!active} />
        </dd>
      </div>
    </dl>
  );
}

function SummaryCard({ totals }: { totals: FinanceTotals }) {
  return (
    <article className={cn(styles.dayCard, styles.summaryCard)}>
      <header className={styles.cardHeader}>
        <div>
          <p className={styles.cardEyebrow}>Tanlangan davr</p>
          <h3>Jami natija</h3>
        </div>
        <div className={styles.payoutBlock}>
          <span>Sof to'lov</span>
          <strong className={payoutTone(totals.net)}>{formatSum(totals.net)}</strong>
        </div>
      </header>
      <MetricsGrid metrics={totals} />
    </article>
  );
}

function DayCard({ day, initiallyOpen = false }: { day: DailyFinance; initiallyOpen?: boolean }) {
  const active = hasActivity(day);

  return (
    <details className={styles.dayCard} open={initiallyOpen}>
      <summary className={styles.cardHeader}>
        <div>
          <p className={styles.cardEyebrow}>Kunlik natija</p>
          <h3>{formatDayLabel(day.date)}</h3>
          <p className={styles.weekday}>{formatWeekday(day.date)}</p>
        </div>
        <div className={styles.payoutBlock}>
          <span>Sof to'lov</span>
          <strong className={active ? payoutTone(day.net) : styles.mutedValue}>
            {active ? formatSum(day.net) : "—"}
          </strong>
          <ChevronDown className={styles.cardChevron} aria-hidden="true" />
        </div>
      </summary>
      <MetricsGrid metrics={day} />
    </details>
  );
}

export function DailyTable({
  daily,
  totals,
}: {
  daily: DailyFinance[];
  totals: FinanceTotals;
}) {
  const rows = React.useMemo(
    () => [...daily].sort((first, second) => second.date.localeCompare(first.date)),
    [daily]
  );

  return (
    <section className={styles.root} aria-label="Kunlik moliyaviy natijalar">
      <div className={styles.cardsView}>
        <SummaryCard totals={totals} />
        {rows.map((day, index) => (
          <DayCard key={day.date} day={day} initiallyOpen={index === 0} />
        ))}
      </div>

      <div className={styles.tableView}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            Kunlar kesimida buyurtmalar, savdo, yechimlar va sof to'lovlar
          </caption>
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={column.align === "right" ? styles.alignRight : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((day) => {
              const active = hasActivity(day);

              return (
                <tr key={day.date}>
                  <th scope="row" className={styles.dateCell}>
                    <span>{formatDayLabel(day.date)}</span>
                    <small>{formatWeekday(day.date)}</small>
                  </th>
                  <td>{formatNumber(day.orders)}</td>
                  <td>{formatNumber(day.units)}</td>
                  <td className={day.returns > 0 ? styles.negative : undefined}>
                    {formatNumber(day.returns)}
                  </td>
                  <td>
                    <MoneyValue value={day.gross} muted={!active} />
                  </td>
                  <td className={day.commission < 0 ? styles.creditCell : styles.deductionCell}>
                    <MoneyValue value={day.commission} muted={!active} />
                    {day.commission !== 0 ? (
                      <small>{formatPercent(day.commissionRate)}</small>
                    ) : null}
                  </td>
                  <td className={day.logistics < 0 ? styles.creditCell : styles.deductionCell}>
                    <MoneyValue value={day.logistics} muted={!active} />
                  </td>
                  <td className={day.expenses < 0 ? styles.creditCell : styles.deductionCell}>
                    <MoneyValue value={day.expenses} muted={!active} />
                  </td>
                  <td>
                    <MoneyValue value={day.sellerProfit} muted={!active} />
                  </td>
                  <td className={cn(styles.netCell, active ? payoutTone(day.net) : styles.mutedValue)}>
                    {active ? formatSum(day.net) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Jami</th>
              <td>{formatNumber(totals.orders)}</td>
              <td>{formatNumber(totals.units)}</td>
              <td className={totals.returns > 0 ? styles.negative : undefined}>
                {formatNumber(totals.returns)}
              </td>
              <td>{formatSum(totals.gross)}</td>
              <td className={totals.commission < 0 ? styles.creditCell : styles.deductionCell}>
                {formatSum(totals.commission)}
                <small>{formatPercent(totals.commissionRate)}</small>
              </td>
              <td className={totals.logistics < 0 ? styles.creditCell : styles.deductionCell}>
                {formatSum(totals.logistics)}
              </td>
              <td className={totals.expenses < 0 ? styles.creditCell : styles.deductionCell}>
                {formatSum(totals.expenses)}
              </td>
              <td>{formatSum(totals.sellerProfit)}</td>
              <td className={cn(styles.netCell, payoutTone(totals.net))}>
                {formatSum(totals.net)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
