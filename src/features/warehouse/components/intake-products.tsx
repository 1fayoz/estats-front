"use client";
import { Pagination, usePagination } from "@/components/ui/pagination";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Info, Layers, Package, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatNumber, formatSum } from "@/lib/format";
import type { IntakeProductMoney } from "@/lib/types";
import { cn } from "@/lib/utils";

type Filter = "all" | "sold" | "unsold" | "no_intake";
type Sort = "gross" | "profit" | "sold" | "stock";

const SORTERS: Record<Sort, (row: IntakeProductMoney) => number> = {
  gross: (row) => row.gross,
  profit: (row) => row.profit ?? Number.NEGATIVE_INFINITY,
  sold: (row) => row.soldQuantity,
  stock: (row) => row.onHand,
};

/**
 * Kirimlar sahifasidagi «Tovarlar bo'yicha» hisob — butun davr.
 *
 * Partiyalar ro'yxati «qaysi kirim qanday ketdi» degan savolga javob
 * beradi; sotuvchi esa ko'pincha boshqasini so'raydi: shu tovarga
 * jami qancha pul sarfladim, nechtasi keldi, nechtasi sotildi va
 * necha pulga. Bir tovarning bir necha partiyasi bo'lsa, bu javob
 * partiyalar ro'yxatidan qo'lda qo'shib chiqilardi.
 */
export function IntakeProducts({ products }: { products: IntakeProductMoney[] }) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [sort, setSort] = React.useState<Sort>("gross");

  const rows = React.useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    const pick = SORTERS[sort];
    return products
      .filter((row) => {
        if (filter === "sold" && row.soldQuantity <= 0) return false;
        if (filter === "unsold" && row.soldQuantity > 0) return false;
        if (filter === "no_intake" && !(row.intakeQuantity === 0 && row.soldQuantity > 0)) return false;
        return !search || [row.title, row.skuCode].some((value) => value?.toLocaleLowerCase().includes(search));
      })
      .sort((first, second) => pick(second) - pick(first) || second.intakeCost - first.intakeCost);
  }, [products, query, filter, sort]);
  const { page, setPage, pageItems: pageRows } = usePagination(rows, {
    resetKey: [query, filter, sort],
    param: "products_page",
  });

  const sum = React.useMemo(() => rows.reduce(
    (acc, row) => ({
      intakeQuantity: acc.intakeQuantity + row.intakeQuantity,
      intakeCost: acc.intakeCost + row.intakeCost,
      soldQuantity: acc.soldQuantity + row.soldQuantity,
      onHand: acc.onHand + row.onHand,
      gross: acc.gross + row.gross,
      revenue: acc.revenue + row.revenue,
      profit: acc.profit + (row.profit ?? 0),
    }),
    { intakeQuantity: 0, intakeCost: 0, soldQuantity: 0, onHand: 0, gross: 0, revenue: 0, profit: 0 },
  ), [rows]);

  const noIntake = products.filter((row) => row.intakeQuantity === 0 && row.soldQuantity > 0).length;
  const customized = Boolean(query.trim()) || filter !== "all" || sort !== "gross";
  const reset = () => { setQuery(""); setFilter("all"); setSort("gross"); };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-labelledby="intake-products-title">
      <div className="border-b p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <h2 id="intake-products-title" className="font-semibold">Tovarlar bo&apos;yicha</h2>
            <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">{formatNumber(products.length)}</span>
          </div>
          {noIntake > 0 && (
            <button type="button" onClick={() => setFilter("no_intake")} className="flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs font-medium text-[color:var(--warn)] hover:underline">
              <AlertTriangle className="size-3.5" /> {formatNumber(noIntake)} ta tovarga kirim kiritilmagan
            </button>
          )}
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Tovarlarni qidirish"
              placeholder="Tovar yoki SKU..."
              className="h-11 rounded-xl pl-10 pr-11 text-base md:text-sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && <Button variant="ghost" size="icon" className="absolute right-0 top-0 size-11 rounded-xl" aria-label="Qidiruvni tozalash" onClick={() => setQuery("")}><X /></Button>}
          </div>
          <select aria-label="Tovarlarni filtrlash" value={filter} onChange={(event) => setFilter(event.target.value as Filter)} className="h-11 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="all">Barcha tovarlar</option>
            <option value="sold">Sotilganlar</option>
            <option value="unsold">Hali sotilmaganlar</option>
            <option value="no_intake">Kirim kiritilmaganlar</option>
          </select>
          <select aria-label="Tovarlarni saralash" value={sort} onChange={(event) => setSort(event.target.value as Sort)} className="h-11 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="gross">Sotuv summasi ↓</option>
            <option value="profit">Sof foyda ↓</option>
            <option value="sold">Sotilgan soni ↓</option>
            <option value="stock">Qoldiq ↓</option>
          </select>
        </div>
        {customized && (
          <div className="mt-3 flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <p role="status">{formatNumber(products.length)} ta tovardan {formatNumber(rows.length)} tasi</p>
            <Button variant="ghost" className="h-11 rounded-xl px-3 text-xs" onClick={reset}><X /> Filtrlarni tozalash</Button>
          </div>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center px-5 py-14 text-center">
          <Search className="mb-4 size-8 text-muted-foreground/60" />
          <h3 className="font-semibold">Mos tovar topilmadi</h3>
          <Button variant="outline" className="mt-5 h-11 rounded-xl" onClick={reset}>Filtrlarni tozalash</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-3 bg-muted/20 p-3 md:grid-cols-2 xl:hidden">
            {pageRows.map((row) => (
              <article key={row.warehouseProductId ?? "orphan"} className="min-w-0 rounded-2xl border bg-card p-4">
                <Identity row={row} />
                <dl className="my-4 grid grid-cols-3 gap-x-3 gap-y-3 border-y py-3">
                  <Detail label="Keldi" value={`${formatNumber(row.intakeQuantity)} dona`} />
                  <Detail label="Sotildi" value={`${formatNumber(row.soldQuantity)} dona`} hint={row.inTransitQuantity ? `${formatNumber(row.inTransitQuantity)} tasi yo'lda` : undefined} />
                  <Detail label="Qoldi" value={`${formatNumber(row.onHand)} dona`} />
                </dl>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <Detail label="Sarflangan" value={row.intakeQuantity ? formatSum(row.intakeCost) : "—"} />
                  <Detail label="Sotilgan summa" value={formatSum(row.gross)} hint={row.revenue ? `Uzum to'lovi ${formatSum(row.revenue)}` : undefined} />
                </dl>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-3">
                  <span className="text-xs text-muted-foreground">Sof foyda</span>
                  <Profit value={row.profit} className="text-sm" />
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto xl:block">
            <table className="w-full min-w-[1000px] text-sm">
              <caption className="sr-only">Har bir tovar bo&apos;yicha kelgan, sotilgan soni va pul</caption>
              <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                <tr>
                  <th scope="col" className="px-5 py-3.5 text-left font-medium">Tovar</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Keldi</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Sotildi</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Qoldi</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Sarflangan</th>
                  <th scope="col" className="px-3 py-3.5 text-right font-medium">Sotilgan summa</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-medium">Sof foyda</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pageRows.map((row) => (
                  <tr key={row.warehouseProductId ?? "orphan"} className="transition-colors hover:bg-muted/25">
                    <td className="max-w-[340px] px-5 py-4"><Identity row={row} /></td>
                    <td className="px-3 py-4 text-right tabular-nums">{formatNumber(row.intakeQuantity)}</td>
                    <td className="px-3 py-4 text-right tabular-nums">
                      {formatNumber(row.soldQuantity)}
                      {row.inTransitQuantity > 0 && <div className="mt-1 whitespace-nowrap text-xs text-muted-foreground">{formatNumber(row.inTransitQuantity)} tasi yo&apos;lda</div>}
                    </td>
                    <td className="px-3 py-4 text-right tabular-nums">{formatNumber(row.onHand)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{row.intakeQuantity ? formatSum(row.intakeCost) : "—"}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">
                      <div className="font-semibold">{formatSum(row.gross)}</div>
                      {row.revenue > 0 && <div className="mt-1 text-xs text-muted-foreground">Uzum to&apos;lovi {formatSum(row.revenue)}</div>}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-right"><Profit value={row.profit} /></td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 bg-muted/30 font-semibold">
                <tr>
                  <th scope="row" className="px-5 py-4 text-left">Jami <span className="font-normal text-muted-foreground">· {formatNumber(rows.length)} ta tovar</span></th>
                  <td className="px-3 py-4 text-right tabular-nums">{formatNumber(sum.intakeQuantity)}</td>
                  <td className="px-3 py-4 text-right tabular-nums">{formatNumber(sum.soldQuantity)}</td>
                  <td className="px-3 py-4 text-right tabular-nums">{formatNumber(sum.onHand)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{formatSum(sum.intakeCost)}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">
                    <div>{formatSum(sum.gross)}</div>
                    <div className="mt-1 text-xs font-normal text-muted-foreground">Uzum to&apos;lovi {formatSum(sum.revenue)}</div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right"><Profit value={sum.profit} /></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-4 pb-3"><Pagination page={page} total={rows.length} onPage={setPage} label="Tovarlar sahifalari" /></div>

          <div className="border-t bg-muted/30 p-4 xl:hidden">
            <p className="mb-3 text-sm font-semibold">Jami <span className="font-normal text-muted-foreground">· {formatNumber(rows.length)} ta tovar</span></p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
              <Detail label="Keldi / sotildi / qoldi" value={`${formatNumber(sum.intakeQuantity)} / ${formatNumber(sum.soldQuantity)} / ${formatNumber(sum.onHand)}`} />
              <Detail label="Sarflangan" value={formatSum(sum.intakeCost)} />
              <Detail label="Sotilgan summa" value={formatSum(sum.gross)} />
              <div className="min-w-0"><dt className="text-xs text-muted-foreground">Sof foyda</dt><dd className="mt-1"><Profit value={sum.profit} className="text-sm" /></dd></div>
            </dl>
          </div>
        </>
      )}

      <p className="flex items-start gap-2.5 border-t px-4 py-3 text-xs leading-5 text-muted-foreground sm:px-5">
        <Info className="mt-0.5 size-4 shrink-0" />
        <span>
          Butun davr bo&apos;yicha. <b className="font-medium text-foreground">Sotilgan summa</b>{" — xaridor to'lagan narx. "}
          <b className="font-medium text-foreground">Sof foyda</b>{" — Uzum to'lovi (komissiya va logistikadan keyin) minus sotilgan donalarning tan narxi (FIFO). "}
          {"Kirim kiritilmagan donalarning tan narxi noma'lum, shuning uchun ular foydaga qo'shilmaydi. Yetkazilayotgan buyurtmalar ham sotilgan deb hisoblanadi."}
        </span>
      </p>
    </section>
  );
}

function Identity({ row }: { row: IntakeProductMoney }) {
  const noIntake = row.intakeQuantity === 0 && row.soldQuantity > 0;
  const title = row.warehouseProductId === null
    ? <span className="line-clamp-2 text-sm font-medium leading-5">{row.title}</span>
    : <Link href={`/warehouse/${row.warehouseProductId}`} className="line-clamp-2 text-sm font-medium leading-5 hover:text-[#00904d] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{row.title}</Link>;

  return (
    <div className="flex min-w-0 items-start gap-3">
      {row.image ? <img src={row.image} alt="" loading="lazy" className="size-12 shrink-0 rounded-xl border bg-white object-contain" /> : <div className="grid size-12 shrink-0 place-items-center rounded-xl border bg-muted/50"><Package className="size-5 text-muted-foreground" /></div>}
      <div className="min-w-0">
        {title}
        <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">
          SKU: {row.skuCode || "—"}{row.batches > 1 && ` · ${formatNumber(row.batches)} ta partiya`}
        </p>
        {/* Qator bitta JISMONIY tovar: Uzum'da u bir necha e'lon, kirim esa
            bitta — shuning uchun qator ham bitta. */}
        {row.stockGroupId !== null && row.productIds.length > 1 && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Layers className="size-3" /> {row.productIds.length} ta e&apos;lon · umumiy ombor
          </span>
        )}
        {(noIntake || row.uncoveredQuantity > 0) && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-[color:var(--warn)]">
            <AlertTriangle className="size-3" />
            {noIntake ? "Kirim kiritilmagan" : `${formatNumber(row.uncoveredQuantity)} dona kirimsiz sotilgan`}
          </span>
        )}
      </div>
    </div>
  );
}

function Profit({ value, className }: { value: number | null; className?: string }) {
  if (value === null) {
    return <span className={cn("text-muted-foreground", className)} title="Tan narx noma'lum — kirim kiritilmagan">—</span>;
  }
  return (
    <span className={cn("font-semibold tabular-nums", value > 0 && "text-[color:var(--ok)]", value < 0 && "text-[color:var(--bad)]", className)}>
      {formatSum(value)}
    </span>
  );
}

function Detail({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium tabular-nums [overflow-wrap:anywhere]">{value}</dd>
      {hint && <dd className="mt-0.5 text-xs text-muted-foreground">{hint}</dd>}
    </div>
  );
}
