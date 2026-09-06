"use client";

import { ArrowDownToLine, CalendarDays, PackagePlus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatNumber, formatSum } from "@/lib/format";
import type { Intake, SalesPeriod } from "@/lib/types";

export function DetailIntakes({ intakes, onAdd }: { intakes: Intake[]; onAdd: () => void }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div><h2 className="flex items-center gap-2 text-base font-semibold"><ArrowDownToLine className="size-4 text-primary" /> Kirim partiyalari <span className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">{intakes.length}</span></h2><p className="mt-1.5 text-xs text-muted-foreground">Har bir partiyaning tan narxi va qolgan miqdori.</p></div>
        <Button variant="outline" className="min-h-11 rounded-xl" onClick={onAdd}><PackagePlus /> Kirim qo‘shish</Button>
      </header>
      {!intakes.length ? <div className="m-4 mt-0 rounded-xl border border-dashed px-4 py-8 text-center sm:m-5 sm:mt-0"><ArrowDownToLine className="mx-auto size-7 text-muted-foreground" /><p className="mt-3 text-sm font-medium">Hali kirim kiritilmagan</p><p className="mt-1 text-xs text-muted-foreground">Birinchi kirimdan keyin tan narx va foyda hisoblanadi.</p></div> : <>
        <div className="space-y-3 px-4 pb-4 md:hidden">
          {intakes.map((intake) => <div key={intake.id} className="rounded-xl border p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-sm font-medium"><CalendarDays className="size-3.5 text-muted-foreground" />{intake.receivedAt.slice(0, 10)}</span><span className={cn("rounded-md px-2 py-1 text-xs", intake.remainingQuantity === 0 ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>{intake.remainingQuantity === 0 ? "Tugagan" : `${formatNumber(intake.remainingQuantity)} dona qoldi`}</span></div>
            <p className="mt-2 break-words text-xs text-muted-foreground">{intake.supplier ?? "Yetkazib beruvchi ko‘rsatilmagan"}</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 border-t pt-3"><LedgerValue label="Keldi" value={`${formatNumber(intake.quantity)} dona`} /><LedgerValue label="Sotildi" value={`${formatNumber(intake.soldQuantity)} dona`} /><LedgerValue label="Tan narx / dona" value={formatSum(intake.costPrice)} /><LedgerValue label="Jami qiymat" value={formatSum(intake.costPrice * intake.quantity)} /></dl>
          </div>)}
        </div>
        <div className="hidden overflow-x-auto border-t md:block" role="region" aria-label="Kirim partiyalari jadvali" tabIndex={0}>
          <table className="w-full min-w-[620px] text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th>Sana</th><th className="text-right">Keldi</th><th className="text-right">Tan narx</th><th className="text-right">Sotildi / qoldi</th><th>Yetkazib beruvchi</th></tr></thead><tbody className="divide-y">
            {intakes.map((intake) => <tr key={intake.id} className="transition-colors hover:bg-muted/20"><td className="whitespace-nowrap font-medium">{intake.receivedAt.slice(0, 10)}</td><td className="text-right tabular-nums">{formatNumber(intake.quantity)}</td><td className="text-right tabular-nums">{formatSum(intake.costPrice)}</td><td className="text-right tabular-nums">{formatNumber(intake.soldQuantity)} / {formatNumber(intake.remainingQuantity)}{intake.remainingQuantity === 0 && <span className="ml-2 text-xs text-muted-foreground">Tugagan</span>}</td><td className="max-w-64 break-words text-muted-foreground">{intake.supplier ?? "—"}</td></tr>)}
          </tbody></table>
        </div>
      </>}
    </article>
  );
}

export function DetailSales({ rows, period, onPeriodChange }: { rows: SalesPeriod[]; period: string; onPeriodChange: (period: string) => void }) {
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
        <div><h2 className="flex items-center gap-2 text-base font-semibold"><ShoppingCart className="size-4 text-primary" /> Sotuvlar kesimi</h2><p className="mt-1.5 text-xs text-muted-foreground">Sotuv, tan narx va foydani davrlar bo‘yicha solishtiring.</p></div>
        <div role="group" aria-label="Sotuv hisoboti davri" className="flex rounded-xl border bg-muted/30 p-1">
          {[{ value: "daily", label: "Kunlik" }, { value: "monthly", label: "Oylik" }, { value: "yearly", label: "Yillik" }].map((item) => <Button key={item.value} variant="ghost" className={cn("min-h-11 rounded-lg px-3", period === item.value && "bg-background shadow-sm")} aria-pressed={period === item.value} onClick={() => onPeriodChange(item.value)}>{item.label}</Button>)}
        </div>
      </header>
      {!rows.length ? <div className="px-4 py-8 text-center"><ShoppingCart className="mx-auto size-7 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">Bu davr uchun sotuvlar yo‘q.</p></div> : <>
        <div className="space-y-3 px-4 pb-4 md:hidden">{rows.map((row) => <div key={row.period} className="rounded-xl border p-3.5"><div className="flex flex-wrap items-center justify-between gap-2"><span className="text-sm font-medium">{row.period}</span><span className={cn("text-sm font-semibold tabular-nums", row.profit >= 0 ? "text-[var(--ok)]" : "text-destructive")}>{formatSum(row.profit)}</span></div><p className="mt-1 text-xs text-muted-foreground">{formatNumber(row.soldQuantity)} dona sotildi</p><dl className="mt-3 grid grid-cols-2 gap-3 border-t pt-3"><LedgerValue label="O‘rtacha narx" value={formatSum(row.avgPrice)} /><LedgerValue label="Uzum to‘lovi" value={formatSum(row.revenue)} /><LedgerValue label="Tan narx" value={formatSum(row.cogs)} /><LedgerValue label="Foyda" value={formatSum(row.profit)} /></dl></div>)}</div>
        <div className="hidden overflow-x-auto border-t md:block" role="region" aria-label="Sotuvlar jadvali" tabIndex={0}><table className="w-full min-w-[680px] text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th>Davr</th><th className="text-right">Sotildi</th><th className="text-right">O‘rtacha narx</th><th className="text-right">Uzum to‘lovi</th><th className="text-right">Tan narx</th><th className="text-right">Foyda</th></tr></thead><tbody className="divide-y">{rows.map((row) => <tr key={row.period} className="transition-colors hover:bg-muted/20"><td className="whitespace-nowrap font-medium">{row.period}</td><td className="text-right tabular-nums">{formatNumber(row.soldQuantity)}</td><td className="text-right tabular-nums">{formatSum(row.avgPrice)}</td><td className="text-right tabular-nums">{formatSum(row.revenue)}</td><td className="text-right tabular-nums text-muted-foreground">{formatSum(row.cogs)}</td><td className={cn("text-right font-semibold tabular-nums", row.profit >= 0 ? "text-[var(--ok)]" : "text-destructive")}>{formatSum(row.profit)}</td></tr>)}</tbody></table></div>
      </>}
    </article>
  );
}

function LedgerValue({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><dt className="text-[11px] text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium tabular-nums">{value}</dd></div>;
}
