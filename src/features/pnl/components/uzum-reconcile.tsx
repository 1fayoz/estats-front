"use client";

import { Check, Clock3, Minus, Scale, WalletCards } from "lucide-react";

import { formatSum } from "@/lib/format";
import type { PnlTotals } from "@/lib/types";
import { cn } from "@/lib/utils";

import styles from "./pnl.module.css";

export function UzumReconcile({ totals }: { totals: PnlTotals }) {
  const uzumProfit = totals.gross - totals.commission;
  const isProfit = totals.profit >= 0;
  const steps = [
    {
      label: "Savdo aylanmasi",
      note: "Uzum kabinetidagi “Daromad”",
      value: totals.gross,
      kind: "start",
    },
    {
      label: "Uzum komissiyasi",
      note: "Marketplace ushlab qoladi",
      value: -totals.commission,
      kind: "minus",
    },
    {
      label: "Yetkazib berish",
      note: "Logistika xarajati",
      value: -totals.logistics,
      kind: "minus",
    },
    {
      label: "Uzum to‘lovi",
      note: "Hisobingizga tushadigan pul",
      value: totals.revenue,
      kind: "subtotal",
    },
    {
      label: "Tan narx (FIFO)",
      note: "Ombordagi real xarid qiymati",
      value: -totals.cogs,
      kind: "minus",
    },
    {
      label: isProfit ? "Sof foyda" : "Yakuniy zarar",
      note: "Biznesda qoladigan haqiqiy natija",
      value: totals.profit,
      kind: "result",
    },
  ] as const;

  return (
    <section className={styles.reconcilePanel} aria-labelledby="reconcile-title">
      <header className={styles.reconcileHeader}>
        <div className={styles.reconcileTitle}>
          <span><Scale aria-hidden="true" /></span>
          <div>
            <span className={styles.sectionKicker}>Pul oqimi</span>
            <h2 id="reconcile-title">Uzum bilan hisobni solishtiring</h2>
            <p>Daromaddan sof foydagacha bo‘lgan barcha ayirmalar.</p>
          </div>
        </div>
        <div className={styles.uzumBadge}>
          <WalletCards aria-hidden="true" />
          <span>
            <small>Uzumdagi “Foyda”</small>
            <strong>{formatSum(uzumProfit)}</strong>
          </span>
        </div>
      </header>

      <ol className={styles.reconcileList}>
        {steps.map((step, index) => (
          <li
            key={step.label}
            className={cn(
              styles.reconcileRow,
              step.kind === "subtotal" && styles.reconcileSubtotal,
              step.kind === "result" && styles.reconcileResult,
              step.kind === "result" && !isProfit && styles.reconcileLoss
            )}
          >
            <span className={styles.stepMarker}>
              {step.kind === "minus" ? (
                <Minus aria-hidden="true" />
              ) : step.kind === "result" ? (
                <Check aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
            <span className={styles.stepCopy}>
              <strong>{step.label}</strong>
              <small>{step.note}</small>
            </span>
            <strong className={styles.stepValue}>{formatSum(step.value)}</strong>
          </li>
        ))}
      </ol>

      <div className={styles.syncNote}>
        <Clock3 aria-hidden="true" />
        <span>
          Sotuvlar Uzumdan har 20 daqiqada yangilanadi. Shu sabab bugungi raqamda
          kichik vaqtinchalik farq bo‘lishi mumkin.
        </span>
      </div>
    </section>
  );
}
