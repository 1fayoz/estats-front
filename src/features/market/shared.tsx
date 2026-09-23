"use client";
import { Pagination, usePagination } from "@/components/ui/pagination";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, Inbox, LoaderCircle } from "lucide-react";

import { formatCompact, formatNumber, formatPercent } from "@/lib/format";
import type { MarketScorecard } from "@/lib/market";
import { cn } from "@/lib/utils";

/*
  Bozor modulining umumiy qismlari.
 
  Alohida `Table` komponenti YOZILMADI: kabinetda jadval uslubi
  `globals.css` dagi `.air-table` da turadi va uni komponentga
  o'rash faqat bitta qatlam qo'shadi. Bu yerda faqat shu modulga
  xos narsalar — davr tanlash, o'sish belgisi, kartochka.
*/

// ── Davr ────────────────────────────────────────────────────────
//
// Tanlov URL'da turadi, komponent holatida emas: shunda sahifa
// havolasi tanlangan davr bilan birga ulashiladi va brauzerning
// "orqaga" tugmasi kutilganidek ishlaydi.

const PERIODS = [1, 7, 14, 30, 90, 365];
const LABELS: Record<number, string> = {
  1: "1 kun", 7: "7 kun", 14: "14 kun", 30: "30 kun", 90: "90 kun", 365: "1 yil",
  3650: "Barchasi",
};

export function usePeriod(defaultDays = 30): number {
  const params = useSearchParams();
  const days = Number(params.get("days") ?? defaultDays);
  return Number.isFinite(days) && days > 0 ? days : defaultDays;
}

export function PeriodPicker({
  periods = PERIODS,
  defaultDays = 30,
}: {
  periods?: number[];
  defaultDays?: number;
} = {}) {
  const router = useRouter();
  const params = useSearchParams();
  const current = usePeriod(defaultDays);

  return (
    <div className="flex flex-wrap gap-1.5">
      {periods.map((days) => (
        <button
          key={days}
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            next.set("days", String(days));
            router.push(`?${next.toString()}`);
          }}
          className={cn(
            "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
            current === days
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-muted"
          )}
        >
          {LABELS[days] ?? `${days} kun`}
        </button>
      ))}
    </div>
  );
}

// ── O'sish ──────────────────────────────────────────────────────
//
// `null` — "solishtirib bo'lmadi" (oldingi davr nol) va u 0% dan
// BOSHQA narsa: 0% "o'zgarmadi", null esa "yangi". Ikkalasini bir
// xil ko'rsatish yangi tovarni "o'smagan" deb ko'rsatardi.

export function Growth({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined)
    return <span className="text-muted-foreground">yangi</span>;
  if (value === 0) return <span className="text-muted-foreground">0%</span>;
  const up = value > 0;
  return (
    <span className={up ? "air-ok" : "air-bad"}>
      {up ? "▲" : "▼"} {formatNumber(Math.abs(value))}%
    </span>
  );
}

// ── Katta raqam ─────────────────────────────────────────────────

export function Score({ card }: { card: MarketScorecard }) {
  // Qiymat TURIGA qarab formatlanadi: pul qisqartiriladi
  // ("49,8 mlrd"), foiz foiz bo'lib qoladi, oborot esa kasrli.
  // Bitta umumiy format uchalasini ham noto'g'ri ko'rsatardi.
  const text =
    card.value === null
      ? "—"
      : card.kind === "money"
        ? formatCompact(card.value)
        : card.kind === "percent"
          ? formatPercent(card.value)
          : card.kind === "float"
            ? formatNumber(Number(card.value.toFixed(2)))
            : formatNumber(card.value);

  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="text-[11px] text-muted-foreground">{card.label}</div>
      <div className="air-num mt-0.5 text-[22px] font-semibold leading-tight">{text}</div>
      <div className="mt-0.5 text-[11px]">
        <Growth value={card.growth} />
      </div>
    </div>
  );
}

// ── Holatlar ────────────────────────────────────────────────────

export function Loading({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-2xl border bg-card p-6 shadow-sm" role="status">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        </div>
        <div className="text-sm font-medium text-foreground">{label}</div>
      </div>
    </div>
  );
}

/** Ichki bloklar uchun sokin placeholder — sahifada qo‘shimcha spinner ko‘paytirmaydi. */
export function Pending({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div className="min-h-28 animate-pulse rounded-2xl border bg-muted/35" role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Failed({ message }: { message: string }) {
  // Xato MATNI ko'rsatiladi, yashirilmaydi. Eng ko'p uchraydigani —
  // Uzum tokenining muddati o'tgani, va foydalanuvchi buni bilsa
  // o'zi tuzatadi. "Nimadir xato ketdi" esa uni yordamga murojaat
  // qilishga majbur qiladi.
  return (
    <div className="flex items-start gap-3 rounded-2xl border bg-card p-4 text-sm shadow-sm" style={{ borderColor: "color-mix(in srgb, var(--bad) 28%, transparent)", color: "var(--bad)" }} role="alert">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: "color-mix(in srgb, var(--bad) 13%, transparent)" }}
      >
        <AlertTriangle className="size-4" aria-hidden="true" />
      </span>
      <div><div className="font-semibold">Ma’lumotni olib bo‘lmadi</div><div className="mt-0.5 opacity-80">{message}</div></div>
    </div>
  );
}

export function NoData({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
      <Inbox className="mx-auto mb-3 size-6 text-primary/65" aria-hidden="true" />
      <div className="font-medium text-foreground">{children}</div>
    </div>
  );
}

// ── Jadval ──────────────────────────────────────────────────────

export type Column<T> = {
  key: string;
  label: string;
  align?: "left" | "right";
  render: (row: T) => React.ReactNode;
};

export function Grid<T>({
  columns,
  rows,
  rowKey,
  empty,
  visible,
  pageParam,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => React.Key;
  empty?: React.ReactNode;
  /** Ko'rinadigan ustunlar. Berilmasa — hammasi. */
  visible?: Set<string>;
  /**
   * Berilsa — jadval o'zi 15 tadan sahifalaydi (manzilda shu nom bilan).
   * Ro'yxat sahifalari (`/market/products` va h.k.) buni BERMAYDI: ular
   * serverdan allaqachon bitta sahifani oladi. Detal sahifalardagi
   * to'liq yuklangan jadvallar (kunlik tarix, SKU'lar) uchun.
   */
  pageParam?: string;
}) {
  // Hook shartsiz chaqiriladi (qoida); `pageParam` bo'lmasa natijasi
  // ishlatilmaydi va manzilga hech narsa yozilmaydi.
  const paged = usePagination(rows, { param: pageParam ?? "grid_page" });
  const shownRows = pageParam ? paged.pageItems : rows;
  // Filtrlash RENDERDAN oldin: yashirilgan ustun umuman
  // chizilmaydi. `display: none` bilan yashirish 500 qatorli
  // jadvalda ham DOM tugunini yaratib turardi.
  const shown = visible ? columns.filter((c) => visible.has(c.key)) : columns;
  if (!rows.length) return <NoData>{empty ?? "Ma'lumot yo'q"}</NoData>;
  return (
    // Jadval O'Z idishida gorizontal aylanadi — sahifa tanasi
    // hech qachon yonga siljimaydi. Telefonda yagona to'g'ri
    // yechim shu: 12 ustunli jadvalni 390px ga siqib bo'lmaydi.
    <div className="air-table-wrap border">
      <table className="air-table">
        <thead>
          <tr>
            {shown.map((c) => (
              <th key={c.key} style={{ textAlign: c.align ?? "right" }}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shownRows.map((row, index) => (
            <tr key={rowKey(row, index)}>
              {shown.map((c) => (
                <td key={c.key} style={{ textAlign: c.align ?? "right" }}>
                  {c.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {pageParam && (
        <div className="px-3 pb-2">
          <Pagination page={paged.page} total={rows.length} onPage={paged.setPage} />
        </div>
      )}
    </div>
  );
}
