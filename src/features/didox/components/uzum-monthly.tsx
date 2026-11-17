"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, Scale } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, fetchDidoxReconcile, fetchDidoxUzumMonthly } from "@/lib/api";
import { formatPercent, formatSum } from "@/lib/format";
import { AWAITING_ME, formatDocDate, formatPeriod, statusVariant } from "../labels";
import type { DidoxDocument, DidoxReconcile, DidoxUzumMonth, DidoxUzumMonthly } from "../types";

const CANDIDATE_LABEL: Record<string, string> = {
  commission: "Faqat komissiya",
  allCharges: "Komissiya + logistika + boshqa xizmatlar",
};

/**
 * Uzum'ning oylik hujjatlari: har oy uchun hisob-faktura (002) va
 * dalolatnoma (005). «Juft» — oyda ikkalasi ham bor. Moliya bilan
 * solishtirish (`finance.view` kerak) — TAXMIN: ESF'ga aynan qaysi
 * to'lovlar kirishi rasman noma'lum, backend ikki nomzodni beradi.
 */
export function UzumMonthly({
  canReconcile,
  reloadKey,
  onOpen,
}: {
  canReconcile: boolean;
  reloadKey: number;
  onOpen: (doc: DidoxDocument) => void;
}) {
  const [data, setData] = React.useState<DidoxUzumMonthly | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [months, setMonths] = React.useState(6);

  React.useEffect(() => {
    let alive = true;
    setError(null);
    fetchDidoxUzumMonthly(months)
      .then((d) => { if (alive) setData(d); })
      .catch((e) => { if (alive) setError(e instanceof ApiError ? e.message : "Uzum hujjatlarini yuklab bo'lmadi."); });
    return () => { alive = false; };
  }, [months, reloadKey]);

  if (error) return <p role="alert" className="rounded-xl border border-[var(--bad)]/30 bg-[var(--bad)]/5 p-4 text-sm">{error}</p>;
  if (!data) return <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Uzum hujjatlari yuklanmoqda…</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border bg-muted/30 p-3 text-sm">
        <p className="flex max-w-3xl items-start gap-2 text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0" />
          Uzum (STIR {data.uzumTin}) har oy vositachilik haqi bo&apos;yicha hisob-faktura va dalolatnomani keyingi oyning
          19-sanasigacha yuboradi — ularni ko&apos;rib chiqib qabul qilish yoki asoslab rad etish kerak.
        </p>
        <div className="flex gap-1">
          {[3, 6, 12].map((m) => (
            <Button key={m} size="sm" variant={months === m ? "default" : "outline"} onClick={() => setMonths(m)}>{m} oy</Button>
          ))}
        </div>
      </div>

      {data.months.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          Bu davrda Uzum&apos;dan hisob-faktura yoki dalolatnoma kelmagan. Agar Uzum kabinetida bor bo&apos;lsa —
          Didox&apos;ga ulangan STIR to&apos;g&apos;riligini tekshiring.
        </p>
      )}

      {data.months.map((m) => <MonthCard key={m.period} month={m} canReconcile={canReconcile} onOpen={onOpen} />)}
    </div>
  );
}

function MonthCard({ month, canReconcile, onOpen }: { month: DidoxUzumMonth; canReconcile: boolean; onOpen: (doc: DidoxDocument) => void }) {
  const [rec, setRec] = React.useState<DidoxReconcile | null>(null);
  const [recBusy, setRecBusy] = React.useState(false);
  const [recError, setRecError] = React.useState<string | null>(null);
  const paired = month.invoices.length > 0 && month.acts.length > 0;
  const docs = [...month.invoices, ...month.acts];

  const reconcile = async () => {
    setRecBusy(true);
    setRecError(null);
    try {
      setRec(await fetchDidoxReconcile(month.period));
    } catch (e) {
      setRecError(e instanceof ApiError ? e.message : "Solishtirib bo'lmadi.");
    } finally {
      setRecBusy(false);
    }
  };

  return (
    <article className="space-y-3 rounded-2xl border bg-card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold capitalize">{formatPeriod(month.period)}</h3>
          {paired
            ? <Badge variant="success"><CheckCircle2 className="size-3" />Juft: hisob-faktura + dalolatnoma</Badge>
            : <Badge variant="warning"><AlertTriangle className="size-3" />{month.invoices.length ? "Dalolatnoma yo'q" : "Hisob-faktura yo'q"}</Badge>}
          {month.pendingSignature > 0 && <Badge variant="warning">{month.pendingSignature} ta imzongizni kutmoqda</Badge>}
        </div>
        <div className="text-right text-sm tabular-nums">
          <div>Hisob-faktura: <b>{formatSum(month.invoiceTotal)}</b></div>
          <div className="text-muted-foreground">Dalolatnoma: {formatSum(month.actTotal)}</div>
        </div>
      </header>

      <ul className="divide-y rounded-xl border">
        {docs.map((d) => (
          <li key={d.id}>
            <button type="button" onClick={() => onOpen(d)} className="flex w-full flex-wrap items-center justify-between gap-2 p-2.5 text-left text-sm hover:bg-muted/50">
              <span className="min-w-0">
                <span className="font-medium">{d.doctype === "002" ? "Hisob-faktura" : "Dalolatnoma"}{d.number ? ` №${d.number}` : ""}</span>
                <span className="ml-2 text-muted-foreground">{formatDocDate(d.docDate)}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="tabular-nums">{formatSum(d.totalSum)}</span>
                <Badge variant={statusVariant(d.status)}>{d.status === AWAITING_ME ? "Imzo kutmoqda" : d.statusName || "—"}</Badge>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {canReconcile && (
        <div className="space-y-2">
          {!rec && (
            <Button size="sm" variant="outline" onClick={() => void reconcile()} disabled={recBusy || month.invoices.length === 0}>
              {recBusy ? <Loader2 className="animate-spin" /> : <Scale />}Moliya hisobotimiz bilan solishtirish
            </Button>
          )}
          {recError && <p role="alert" className="text-sm text-[var(--bad)]">{recError}</p>}
          {rec && <ReconcileResult rec={rec} />}
        </div>
      )}
    </article>
  );
}

function ReconcileResult({ rec }: { rec: DidoxReconcile }) {
  return (
    <div className="space-y-2 rounded-xl border bg-muted/30 p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Taxmin</Badge>
        {rec.matches
          ? <Badge variant="success">Mos (farq {formatPercent(rec.differencePct)})</Badge>
          : <Badge variant="warning">Farq {formatSum(Math.abs(rec.difference ?? 0))} ({formatPercent(rec.differencePct)})</Badge>}
      </div>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 tabular-nums">
        <dt>Uzum hisob-fakturasi (Didox)</dt><dd className="text-right font-medium">{formatSum(rec.didoxTotal)}</dd>
        {Object.entries(rec.candidates).map(([key, value]) => (
          <React.Fragment key={key}>
            <dt className={key === rec.closest ? "font-medium" : "text-muted-foreground"}>
              {CANDIDATE_LABEL[key] ?? key}{key === rec.closest ? " — eng yaqin" : ""}
            </dt>
            <dd className="text-right">{formatSum(value)}</dd>
          </React.Fragment>
        ))}
      </dl>
      <p className="text-xs text-muted-foreground">
        Bu xulosa TAXMIN: Uzum hisob-fakturasiga faqat komissiya kiradimi yoki logistika va boshqa xizmatlar ham — rasman
        aniq emas. Shuning uchun ikkala variant ko&apos;rsatiladi. Rad etishdan oldin Uzum kabinetidagi hisobot bilan solishtiring.
      </p>
    </div>
  );
}
