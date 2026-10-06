"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, CheckCircle2, ChevronDown, Lightbulb, RefreshCw, XCircle } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { decideAction, fetchActionHistory, fetchTodayActions } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ActionItem, ActionOutcome, ActionSeverity, TodayActions } from "@/lib/types";

/**
 * «Bugun» — eStats'ning hamma tavsiyalari bir joyda, pul ta'siri bo'yicha.
 *
 * Har raqam o'lchangan qatordan yoki ochiq formuladan (ADR-001): kartada
 * "Dalil" ochilganda har qiymatning manbasi ko'rinadi. Pul ta'sirini
 * hisoblab bo'lmasa — "hisoblanmadi" va sababi, uydirma raqam emas.
 */

const SEVERITY: Record<ActionSeverity, { label: string; icon: typeof AlertTriangle; cls: string; text: string }> = {
  critical: { label: "Kritik", icon: AlertTriangle, cls: "border-destructive/40 bg-destructive/5", text: "text-destructive" },
  important: { label: "Muhim", icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/5", text: "text-amber-600 dark:text-amber-500" },
  opportunity: { label: "Imkoniyat", icon: Lightbulb, cls: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400" },
};

export default function TodayPage() {
  const [data, setData] = React.useState<TodayActions | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async (force = false) => {
    setBusy(true);
    try {
      setData(await fetchTodayActions(force));
      setError(null);
    } catch (e) {
      // Xato yutilmaydi: bo'sh sahifa "hammasi joyida" degan yolg'on bo'lardi.
      setError(e instanceof Error ? e.message : "Tavsiyalarni yuklab bo'lmadi");
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const decide = async (item: ActionItem, decision: "accept" | "reject" | "done") => {
    try {
      await decideAction(item.id, decision);
      setData((prev) => prev && {
        ...prev,
        items: decision === "accept"
          ? prev.items.map((i) => (i.id === item.id ? { ...i, status: "accepted" } : i))
          : prev.items.filter((i) => i.id !== item.id),
      });
      toast.success(decision === "reject" ? "Rad etildi" : decision === "done" ? "Bajarildi deb belgilandi" : "Qabul qilindi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlab bo'lmadi");
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bugun"
        description={`Nima qilish kerak — oxirgi ${data?.windowDays ?? 30} kunlik o'z raqamlaringizdan. Har tavsiya dalili bilan.`}
        actions={
          <Button variant="outline" size="sm" onClick={() => void load(true)} disabled={busy}>
            <RefreshCw className={cn("mr-2 size-4", busy && "animate-spin")} />
            Qayta hisoblash
          </Button>
        }
      />

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat
              label="Hisoblangan imkoniyat"
              value={data.potentialMonthlyUzs > 0 ? `${formatSum(data.potentialMonthlyUzs)}/oy` : "—"}
              hint="faqat pul ta'siri hisoblangan tavsiyalar yig'indisi"
            />
            <Stat label="Kritik" value={formatNumber(data.counts.critical ?? 0)} tone="critical" />
            <Stat label="Muhim" value={formatNumber(data.counts.important ?? 0)} tone="important" />
            <Stat label="Imkoniyat" value={formatNumber(data.counts.opportunity ?? 0)} tone="opportunity" />
          </div>

          {data.items.length === 0 ? (
            <Card>
              <CardContent className="flex items-center gap-3 py-8 text-sm text-muted-foreground">
                <CheckCircle2 className="size-5 text-emerald-500" />
                Hozircha ochiq tavsiya yo'q — tugayotgan, zarar qilayotgan yoki tannarxsiz tovar topilmadi.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {data.items.map((item) => (
                <ActionCard key={item.id} item={item} onDecide={decide} />
              ))}
            </div>
          )}
        </>
      )}

      <History />
    </div>
  );
}

const VERDICT: Record<ActionOutcome["verdict"], { label: string; cls: string }> = {
  improved: { label: "yaxshilandi", cls: "text-emerald-600 dark:text-emerald-400" },
  worsened: { label: "yomonlashdi", cls: "text-destructive" },
  flat: { label: "o'zgarmadi", cls: "text-muted-foreground" },
  unknown: { label: "noma'lum", cls: "text-muted-foreground" },
};

/**
 * Qaror qilingan tavsiyalar va 7/14 kundan keyingi o'lchov.
 * Bu sabab-oqibat isboti emas — mavsum va raqiblar ham ta'sir qiladi.
 */
function History() {
  const [rows, setRows] = React.useState<ActionItem[] | null>(null);

  React.useEffect(() => {
    fetchActionHistory().then(setRows).catch(() => setRows([]));
  }, []);

  if (!rows || rows.length === 0) return null;
  const unit = (o: ActionOutcome) => (o.metric === "profit_per_day" ? " so'm/kun" : " dona/kun");

  return (
    <Card>
      <CardContent className="space-y-3 py-5">
        <div>
          <h2 className="text-sm font-semibold">Qarorlar va natijasi</h2>
          <p className="text-xs text-muted-foreground">
            Qarordan 7 va 14 kun keyin kunlik foyda (tannarx bo'lmasa — dona) qarordan oldingi 30 kun bilan solishtiriladi.
            Bu isbot emas: mavsum va raqiblar ham ta'sir qiladi.
          </p>
        </div>
        <ul className="divide-y text-sm">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-col gap-1 py-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 truncate">{r.title}</span>
              <span className="flex shrink-0 flex-wrap gap-3 text-xs">
                <span className="text-muted-foreground">
                  {r.status === "rejected" ? "rad etilgan" : r.status === "done" ? "bajarilgan" : "qabul qilingan"}
                  {r.decidedAt ? ` · ${new Date(r.decidedAt).toLocaleDateString("ru-RU")}` : ""}
                </span>
                {r.status !== "rejected" && (["d7", "d14"] as const).map((k) => {
                  const o = r.outcome?.[k];
                  if (!o) return <span key={k} className="text-muted-foreground">{k === "d7" ? "7" : "14"} kun: kutilmoqda</span>;
                  return (
                    <span key={k} className={VERDICT[o.verdict].cls}>
                      {o.days} kun: {VERDICT[o.verdict].label}
                      {o.before != null && o.after != null && ` (${formatNumber(o.before)} → ${formatNumber(o.after)}${unit(o)})`}
                    </span>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  item,
  onDecide,
}: {
  item: ActionItem;
  onDecide: (item: ActionItem, decision: "accept" | "reject" | "done") => void;
}) {
  const [open, setOpen] = React.useState(false);
  const sev = SEVERITY[item.severity] ?? SEVERITY.important;
  const Icon = sev.icon;
  const range = item.expectedImpact?.monthly_profit_uzs;
  const path = typeof item.action?.path === "string" ? item.action.path : null;

  return (
    <Card className={cn("border", sev.cls)}>
      <CardContent className="space-y-3 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Icon className={cn("mt-0.5 size-5 shrink-0", sev.text)} />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={sev.text}>{sev.label}</Badge>
                {item.status === "accepted" && <Badge variant="secondary">Qabul qilingan</Badge>}
                <span className="text-xs text-muted-foreground">ishonch {Math.round(item.confidence * 100)}%</span>
              </div>
              <p className="mt-1 font-medium leading-snug">{item.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.reason}</p>
            </div>
          </div>
          <div className="text-right">
            {range?.high != null ? (
              <>
                <p className="text-lg font-semibold tabular-nums">
                  {range.low != null && range.low !== range.high
                    ? `${formatSum(range.low)} – ${formatSum(range.high)}`
                    : `${range.low == null ? "≤ " : ""}${formatSum(range.high)}`}
                </p>
                <p className="text-xs text-muted-foreground">oyiga foyda</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">pul ta'siri hisoblanmadi</p>
            )}
          </div>
        </div>

        {item.expectedImpact?.basis && (
          <p className="text-xs text-muted-foreground">Asos: {item.expectedImpact.basis}</p>
        )}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          Dalil ({item.evidence.length})
        </button>
        {open && (
          <div className="overflow-x-auto rounded-md border bg-background/60">
            <table className="w-full text-xs">
              <tbody>
                {item.evidence.map((e, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5 text-muted-foreground">{e.label}</td>
                    <td className="px-3 py-1.5 text-right font-medium tabular-nums">
                      {typeof e.value === "number" ? formatNumber(e.value) : e.value} {e.unit}
                    </td>
                    <td className="hidden px-3 py-1.5 text-muted-foreground sm:table-cell">{e.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {path && (
            <Button asChild size="sm">
              <Link href={path as Route}>Ochish</Link>
            </Button>
          )}
          {item.status !== "accepted" && (
            <Button size="sm" variant="outline" onClick={() => onDecide(item, "accept")}>
              Qabul qilaman
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => onDecide(item, "done")}>
            <CheckCircle2 className="mr-1 size-4" /> Bajarildi
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onDecide(item, "reject")}>
            <XCircle className="mr-1 size-4" /> Kerak emas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: ActionSeverity;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-xl font-semibold tabular-nums", tone && SEVERITY[tone].text)}>{value}</p>
        {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
