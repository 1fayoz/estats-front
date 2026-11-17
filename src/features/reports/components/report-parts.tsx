"use client";

import * as React from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, ListChecks, Receipt } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { MonthlyReport, ReportTax, WaterfallStep } from "../types";

/** Foiz — bitta kasr xonasi, o'zbekcha vergul bilan. */
export function pctText(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return `${v.toFixed(1).replace(".", ",")}%`;
}

const tone = (v: number) => (v > 0 ? "text-[var(--ok)]" : v < 0 ? "text-[var(--bad)]" : "text-muted-foreground");

// ── KPI ──────────────────────────────────────────────────────────────────────

export function KpiCards({ report }: { report: MonthlyReport }) {
  const t = report.totals;
  const items = [
    { label: "Sotuv (qaytarishsiz)", value: formatSum(t.grossSales), hint: `${formatNumber(t.orders)} buyurtma · ${formatNumber(t.units)} dona` },
    { label: "Uzum to'lovi", value: formatSum(t.payout), hint: `komissiya ${pctText(t.commissionPct)}` },
    { label: "Qaytarish", value: formatSum(t.returnsAmount), hint: `${formatNumber(t.returnsQuantity)} dona` },
    { label: "Tannarx (FIFO)", value: formatSum(t.cogs), hint: t.uncoveredQuantity ? `${formatNumber(t.uncoveredQuantity)} dona tannarxsiz` : "hammasi qoplangan" },
    { label: "Sof foyda", value: formatSum(t.netProfit), hint: `marja ${pctText(t.marginPct)}`, strong: true, sign: t.netProfit },
  ];
  return (
    <section aria-label="Asosiy ko'rsatkichlar" className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {items.map((it) => (
        <Card key={it.label} className={cn("p-4", it.strong && "col-span-2 lg:col-span-1")}>
          <p className="text-xs text-muted-foreground">{it.label}</p>
          <p className={cn("mt-1 text-lg font-semibold tabular-nums", it.sign !== undefined && tone(it.sign))}>
            {it.value}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{it.hint}</p>
        </Card>
      ))}
    </section>
  );
}

// ── sharshara ────────────────────────────────────────────────────────────────

/**
 * Gorizontal sharshara: har qadam o'z bo'lagini sotuvdan qolgan qoldiqdan
 * ayiradi. Bitta o'q (so'm), rang — vazifa bo'yicha: jami (asosiy rang),
 * ayirma (xarajat), natija (foyda/zarar). Raqam har doim matn rangida,
 * yorliq bilan — rang yolg'iz o'zi ma'no tashimaydi.
 */
export function Waterfall({ steps }: { steps: WaterfallStep[] }) {
  const total = steps[0]?.amount ?? 0;
  const scale = Math.max(Math.abs(total), ...steps.map((s) => Math.abs(s.amount)), 1);
  let running = 0;
  const rows = steps.map((s) => {
    let start: number, end: number;
    if (s.kind === "total") {
      start = 0; end = s.amount; running = s.amount;
    } else if (s.kind === "minus") {
      start = running + s.amount; end = running; running += s.amount;
    } else {
      start = Math.min(0, s.amount); end = Math.max(0, s.amount);
    }
    const lo = Math.min(start, end), hi = Math.max(start, end);
    return { ...s, left: (Math.max(lo, 0) / scale) * 100, width: (Math.max(hi - Math.max(lo, 0), 0) / scale) * 100, negative: hi <= 0 || (s.kind === "result" && s.amount < 0) };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sotuvdan sof foydagacha</CardTitle>
        <CardDescription>Har bir qator — sotuvdan ayiriladigan bo&apos;lak. Ustiga olib boring — summa va ulushi.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-2">
          {rows.map((r) => {
            const share = total ? (Math.abs(r.amount) / total) * 100 : 0;
            const color = r.kind === "total" ? "var(--primary)" : r.kind === "minus" ? "var(--warn)" : r.amount >= 0 ? "var(--ok)" : "var(--bad)";
            return (
              <li key={r.key} className="group grid grid-cols-[minmax(7rem,11rem)_1fr_auto] items-center gap-3 text-sm"
                  title={`${r.label}: ${formatSum(r.amount)} (${pctText(share)} sotuvdan)`}>
                <span className={cn("truncate", r.kind !== "minus" && "font-medium")}>{r.label}</span>
                <span className="relative h-5 rounded-sm bg-muted/40" aria-hidden="true">
                  {r.width > 0 && (
                    <span className="absolute inset-y-0.5 rounded-[4px] transition-opacity group-hover:opacity-80"
                          style={{ left: `${r.left}%`, width: `max(${r.width}%, 2px)`, background: color }} />
                  )}
                  {r.negative && r.kind === "result" && (
                    <span className="absolute inset-y-0 left-0 text-[10px] leading-5 text-[var(--bad)]">◄ zarar</span>
                  )}
                </span>
                <span className={cn("tabular-nums", r.kind === "result" && cn("font-semibold", tone(r.amount)))}>
                  {formatSum(r.amount)}
                </span>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

// ── solishtirish ─────────────────────────────────────────────────────────────

/** Xarajat qatorlarida o'sish yomon — rang teskari. */
const COST_KEYS = new Set(["returnsAmount", "commission", "logistics", "uzumFees", "ads", "cogs", "ownExpenses"]);

export function Comparison({ report }: { report: MonthlyReport }) {
  const c = report.comparison;
  const fmt = (key: string, v: number) =>
    key === "marginPct" ? pctText(v) : key === "orders" || key === "units" ? formatNumber(v) : formatSum(v);
  const delta = (key: string, d: number, p: number | null) => {
    const good = COST_KEYS.has(key) ? d < 0 : d > 0;
    const sign = d > 0 ? "+" : "";
    return (
      <span className={cn("tabular-nums", d === 0 ? "text-muted-foreground" : good ? "text-[var(--ok)]" : "text-[var(--bad)]")}>
        {key === "marginPct" ? `${sign}${d.toFixed(1).replace(".", ",")} p.p.` : `${sign}${fmt(key, d)}`}
        {p != null && key !== "marginPct" ? ` (${sign}${pctText(p)})` : ""}
      </span>
    );
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Solishtirish</CardTitle>
        <CardDescription>
          Oldingi davr ({c.previous.label}) va o&apos;tgan yilning shu davri ({c.lastYear.label}).
          {!c.previousComplete || !c.lastYearComplete ? " Ba'zi davrlarda sotuv tarixi to'liq yuklanmagan — farq noto'g'ri bo'lishi mumkin." : ""}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-2 pr-3 font-medium">Ko&apos;rsatkich</th>
              <th className="py-2 pr-3 text-right font-medium">Joriy</th>
              <th className="py-2 pr-3 text-right font-medium">{c.previous.label}</th>
              <th className="py-2 pr-3 text-right font-medium">Farq</th>
              <th className="py-2 pr-3 text-right font-medium">{c.lastYear.label}</th>
              <th className="py-2 text-right font-medium">Farq</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {c.metrics.map((m) => (
              <tr key={m.key} className={m.key === "netProfit" ? "font-semibold" : undefined}>
                <td className="py-1.5 pr-3">{m.label}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums">{fmt(m.key, m.current)}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-muted-foreground">{fmt(m.key, m.previous)}</td>
                <td className="py-1.5 pr-3 text-right">{delta(m.key, m.deltaPrevious, m.deltaPreviousPct)}</td>
                <td className="py-1.5 pr-3 text-right tabular-nums text-muted-foreground">{fmt(m.key, m.lastYear)}</td>
                <td className="py-1.5 text-right">{delta(m.key, m.deltaLastYear, m.deltaLastYearPct)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

// ── tovarlar ─────────────────────────────────────────────────────────────────

export function ProductsTable({ report }: { report: MonthlyReport }) {
  const [sort, setSort] = React.useState<"grossSales" | "profit" | "marginPct">("grossSales");
  const rows = [...report.products].sort((a, b) => b[sort] - a[sort]);
  const head = (key: typeof sort, label: string) => (
    <th className="py-2 pr-3 text-right font-medium">
      <button type="button" className={cn("hover:underline", sort === key && "text-foreground")} onClick={() => setSort(key)}>
        {label}{sort === key ? " ↓" : ""}
      </button>
    </th>
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tovarlar kesimida</CardTitle>
        <CardDescription>Foyda = Uzum to&apos;lovi − FIFO tannarx (Uzum ushlanmalari, reklama va o&apos;z xarajatlari tovarga taqsimlanmaydi).</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Bu davrda sotuv yo&apos;q.</p>
        ) : (
          <table className="w-full min-w-[860px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-medium">Tovar</th>
                <th className="py-2 pr-3 text-right font-medium">Dona</th>
                <th className="py-2 pr-3 text-right font-medium">Qaytdi</th>
                {head("grossSales", "Sotuv")}
                <th className="py-2 pr-3 text-right font-medium">Komissiya</th>
                <th className="py-2 pr-3 text-right font-medium">Logistika</th>
                <th className="py-2 pr-3 text-right font-medium">Uzum to&apos;lovi</th>
                <th className="py-2 pr-3 text-right font-medium">Tannarx</th>
                {head("profit", "Foyda")}
                {head("marginPct", "Marja")}
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((p) => (
                <tr key={p.warehouseProductId ?? "orphan"}>
                  <td className="max-w-[280px] py-1.5 pr-3">
                    <span className="block truncate" title={p.title}>{p.title}</span>
                    {p.uncoveredQuantity > 0 && (
                      <span className="text-xs text-[var(--warn)]">{formatNumber(p.uncoveredQuantity)} dona tannarxsiz</span>
                    )}
                  </td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatNumber(p.soldQuantity)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{p.returnedQuantity ? formatNumber(p.returnedQuantity) : "—"}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatSum(p.grossSales)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatSum(p.commission)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatSum(p.logistics)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatSum(p.payout)}</td>
                  <td className="py-1.5 pr-3 text-right tabular-nums">{formatSum(p.cogs)}</td>
                  <td className={cn("py-1.5 pr-3 text-right tabular-nums", tone(p.profit))}>{formatSum(p.profit)}</td>
                  <td className="py-1.5 text-right tabular-nums">{pctText(p.marginPct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

// ── Uzum ushlanmalari va o'z xarajatlari ─────────────────────────────────────

const FEE_KIND: Record<string, string> = { storage: "Saqlash", fine: "Jarima", withdrawal: "Pul yechish", ads: "Reklama", other: "Boshqa" };

export function Deductions({ report }: { report: MonthlyReport }) {
  const s = report.sources;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Receipt className="size-4" /> Ushlanmalar va xarajatlar</CardTitle>
        <CardDescription>
          {s.feesAvailable ? "Uzum moliyasidan (logistikasiz — u to'lovda allaqachon ayirilgan)." : s.feesReason}
          {" "}Reklama manbasi: {s.adsSource === "uzum_expenses" ? "Uzum xarajatlari" : s.adsSource === "cabinet_cpo" ? `kabinet CPO hisoboti (${s.adsCoveredDays} kun qamralgan)` : "ma'lumot yo'q"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium">Uzum ushlanmalari</h3>
          {report.fees.length === 0 ? <p className="text-sm text-muted-foreground">Yo&apos;q.</p> : (
            <ul className="divide-y text-sm">
              {report.fees.slice(0, 12).map((f) => (
                <li key={`${f.id}-${f.date}`} className="flex items-start justify-between gap-3 py-1.5">
                  <span className="min-w-0"><Badge variant="secondary" className="mr-2">{FEE_KIND[f.kind] ?? f.kind}</Badge>
                    <span className="break-words">{f.name}</span></span>
                  <span className="shrink-0 tabular-nums">{formatSum(f.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">O&apos;z xarajatlari («Doimiy to&apos;lovlar»)</h3>
          {report.ownExpenses.length === 0 ? <p className="text-sm text-muted-foreground">Bu davrga to&apos;g&apos;ri keladigan to&apos;lov yo&apos;q.</p> : (
            <ul className="divide-y text-sm">
              {report.ownExpenses.map((x) => (
                <li key={`${x.id}-${x.due}`} className="flex items-center justify-between gap-3 py-1.5">
                  <span className="min-w-0 truncate">{x.title} <span className="text-xs text-muted-foreground">· {formatDate(x.due)}</span></span>
                  <span className="shrink-0 tabular-nums">
                    {formatSum(x.amount)} {x.paid ? <span className="text-xs text-[var(--ok)]">to&apos;landi</span> : <span className="text-xs text-muted-foreground">reja</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── soliq ────────────────────────────────────────────────────────────────────

export function TaxBlock({ tax, rate, onRate }: { tax: ReportTax; rate: number; onRate: (v: number) => void }) {
  const [draft, setDraft] = React.useState(String(rate));
  React.useEffect(() => setDraft(String(rate)), [rate]);
  const late = tax.daysLeft < 0;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base"><CalendarClock className="size-4" /> Aylanma soliq (101-shakl)</CardTitle>
            <CardDescription>«Marketplace orqali olingan daromadlar» — taxmin, rasmiy hisob my.soliq.uz da.</CardDescription>
          </div>
          <Badge variant={late ? "destructive" : "secondary"}>
            {late ? "Muddat o'tdi" : tax.daysLeft === 0 ? "Bugun oxirgi kun" : `${tax.daysLeft} kun qoldi`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Daromad ({tax.incomeSource === "commissioner" ? "komissioner hisobotidan" : "eStats hisobi"})</p>
            <p className="mt-1 text-lg font-semibold tabular-nums">{formatSum(tax.marketplaceIncome)}</p>
            {tax.commissionerIncome != null && (
              <p className="text-xs text-muted-foreground">eStats: {formatSum(tax.estatsIncome)}</p>
            )}
          </div>
          <div className="rounded-lg border p-3">
            <label className="text-xs text-muted-foreground" htmlFor="tax-rate">Stavka, %</label>
            <div className="mt-1 flex items-center gap-2">
              <input id="tax-rate" inputMode="decimal" value={draft} onChange={(e) => setDraft(e.target.value)}
                     onBlur={() => { const v = Number(draft.replace(",", ".")); if (Number.isFinite(v) && v >= 0 && v <= 100) onRate(v); else setDraft(String(rate)); }}
                     className="h-9 w-20 rounded-md border bg-background px-2 text-base tabular-nums" />
              <span className="text-lg font-semibold tabular-nums">= {formatSum(tax.tax)}</span>
            </div>
            <p className="text-xs text-muted-foreground">sukut 4% — rejimingizga qarab o&apos;zgartiring</p>
          </div>
          <div className="rounded-lg border p-3">
            <p className="text-xs text-muted-foreground">Topshirish va to&apos;lash muddati</p>
            <p className="mt-1 text-lg font-semibold">{formatDate(tax.deadline)}</p>
            {tax.deadline !== tax.nominalDeadline && (
              <p className="text-xs text-muted-foreground">15-sana dam olish kuni — keyingi ish kuniga surildi</p>
            )}
          </div>
        </div>
        <ul className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
          <li>Komissioner hisoboti: {formatDate(tax.commissionerReadyFrom)} dan</li>
          <li>my.soliq.uz avtomatik qoralama: ~{formatDate(tax.autoDraftFrom)} dan</li>
          <li>Uzum hisob-faktura + dalolatnoma: {formatDate(tax.invoiceDeadline)} gacha</li>
          <li title={tax.formula}>Formula: sotuv narxi × dona, xaridor olgan sana bo&apos;yicha</li>
        </ul>
        <details className="rounded-lg border p-3">
          <summary className="flex cursor-pointer items-center gap-2 font-medium"><ListChecks className="size-4" /> my.soliq.uz da qadamlar</summary>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            {tax.checklist.map((step) => <li key={step}>{step}</li>)}
          </ol>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            {tax.notes.map((n) => <li key={n} className="flex gap-1.5"><AlertTriangle className="mt-0.5 size-3 shrink-0" />{n}</li>)}
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}

export function StatusIcon({ ok }: { ok: boolean }) {
  return ok ? <CheckCircle2 className="size-4 text-[var(--ok)]" /> : <AlertTriangle className="size-4 text-[var(--warn)]" />;
}
