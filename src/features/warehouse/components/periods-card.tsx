"use client";

import * as React from "react";
import {
  ArrowDown, ArrowUp, CalendarRange, Flag, Loader2, Minus, Plus, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Pagination, usePagination } from "@/components/ui/pagination";
import {
  ApiError, compareProductPeriods, deleteProductPeriodMark, fetchProductPeriods, markProductPeriod, mediaUrl,
} from "@/lib/api";
import { formatDate, formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PeriodKeywordRow, ProductPeriod, ProductPeriodCompare, ProductPeriodMetrics, ProductPeriods } from "@/lib/types";

/**
 * Davrlar — kartochka o'zgargan har safar statistika yangi davrdan boshlanadi.
 *
 * Sotuvchi talabi (2026-09-16): «nom yoki rasm o'zgarsa, o'shangacha bo'lgan
 * statistika alohida bo'lsin va solishtira olay — o'sha davrda qaysi kalit
 * so'zlarda qaysi o'rinda edim, kuniga necha kishi ko'rardi, hozir qanday».
 *
 * Ikki qism: yuqorida davrlar lentasi (nima o'zgargani va o'sha davr
 * ko'rsatkichlari), pastda tanlangan IKKI davr yonma-yon — ko'rsatkichlar
 * farqi va kalit so'zlar jadvali.
 */

const SOURCE_LABEL: Record<string, string> = {
  uzum: "Uzum'da o'zgardi",
  estats: "eStats orqali yangilandi",
  manual: "Belgi",
};

const STATUS_LABEL: Record<string, string> = {
  up: "ko'tarildi",
  down: "tushdi",
  same: "o'zgarmadi",
  new: "yangi chiqdi",
  lost: "yo'qoldi",
  unmeasured: "o'lchanmadi",
};

function day(value: string): string {
  return formatDate(new Date(`${value}T00:00:00`));
}

/** «12 sen – 16 sen · 5 kun» */
function rangeLabel(period: { start: string; end: string; days: number }): string {
  return `${day(period.start)} – ${day(period.end)} · ${period.days} kun`;
}

function num(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return "—";
  return formatNumber(Number(value.toFixed(digits)));
}

/** Farq: kichik o'rin — yaxshi, shuning uchun `lowerIsBetter`. */
function Delta({ a, b, lowerIsBetter = false, suffix = "" }: {
  a: number | null | undefined; b: number | null | undefined; lowerIsBetter?: boolean; suffix?: string;
}) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const diff = b - a;
  if (Math.abs(diff) < 0.005) {
    return <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Minus className="size-3" /> 0</span>;
  }
  const better = lowerIsBetter ? diff < 0 : diff > 0;
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  const percent = a !== 0 ? ` (${diff > 0 ? "+" : ""}${Math.round((diff / Math.abs(a)) * 100)}%)` : "";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs tabular-nums", better ? "air-ok" : "air-bad")}>
      <Icon className="size-3" />
      {num(Math.abs(diff), 2)}{suffix}{percent}
    </span>
  );
}

export function PeriodsCard({ productId }: { productId: number }) {
  const [data, setData] = React.useState<ProductPeriods | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [pickA, setPickA] = React.useState<number | null>(null);
  const [pickB, setPickB] = React.useState<number | null>(null);
  const [compare, setCompare] = React.useState<ProductPeriodCompare | null>(null);
  const [comparing, setComparing] = React.useState(false);
  const [markOpen, setMarkOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const next = await fetchProductPeriods(productId);
      setData(next);
      // Sukut: hozirgi davr va undan oldingisi — eng ko'p so'raladigan savol
      // «o'zgarishdan keyin yaxshi bo'ldimi?».
      setPickB((current) => current ?? next.periods[0]?.index ?? null);
      setPickA((current) => current ?? next.periods[1]?.index ?? null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Davrlar yuklanmadi.");
    }
  }, [productId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  const periods = data?.periods ?? [];
  const byIndex = React.useMemo(
    () => new Map(periods.map((period) => [period.index, period])),
    [periods],
  );
  const a = pickA !== null ? byIndex.get(pickA) : undefined;
  const b = pickB !== null ? byIndex.get(pickB) : undefined;

  React.useEffect(() => {
    if (!a || !b || a.index === b.index) {
      setCompare(null);
      return;
    }
    let alive = true;
    setComparing(true);
    compareProductPeriods(productId, { from: a.start, to: a.end }, { from: b.start, to: b.end })
      .then((next) => alive && setCompare(next))
      .catch(() => alive && setCompare(null))
      .finally(() => alive && setComparing(false));
    return () => {
      alive = false;
    };
  }, [productId, a, b]);

  const removeMark = async (eventId: number) => {
    try {
      await deleteProductPeriodMark(productId, eventId);
      toast.success("Belgi o'chirildi.");
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    }
  };

  if (error) {
    return (
      <section className="rounded-2xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <CalendarRange className="size-4" /> Davrlar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {"Kartochka o'zgargan kundan yangi davr boshlanadi: nom, rasm, turkum, narx (≥10%) yoki eStats orqali yangilash. Har davr statistikasi alohida."}
            </p>
          </div>
          <Button variant="outline" className="min-h-11 rounded-xl" onClick={() => setMarkOpen(true)}>
            <Flag /> Belgi qo&apos;yish
          </Button>
        </div>

        {data === null ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Yuklanmoqda…
          </p>
        ) : periods.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">Bu tovar uchun hali ma&apos;lumot yig&apos;ilmagan.</p>
        ) : (
          <PeriodList
            periods={periods}
            pickA={pickA}
            pickB={pickB}
            onPickA={setPickA}
            onPickB={setPickB}
            onRemoveMark={removeMark}
          />
        )}
      </div>

      {a && b && a.index !== b.index && (
        <ComparePanel a={a} b={b} data={compare} loading={comparing} />
      )}

      <MarkDialog
        productId={productId}
        open={markOpen}
        onOpenChange={setMarkOpen}
        onSaved={() => void load()}
      />
    </section>
  );
}

function PeriodList({
  periods, pickA, pickB, onPickA, onPickB, onRemoveMark,
}: {
  periods: ProductPeriod[];
  pickA: number | null;
  pickB: number | null;
  onPickA: (index: number) => void;
  onPickB: (index: number) => void;
  onRemoveMark: (eventId: number) => void;
}) {
  const { page, setPage, pageItems, total, size } = usePagination(periods, { param: "periodPage", size: 8 });
  return (
    <div className="mt-4 space-y-2.5">
      {pageItems.map((period) => (
        <article
          key={period.index}
          className={cn(
            "rounded-xl border p-3.5 transition",
            (pickA === period.index || pickB === period.index) && "border-primary/60 bg-primary/5",
          )}
        >
          <div className="flex flex-wrap items-start gap-3">
            {period.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl(period.image)} alt="" className="size-14 shrink-0 rounded-lg border object-cover" />
            ) : (
              <span className="size-14 shrink-0 rounded-lg border bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium tabular-nums">{rangeLabel(period)}</span>
                {period.isCurrent && (
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
                    Hozirgi
                  </span>
                )}
              </div>
              {period.title && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{period.title}</p>}
              {period.events.length > 0 ? (
                <ul className="mt-2 space-y-1">
                  {period.events.map((event) => (
                    <li key={event.id} className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="rounded-md bg-muted px-1.5 py-0.5 font-medium">{event.label}</span>
                      <span className="text-muted-foreground">{SOURCE_LABEL[event.source] ?? event.source}</span>
                      {event.field === "period" && event.note && <span>· {event.note}</span>}
                      {event.field === "price" && event.before && event.after && (
                        <span className="tabular-nums">· {formatSum(Number(event.before))} → {formatSum(Number(event.after))}</span>
                      )}
                      {event.field === "title" && event.after && (
                        <span className="line-clamp-1 text-muted-foreground">· {event.after}</span>
                      )}
                      {event.source === "manual" && (
                        <button
                          type="button"
                          onClick={() => onRemoveMark(event.id)}
                          className="text-muted-foreground hover:text-destructive"
                          aria-label="Belgini o'chirish"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Boshlang&apos;ich davr — o&apos;zgarishlar kuzatilishidan oldingi holat.</p>
              )}
            </div>
            <div className="flex shrink-0 gap-1.5">
              {([["A", pickA, onPickA], ["B", pickB, onPickB]] as const).map(([label, picked, pick]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => pick(period.index)}
                  aria-pressed={picked === period.index}
                  className={cn(
                    "size-9 rounded-lg border text-xs font-semibold transition",
                    picked === period.index ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                  title={label === "A" ? "Solishtirishda «oldin»" : "Solishtirishda «keyin»"}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t pt-3 text-xs sm:grid-cols-4 lg:grid-cols-6">
            <Metric label="Ko'rsatish/kun" value={num(period.metrics.funnel.impressionsPerDay)} />
            <Metric label="Ochilish/kun" value={num(period.metrics.funnel.viewsPerDay)} />
            <Metric label="Savat/kun" value={num(period.metrics.funnel.cartPerDay, 2)} />
            <Metric label="Sotildi/kun" value={num(period.metrics.sales.unitsPerDay, 2)} />
            <Metric label="O'rtacha o'rin" value={num(period.metrics.seo.avgPosition, 1)} />
            <Metric label="Chiqayotgan so'z" value={`${period.metrics.seo.foundPhrases}`} />
          </dl>
          {period.metrics.funnel.measuredDays === 0 && (
            <p className="mt-2 text-[11px] air-warn">
              {"Bu davrda voronka o'lchanmagan — Uzum analitikasi eStats ulanganidan keyin yig'iladi."}
            </p>
          )}
        </article>
      ))}
      <Pagination page={page} total={total} size={size} onPage={setPage} label="Davrlar sahifalari" />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium tabular-nums">{value}</dd>
    </div>
  );
}

const ROWS: {
  label: string;
  get: (m: ProductPeriodMetrics) => number | null;
  digits?: number;
  suffix?: string;
  lowerIsBetter?: boolean;
  money?: boolean;
}[] = [
  { label: "Ko'rsatish / kun", get: (m) => m.funnel.impressionsPerDay },
  { label: "Kartochka ochilishi / kun", get: (m) => m.funnel.viewsPerDay },
  { label: "Savatga / kun", get: (m) => m.funnel.cartPerDay, digits: 2 },
  { label: "Buyurtma / kun", get: (m) => m.funnel.ordersPerDay, digits: 2 },
  { label: "Ochilishga konversiya", get: (m) => m.funnel.viewRate, digits: 2, suffix: "%" },
  { label: "Savatga konversiya", get: (m) => m.funnel.cartRate, digits: 2, suffix: "%" },
  { label: "Buyurtmaga konversiya", get: (m) => m.funnel.orderRate, digits: 2, suffix: "%" },
  { label: "Sotilgan / kun", get: (m) => m.sales.unitsPerDay, digits: 2 },
  { label: "Tushum / kun", get: (m) => m.sales.revenuePerDay, money: true },
  { label: "O'rtacha sotuv narxi", get: (m) => m.sales.avgPrice, money: true },
  { label: "O'rtacha qidiruv o'rni", get: (m) => m.seo.avgPosition, digits: 1, lowerIsBetter: true },
  { label: "Chiqayotgan kalit so'z", get: (m) => m.seo.foundPhrases },
  { label: "TOP-10 dagi so'z", get: (m) => m.seo.top10 },
];

function ComparePanel({
  a, b, data, loading,
}: {
  a: ProductPeriod; b: ProductPeriod; data: ProductPeriodCompare | null; loading: boolean;
}) {
  const ma = data?.a ?? a.metrics;
  const mb = data?.b ?? b.metrics;
  return (
    <div className="rounded-2xl border bg-card p-5">
      <h3 className="text-base font-semibold">Ikki davr solishtiruvi</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {`A: ${rangeLabel(a)} · B: ${rangeLabel(b)}`}
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Ko&apos;rsatkich</th>
              <th className="px-3 py-2 text-right font-medium">A</th>
              <th className="px-3 py-2 text-right font-medium">B</th>
              <th className="py-2 pl-3 text-right font-medium">Farq</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const va = row.get(ma);
              const vb = row.get(mb);
              const show = (value: number | null) =>
                value === null || value === undefined
                  ? "—"
                  : row.money
                    ? formatSum(value)
                    : `${num(value, row.digits ?? 1)}${row.suffix ?? ""}`;
              return (
                <tr key={row.label} className="border-b last:border-0">
                  <td className="py-2 pr-3">{row.label}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{show(va)}</td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">{show(vb)}</td>
                  <td className="py-2 pl-3 text-right">
                    <Delta a={va} b={vb} lowerIsBetter={row.lowerIsBetter} suffix={row.suffix ?? ""} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {`Voronka o'lchangan kunlar: A — ${ma.funnel.measuredDays}/${ma.days}, B — ${mb.funnel.measuredDays}/${mb.days}. Sotuv har kun bo'yicha.`}
      </p>

      {loading && !data ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Kalit so&apos;zlar solishtirilmoqda…
        </p>
      ) : data && data.keywords.length > 0 ? (
        <KeywordTable rows={data.keywords} />
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          {"Bu ikki davrda o'lchangan kalit so'z yo'q — «Bozor va SEO» bo'limida «Hozir o'lchash» bosing."}
        </p>
      )}
    </div>
  );
}

function KeywordTable({ rows }: { rows: PeriodKeywordRow[] }) {
  const { page, setPage, pageItems, total, size } = usePagination(rows, { param: "kwPage" });
  return (
    <div className="mt-5">
      <h4 className="text-sm font-semibold">Kalit so&apos;zlar</h4>
      <p className="mt-1 text-xs text-muted-foreground">
        {"Har so'z bo'yicha o'rtacha o'rin: kichik raqam — yuqori o'rin. «yangi chiqdi» — B davrda paydo bo'lgan."}
      </p>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">So&apos;z</th>
              <th className="px-3 py-2 text-right font-medium">A</th>
              <th className="px-3 py-2 text-right font-medium">B</th>
              <th className="py-2 pl-3 text-right font-medium">Holat</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((row) => (
              <tr key={row.phrase} className="border-b last:border-0">
                <td className="py-2 pr-3">
                  <span className="line-clamp-1">{row.phrase}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {`chiqqan kunlar: ${row.aFoundDays} → ${row.bFoundDays}`}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums">{row.a === null ? "—" : num(row.a)}</td>
                <td className="px-3 py-2 text-right font-medium tabular-nums">{row.b === null ? "—" : num(row.b)}</td>
                <td className="py-2 pl-3 text-right">
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[11px] font-medium",
                      row.status === "up" || row.status === "new"
                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                        : row.status === "down" || row.status === "lost"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {STATUS_LABEL[row.status] ?? row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={total} size={size} onPage={setPage} label="Kalit so'zlar sahifalari" />
    </div>
  );
}

function MarkDialog({
  productId, open, onOpenChange, onSaved,
}: {
  productId: number; open: boolean; onOpenChange: (open: boolean) => void; onSaved: () => void;
}) {
  const [note, setNote] = React.useState("");
  const [date, setDate] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setNote("");
      setDate("");
    }
  }, [open]);

  const submit = async () => {
    if (busy || !note.trim()) return;
    setBusy(true);
    try {
      await markProductPeriod(productId, { note: note.trim(), day: date || undefined });
      toast.success("Belgi qo'yildi — shu kundan yangi davr.");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Belgi qo'yilmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Flag className="size-4" /> Yangi davr belgisi
          </DialogTitle>
          <DialogDescription>
            {"Kartochka o'zgarmagan-u, boshqa narsa o'zgargan bo'lsa (reklama, aksiya, qoldiq to'ldirildi) — shu kundan alohida davr."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="air-label" htmlFor="period-note">Nima o&apos;zgardi</label>
            <Input
              id="period-note"
              autoFocus
              value={note}
              maxLength={300}
              placeholder="Masalan: Boost reklamasi yoqildi"
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
          <div>
            <label className="air-label" htmlFor="period-day">Qaysi kundan (bo&apos;sh — bugundan)</label>
            <Input
              id="period-day"
              type="date"
              value={date}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <Button className="min-h-11 w-full rounded-xl" disabled={busy || !note.trim()} onClick={() => void submit()}>
            {busy ? <Loader2 className="animate-spin" /> : <Plus />} Belgi qo&apos;yish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
