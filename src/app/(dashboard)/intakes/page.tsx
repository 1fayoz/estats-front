"use client";
import { Pagination, usePagination } from "@/components/ui/pagination";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowDownToLine, ArrowUpRight, Banknote, Boxes, CalendarDays, Check, Info, Layers, Loader2, Package, PackagePlus, Search, ShoppingBag, Trash2, TrendingUp, Wallet, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { IntakeProducts } from "@/features/warehouse/components/intake-products";
import { InventoryHeader, InventoryStat } from "@/features/warehouse/components/inventory-workspace";
import { ApiError, deleteIntake, fetchIntakeMoney, fetchIntakes } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import type { IntakeBatchMoney, IntakeMoney, IntakeRow } from "@/lib/types";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { cn } from "@/lib/utils";

type StockFilter = "all" | "remaining" | "sold";
type DateOrder = "newest" | "oldest";

function intakeDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-");
  return day && month && year ? `${day}.${month}.${year}` : "—";
}

export default function IntakesPage() {
  const [rows, setRows] = React.useState<IntakeRow[]>([]);
  // Sotuv summasi va foyda — alohida so'rov, `pnl.view` ruxsati bilan.
  // `null` — ruxsat yo'q (403) yoki eski backend (404): pul bloklari
  // jimgina yashiriladi, kirimlar ro'yxati esa odatdagidek ishlaydi.
  const [money, setMoney] = React.useState<IntakeMoney | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<IntakeRow | null>(null);
  const [query, setQuery] = React.useState("");
  const [stock, setStock] = React.useState<StockFilter>("all");
  const [order, setOrder] = React.useState<DateOrder>("newest");
  const requestVersion = React.useRef(0);
  const deleting = React.useRef(false);
  const cancelDelete = React.useRef<HTMLButtonElement>(null);

  const load = React.useCallback(async () => {
    if (deleting.current) return;
    const version = ++requestVersion.current;
    setLoading(true);
    try {
      const [nextRows, nextMoney] = await Promise.all([
        fetchIntakes(),
        fetchIntakeMoney().catch((err) =>
          // Vaqtinchalik xatoda eski raqamlar qoladi (`undefined`); faqat
          // ruxsat yo'qligi yoki eski backend bloklarni yopadi. Eski backend
          // 404 emas, 405 beradi: yo'l `/intakes/{batch_id}` (PATCH/DELETE)
          // ga mos keladi — lokal sinovda shunday chiqdi.
          err instanceof ApiError && [403, 404, 405].includes(err.status) ? null : undefined
        ),
      ]);
      if (version !== requestVersion.current) return;
      setRows(nextRows);
      if (nextMoney !== undefined) setMoney(nextMoney);
      setError(null);
    } catch (err) {
      if (version === requestVersion.current) {
        setError(err instanceof Error ? err.message : "Kirimlarni yuklab bo'lmadi");
      }
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  const onDelete = async () => {
    if (!deleteTarget || deleting.current) return;
    deleting.current = true;
    requestVersion.current += 1;
    setLoading(false);
    setRemoving(true);
    try {
      await deleteIntake(deleteTarget.id);
      setRows((previous) => previous.filter((row) => row.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success("Kirim o'chirildi — hisob-kitob qayta hisoblandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirib bo'lmadi");
    } finally {
      deleting.current = false;
      setRemoving(false);
    }
    // Kirim o'chsa FIFO qayta hisoblanadi — sotilgan summa va foyda ham o'zgaradi.
    void load();
  };

  const totals = React.useMemo(
    () => ({
      count: rows.length,
      quantity: rows.reduce((sum, row) => sum + row.quantity, 0),
      cost: rows.reduce((sum, row) => sum + row.totalCost, 0),
      remaining: rows.reduce((sum, row) => sum + row.remainingQuantity, 0),
    }),
    [rows]
  );
  const batchMoney = React.useMemo(
    () => new Map((money?.batches ?? []).map((batch) => [batch.id, batch])),
    [money]
  );
  const moneyTotals = money?.totals;

  const filteredRows = React.useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      if (stock === "remaining" && row.remainingQuantity <= 0) return false;
      if (stock === "sold" && row.remainingQuantity !== 0) return false;
      return !search || [row.title, row.skuCode, row.supplier, row.reference]
        .some((value) => value?.toLocaleLowerCase().includes(search));
    }).sort((first, second) => {
      const difference = new Date(second.receivedAt).getTime() - new Date(first.receivedAt).getTime();
      return order === "newest" ? difference || second.id - first.id : -difference || first.id - second.id;
    });
  }, [rows, query, stock, order]);
  const { page, setPage, pageItems: pageRows } = usePagination(filteredRows, {
    resetKey: [query, stock, order],
  });

  const initialLoading = loading && rows.length === 0;
  const unavailable = Boolean(error) && rows.length === 0;
  const customized = Boolean(query.trim()) || stock !== "all" || order !== "newest";
  const resetFilters = () => {
    setQuery("");
    setStock("all");
    setOrder("newest");
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <InventoryHeader
        active="intakes"
        actions={
          <Button asChild className="h-11 w-full rounded-xl bg-[#00904d] px-5 text-white hover:bg-[#007a41] sm:w-auto">
            <Link href="/warehouse"><PackagePlus /> Yangi kirim</Link>
          </Button>
        }
      />

      {moneyTotals && !unavailable ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          <InventoryStat icon={ArrowDownToLine} label="Jami keldi" value={`${formatNumber(moneyTotals.intakeQuantity)} dona`} hint={`${formatNumber(moneyTotals.batches)} ta partiya · ${formatNumber(moneyTotals.products)} ta tovar`} />
          <InventoryStat icon={ShoppingBag} label="Jami sotildi" value={`${formatNumber(moneyTotals.soldQuantity)} dona`} hint={soldHint(moneyTotals.inTransitQuantity, moneyTotals.uncoveredQuantity)} />
          <InventoryStat icon={Package} label="Qoldi" value={`${formatNumber(moneyTotals.onHand)} dona`} hint={`Tan narx bo'yicha qiymati ${formatSum(moneyTotals.stockValue)}`} />
          <InventoryStat icon={Wallet} label="Jami sarflangan" value={formatSum(moneyTotals.intakeCost)} hint={`Sotilganlarining tan narxi ${formatSum(moneyTotals.cogs)}`} />
          <InventoryStat icon={Banknote} label="Sotilgan summa" value={formatSum(moneyTotals.gross)} hint={`Uzum to'lovi ${formatSum(moneyTotals.revenue)}`} />
          <InventoryStat icon={TrendingUp} label="Sof foyda" value={formatSum(moneyTotals.profit)} hint={moneyTotals.uncoveredQuantity ? `Kirimsiz ${formatNumber(moneyTotals.uncoveredQuantity)} dona hisobga olinmagan` : "Uzum to'lovi − tan narx"} tone={moneyTotals.uncoveredQuantity ? "warning" : "default"} />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <InventoryStat icon={Boxes} label="Partiyalar" value={unavailable ? "—" : `${formatNumber(totals.count)} ta`} hint="Barcha kirimlar" loading={initialLoading} />
          <InventoryStat icon={ArrowDownToLine} label="Jami kelgan" value={unavailable ? "—" : formatNumber(totals.quantity)} hint="dona mahsulot" loading={initialLoading} />
          <InventoryStat icon={Wallet} label="Jami sarflangan" value={unavailable ? "—" : formatSum(totals.cost)} hint="Kirimlar qiymati" loading={initialLoading} />
          <InventoryStat icon={Package} label="Sotilmagan qoldiq" value={unavailable ? "—" : formatNumber(totals.remaining)} hint="dona mahsulot" loading={initialLoading} />
        </div>
      )}

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 text-sm">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div><p className="font-medium">Kirimlarni yangilab bo&apos;lmadi</p><p className="mt-1 text-muted-foreground">{error}</p></div>
          </div>
          <Button variant="outline" className="h-11 shrink-0 rounded-xl" disabled={loading} onClick={() => void load()}>
            {loading && <Loader2 className="animate-spin" />} Qayta urinish
          </Button>
        </div>
      )}

      {money && money.products.length > 0 && <IntakeProducts products={money.products} />}

      <section className="overflow-hidden rounded-2xl border bg-card shadow-sm" aria-labelledby="intake-list-title" aria-busy={loading}>
        <div className="border-b p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <h2 id="intake-list-title" className="font-semibold">Kirim tarixi</h2>
              {!initialLoading && !unavailable && <span className="rounded-lg bg-muted px-2 py-0.5 text-xs font-medium tabular-nums">{formatNumber(rows.length)}</span>}
            </div>
            {loading && !initialLoading && <span role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground"><Loader2 className="size-3.5 animate-spin" /> Yangilanmoqda</span>}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-muted-foreground" />
              <Input
                aria-label="Kirimlarni qidirish"
                placeholder="Tovar, SKU, yetkazib beruvchi..."
                className="h-11 rounded-xl pl-10 pr-11 text-base md:text-sm"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query && <Button variant="ghost" size="icon" className="absolute right-0 top-0 size-11 rounded-xl" aria-label="Qidiruvni tozalash" onClick={() => setQuery("")}><X /></Button>}
            </div>
            <select aria-label="Qoldiq bo'yicha filtrlash" value={stock} onChange={(event) => setStock(event.target.value as StockFilter)} className="h-11 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="all">Barcha partiyalar</option>
              <option value="remaining">Qoldig'i bor</option>
              <option value="sold">Tugagan partiyalar</option>
            </select>
            <select aria-label="Sana bo'yicha tartiblash" value={order} onChange={(event) => setOrder(event.target.value as DateOrder)} className="h-11 min-w-0 rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="newest">Avval yangilari</option>
              <option value="oldest">Avval eskilari</option>
            </select>
          </div>
          {!initialLoading && !unavailable && (
            <div className="mt-3 flex min-h-7 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <p role="status">{customized ? `${formatNumber(rows.length)} ta partiyadan ${formatNumber(filteredRows.length)} tasi` : `${formatNumber(rows.length)} ta partiya ko'rsatilmoqda`}</p>
              {customized && <Button variant="ghost" className="h-11 rounded-xl px-3 text-xs" onClick={resetFilters}><X /> Filtrlarni tozalash</Button>}
            </div>
          )}
        </div>

        {initialLoading ? (
          <div className="space-y-3 p-4 sm:p-5" role="status" aria-label="Kirimlar yuklanmoqda">
            {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
          </div>
        ) : unavailable ? (
          <div className="px-5 py-14 text-center text-sm text-muted-foreground">Ma&apos;lumotlarni olish uchun qayta urinib ko&apos;ring.</div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <div className="mb-4 grid size-14 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><PackagePlus className="size-7" /></div>
            <h3 className="font-semibold">Birinchi kirimni qo&apos;shing</h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Ombordan tovarni tanlang va nechta, qanchadan kelganini kiriting. Har bir partiya shu yerda ko&apos;rinadi.</p>
            <Button asChild className="mt-5 h-11 rounded-xl bg-[#00904d] text-white hover:bg-[#007a41]"><Link href="/warehouse">Omborga o&apos;tish <ArrowUpRight /></Link></Button>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="flex flex-col items-center px-5 py-14 text-center">
            <Search className="mb-4 size-8 text-muted-foreground/60" />
            <h3 className="font-semibold">Mos kirim topilmadi</h3>
            <p className="mt-2 text-sm text-muted-foreground">Boshqa so&apos;z bilan qidiring yoki filtrlarni tozalang.</p>
            <Button variant="outline" className="mt-5 h-11 rounded-xl" onClick={resetFilters}>Filtrlarni tozalash</Button>
          </div>
        ) : (
          <>
            <div className="grid gap-3 bg-muted/20 p-3 md:grid-cols-2 xl:hidden">
              {pageRows.map((row) => (
                <article key={row.id} className="min-w-0 rounded-2xl border bg-card p-4">
                  <ProductIdentity row={row} />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="size-3.5" />{intakeDate(row.receivedAt)}</span>
                    <IntakeStatus row={row} />
                  </div>
                  <dl className="my-4 grid grid-cols-2 gap-x-4 gap-y-3">
                    <IntakeDetail label="Keldi" value={`${formatNumber(row.quantity)} dona`} />
                    <IntakeDetail label="Tan narxi / dona" value={formatSum(row.costPrice)} />
                    <IntakeDetail label="Sotildi" value={`${formatNumber(row.soldQuantity)} dona`} />
                    <IntakeDetail label="Qoldi" value={`${formatNumber(row.remainingQuantity)} dona`} />
                  </dl>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-muted/50 px-3 py-3">
                    <span className="text-xs text-muted-foreground">Sarflangan</span>
                    <span className="text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">{formatSum(row.totalCost)}</span>
                  </div>
                  {batchMoney.has(row.id) && <BatchMoneyDetails money={batchMoney.get(row.id)!} />}
                  <dl className="mt-4 space-y-2 text-xs">
                    <div className="flex justify-between gap-4"><dt className="shrink-0 text-muted-foreground">Yetkazib beruvchi</dt><dd className="text-right [overflow-wrap:anywhere]">{row.supplier || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="shrink-0 text-muted-foreground">Hujjat</dt><dd className="text-right [overflow-wrap:anywhere]">{row.reference || "—"}</dd></div>
                  </dl>
                  <div className="mt-3 flex justify-end border-t pt-2">
                    <Button variant="ghost" className="h-11 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive" disabled={removing} onClick={() => setDeleteTarget(row)} aria-label={`${row.title} kirimini o'chirish`}><Trash2 /> O&apos;chirish</Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden overflow-x-auto xl:block">
              <table className={cn("w-full text-sm", money ? "min-w-[1040px]" : "min-w-[900px]")}>
                <caption className="sr-only">Tovar kirimlari, narxlari va qoldiqlari</caption>
                <thead className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 text-left font-medium">Tovar / sana</th>
                    <th scope="col" className="px-3 py-3.5 text-right font-medium">Keldi</th>
                    <th scope="col" className="px-3 py-3.5 text-right font-medium">Tan narxi</th>
                    <th scope="col" className="px-3 py-3.5 text-right font-medium">Sarflangan</th>
                    <th scope="col" className="px-3 py-3.5 text-left font-medium">Sotildi / qoldi</th>
                    {money && <th scope="col" className="px-3 py-3.5 text-right font-medium">Sotilgan summa</th>}
                    <th scope="col" className="px-3 py-3.5 text-left font-medium">Yetkazib beruvchi</th>
                    <th scope="col" className="px-3 py-3.5"><span className="sr-only">Amallar</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {pageRows.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-muted/25">
                      <td className="max-w-[320px] px-5 py-4"><ProductIdentity row={row} /><div className="mt-1.5 pl-[60px] text-xs text-muted-foreground">{intakeDate(row.receivedAt)}</div></td>
                      <td className="px-3 py-4 text-right tabular-nums">{formatNumber(row.quantity)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums">{formatSum(row.costPrice)}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-right font-semibold tabular-nums">{formatSum(row.totalCost)}</td>
                      <td className="px-3 py-4"><div className="mb-2 whitespace-nowrap tabular-nums">{formatNumber(row.soldQuantity)} <span className="text-muted-foreground">/</span> {formatNumber(row.remainingQuantity)}</div><IntakeStatus row={row} /></td>
                      {money && <td className="whitespace-nowrap px-3 py-4 text-right tabular-nums"><BatchMoneyCell money={batchMoney.get(row.id)} /></td>}
                      <td className="max-w-[180px] px-3 py-4"><div className="break-words">{row.supplier || "—"}</div><div className="mt-1 break-words text-xs text-muted-foreground">{row.reference || "Hujjat kiritilmagan"}</div></td>
                      <td className="px-3 py-4"><Button variant="ghost" size="icon" className="size-11 rounded-xl text-muted-foreground hover:bg-destructive/5 hover:text-destructive" disabled={removing} onClick={() => setDeleteTarget(row)} aria-label={`${row.title} kirimini o'chirish`}><Trash2 /></Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-3"><Pagination page={page} total={filteredRows.length} onPage={setPage} label="Kirimlar sahifalari" /></div>
          </>
        )}
      </section>

      <p className="flex items-start gap-2.5 px-1 text-xs leading-5 text-muted-foreground"><Info className="mt-0.5 size-4 shrink-0" /><span>Har bir kirim alohida partiya. Sotuvlar eng eski partiyadan boshlab hisoblanadi (FIFO).</span></p>

      <Dialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !deleting.current) setDeleteTarget(null); }}>
        <DialogContent className={cn("max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 [&>button]:size-11 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:place-items-center", removing && "[&>button]:hidden")} onOpenAutoFocus={(event) => { event.preventDefault(); cancelDelete.current?.focus(); }}>
          <DialogHeader>
            <div className="mb-2 grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive"><Trash2 className="size-5" /></div>
            <DialogTitle className="pr-7">Kirim o&apos;chirilsinmi?</DialogTitle>
            <DialogDescription>Bu partiya o&apos;chiriladi va hisob-kitob qayta hisoblanadi. Amalni ortga qaytarib bo&apos;lmaydi.</DialogDescription>
          </DialogHeader>
          {deleteTarget && <div className="space-y-2 rounded-xl border bg-muted/30 p-4"><p className="text-sm font-medium [overflow-wrap:anywhere]">{deleteTarget.title}</p><p className="text-xs text-muted-foreground">{intakeDate(deleteTarget.receivedAt)} · {formatNumber(deleteTarget.quantity)} dona</p><p className="text-sm font-semibold tabular-nums [overflow-wrap:anywhere]">{formatSum(deleteTarget.totalCost)}</p></div>}
          <DialogFooter>
            <Button ref={cancelDelete} variant="outline" className="h-11 rounded-xl" disabled={removing} onClick={() => setDeleteTarget(null)}>Bekor qilish</Button>
            <Button variant="destructive" className="h-11 rounded-xl" disabled={removing} onClick={() => void onDelete()}>{removing ? <Loader2 className="animate-spin" /> : <Trash2 />}{removing ? "O'chirilmoqda..." : "Kirimni o'chirish"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductIdentity({ row }: { row: IntakeRow }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      {row.image ? <img src={row.image} alt="" loading="lazy" className="size-12 shrink-0 rounded-xl border bg-white object-contain" /> : <div className="grid size-12 shrink-0 place-items-center rounded-xl border bg-muted/50"><Package className="size-5 text-muted-foreground" /></div>}
      <div className="min-w-0">
        <Link href={`/warehouse/${row.warehouseProductId}`} className="line-clamp-2 text-sm font-medium leading-5 hover:text-[#00904d] hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{row.title}</Link>
        <p className="mt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">
          SKU: {row.skuCode || "—"}{row.variantName ? ` · ${row.variantName}` : ""}
        </p>
        {/* Partiya qaysi e'londa kiritilgan bo'lsa o'sha yerda qoladi, lekin
            «bir xil tovar» guruhida uni hamma e'lon birga sotadi. */}
        {row.stockGroupId !== null && (
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[11px] text-muted-foreground">
            <Layers className="size-3" /> umumiy ombor
          </span>
        )}
      </div>
    </div>
  );
}

function IntakeStatus({ row }: { row: IntakeRow }) {
  const exhausted = row.remainingQuantity === 0;
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium", exhausted ? "bg-muted text-muted-foreground" : "bg-emerald-500/10 text-foreground")}>{exhausted ? <Check className="size-3" /> : <span className="size-1.5 rounded-full bg-[color:var(--ok)]" />}{exhausted ? "Tugagan" : "Qoldig'i bor"}</span>;
}

function soldHint(inTransit: number, uncovered: number) {
  const parts = [];
  if (inTransit) parts.push(`${formatNumber(inTransit)} tasi yetkazilmoqda`);
  if (uncovered) parts.push(`${formatNumber(uncovered)} tasiga kirim kiritilmagan`);
  return parts.length ? `Shundan ${parts.join(", ")}` : "Butun davr bo'yicha";
}

function ProfitText({ value }: { value: number }) {
  return <span className={cn("tabular-nums", value > 0 && "text-[color:var(--ok)]", value < 0 && "text-[color:var(--bad)]")}>{formatSum(value)}</span>;
}

function BatchMoneyCell({ money }: { money?: IntakeBatchMoney }) {
  if (!money || money.soldQuantity === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <>
      <div className="font-semibold">{formatSum(money.gross)}</div>
      <div className="mt-1 text-xs text-muted-foreground">foyda <ProfitText value={money.profit} /></div>
    </>
  );
}

function BatchMoneyDetails({ money }: { money: IntakeBatchMoney }) {
  if (money.soldQuantity === 0) return null;
  return (
    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border px-3 py-3">
      <IntakeDetail label="Sotilgan summa" value={formatSum(money.gross)} />
      <div className="min-w-0"><dt className="text-xs text-muted-foreground">Sof foyda</dt><dd className="mt-1 text-sm font-medium"><ProfitText value={money.profit} /></dd></div>
    </dl>
  );
}

function IntakeDetail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium tabular-nums [overflow-wrap:anywhere]">{value}</dd></div>;
}
