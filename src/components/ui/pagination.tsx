"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatNumber } from "@/lib/format";
import { PAGE_SIZE, pageCount } from "@/lib/pagination";
import { cn } from "@/lib/utils";

export { PAGE_SIZE, pageCount };

// ── sahifa raqami manzilda ─────────────────────────────────────
//
// `?page=3` — yangilash, orqaga qaytish va havolani ulashishdan omon
// qoladi. `useSearchParams` ATAYLAB ishlatilmaydi: u sahifada Suspense
// chegarasini talab qiladi va usiz Next qurilishda yiqiladi — bu
// komponent esa o'nlab sahifaga qo'yiladi. Brauzerning o'z
// `history.replaceState` i yetadi (`product-modal.tsx` dagi naqsh).

function readPage(param: string): number {
  if (typeof window === "undefined") return 1;
  const raw = Number(new URLSearchParams(window.location.search).get(param));
  return Number.isInteger(raw) && raw > 0 ? raw : 1;
}

function writePage(param: string, page: number) {
  if (typeof window === "undefined") return;
  const search = new URLSearchParams(window.location.search);
  if (page <= 1) search.delete(param);
  else search.set(param, String(page));
  const query = search.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}

/**
 * Sahifa raqami — manzil bilan bog'langan.
 *
 * `resetKey` o'zgarsa (filtr, qidiruv, tab) 1-sahifaga qaytadi:
 * aks holda 4-sahifada turib qidiruv yozilsa, natija 1 sahifa bo'lib,
 * sotuvchi bo'sh jadvalni ko'rardi. Birinchi render'da ATAYLAB
 * qaytarilmaydi — manzildagi `?page=3` yangilashdan keyin saqlansin.
 *
 * `param` — bitta sahifada ikkita ro'yxat bo'lsa, ular bir-birining
 * sahifasini bosib ketmasligi uchun.
 */
export function usePageParam(
  resetKey: unknown = null,
  param = "page",
): [number, (page: number) => void] {
  const [page, setPageState] = React.useState(1);

  // Manzildan o'qish effektda: server render'da `window` yo'q va
  // hidratsiya mos kelmasligi kerak emas.
  React.useEffect(() => {
    setPageState(readPage(param));
  }, [param]);

  const setPage = React.useCallback(
    (next: number) => {
      const safe = Math.max(1, Math.floor(next));
      setPageState(safe);
      writePage(param, safe);
    },
    [param],
  );

  // Oldingi kalit bilan solishtiriladi, "birinchi render" belgisi bilan
  // emas: React Strict Mode effektni ikki marta yurgizadi va belgi
  // ikkinchi yurishda manzildagi `?page=3` ni jimgina 1 ga tushirardi.
  const key = JSON.stringify(resetKey ?? null);
  const previous = React.useRef(key);
  React.useEffect(() => {
    if (previous.current === key) return;
    previous.current = key;
    setPage(1);
  }, [key, setPage]);

  React.useEffect(() => {
    const onPop = () => setPageState(readPage(param));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [param]);

  return [page, setPage];
}

/**
 * Mijoz tomonidagi sahifalash — ro'yxat to'liq yuklangan bo'lsa.
 *
 * Qachon shu, qachon server: tovarlar, SEO, P&L kabi do'kon ichidagi
 * ro'yxatlar o'nlab-yuzlab qator va ularning ustida tab sonlari,
 * filtr va saralash MIJOZDA ishlaydi (hisob butun ro'yxatdan). Bunday
 * joyda serverdan 15 tadan olish tab sonlarini yolg'on qilardi.
 * Bozor ro'yxatlari esa yuz minglab qator — ular server tomonida
 * (`useServerPage`).
 *
 * Sahifa ro'yxatdan chetga chiqsa (filtr natijasi qisqardi) oxirgi
 * mavjud sahifaga siljiydi, bo'sh sahifa ko'rsatilmaydi.
 */
export function usePagination<T>(
  items: readonly T[],
  options: { resetKey?: unknown; param?: string; size?: number } = {},
) {
  const size = options.size ?? PAGE_SIZE;
  const [page, setPage] = usePageParam(options.resetKey, options.param);
  const pages = pageCount(items.length, size);
  const current = Math.min(page, pages);
  const pageItems = React.useMemo(
    () => items.slice((current - 1) * size, current * size),
    [items, current, size],
  );
  return { page: current, pages, setPage, pageItems, total: items.length, size };
}

/** Server tomonidagi sahifalash — `offset`/`limit` so'rovga ketadi. */
export function useServerPage(
  options: { resetKey?: unknown; param?: string; size?: number } = {},
) {
  const size = options.size ?? PAGE_SIZE;
  const [page, setPage] = usePageParam(options.resetKey, options.param);
  return { page, setPage, size, offset: (page - 1) * size, limit: size };
}

/** Ko'rsatiladigan raqamlar: 1 … 4 5 6 … 20 */
function pageWindow(page: number, pages: number): (number | "gap")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const out: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) out.push("gap");
  for (let i = start; i <= end; i += 1) out.push(i);
  if (end < pages - 1) out.push("gap");
  out.push(pages);
  return out;
}

/**
 * Sahifalash tugmalari.
 *
 * Bitta sahifaga sig'sa umuman chizilmaydi — "1 / 1" tugmalari joy
 * yeydi va hech narsa qilmaydi. Tugmalar kamida 44px (barmoq bilan
 * bosiladigan o'lcham) va telefonda raqamlar yashirilib faqat
 * oldinga/orqaga qoladi.
 */
export function Pagination({
  page,
  total,
  onPage,
  size = PAGE_SIZE,
  className,
  label = "Sahifalar",
}: {
  page: number;
  total: number;
  onPage: (page: number) => void;
  size?: number;
  className?: string;
  label?: string;
}) {
  const pages = pageCount(total, size);
  if (total <= size) return null;
  const current = Math.min(Math.max(1, page), pages);
  const from = (current - 1) * size + 1;
  const to = Math.min(current * size, total);

  const go = (next: number) => {
    const target = Math.min(Math.max(1, next), pages);
    if (target !== current) onPage(target);
  };

  const base =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-2 text-sm tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      aria-label={label}
      className={cn("flex flex-wrap items-center justify-between gap-2 pt-3", className)}
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {formatNumber(from)}–{formatNumber(to)} / {formatNumber(total)}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(base, "hover:bg-muted")}
          onClick={() => go(current - 1)}
          disabled={current <= 1}
          aria-label="Oldingi sahifa"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-2 text-sm tabular-nums sm:hidden">
          {current} / {pages}
        </span>
        {pageWindow(current, pages).map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="hidden px-1 text-muted-foreground sm:inline" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => go(item)}
              aria-current={item === current ? "page" : undefined}
              className={cn(
                base,
                "hidden sm:inline-flex",
                item === current
                  ? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          className={cn(base, "hover:bg-muted")}
          onClick={() => go(current + 1)}
          disabled={current >= pages}
          aria-label="Keyingi sahifa"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}
