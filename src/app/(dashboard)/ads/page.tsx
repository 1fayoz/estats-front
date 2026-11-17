"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { AlertTriangle, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ApiError, fetchAdCapabilities, fetchAdMetrics, syncAdReport,
  type AdCapabilities, type AdKpis, type AdMetrics,
} from "@/lib/api";
import { formatDate, formatDelta, formatNumber, formatPercent } from "@/lib/format";

/**
 * «Reklama» — Uzum reklamasining samaradorligi asosiy kabinetda.
 *
 * Raqamlar saqlangan kabinet hisobotlaridan (CPO voronkasi, tovar × kun) va
 * eStats'ning O'Z sotuvidan (FIFO): DRR = xarajat ÷ reklama tushumi, ROAS = teskarisi,
 * TACoS = xarajat ÷ JAMI tushum (qaytarish ayrilgan). Zarar kampaniyalar qizil.
 */
const PRESETS = [7, 14, 30, 90] as const;

function iso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
}

const VERDICT = {
  loss: { text: "zarar", cls: "text-[var(--bad)]" },
  ok: { text: "foydali", cls: "text-[var(--ok)]" },
  no_spend: { text: "xarajat yo'q", cls: "text-muted-foreground" },
  no_cost: { text: "tannarx yo'q", cls: "text-[var(--warn)]" },
  no_stats: { text: "statistika o'qilmaydi", cls: "text-muted-foreground" },
} as const;

const money = (v: number | null | undefined) => (v == null ? "—" : formatNumber(v));
const pct = (v: number | null | undefined) => (v == null ? "—" : formatPercent(v, true));
const times = (v: number | null | undefined) => (v == null ? "—" : `${v.toFixed(2)}×`);

export default function AdsPage() {
  const [from, setFrom] = React.useState(daysAgo(29));
  const [to, setTo] = React.useState(daysAgo(0));
  const [data, setData] = React.useState<AdMetrics | null>(null);
  const [caps, setCaps] = React.useState<AdCapabilities | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = React.useCallback(() => {
    setLoading(true);
    setError(null);
    fetchAdMetrics(from, to)
      .then(setData)
      .catch((e: ApiError) => setError(e.message))
      .finally(() => setLoading(false));
  }, [from, to]);
  React.useEffect(load, [load]);
  React.useEffect(() => {
    fetchAdCapabilities().then(setCaps).catch(() => undefined);
  }, []);

  const sync = async () => {
    try {
      await syncAdReport();
      toast.success("Uzum kabinetidan o'qilmoqda (~1 daqiqa) — keyin yangilang");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const s = data?.summary;
  const p = data?.previous;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4" />Reklama samaradorligi</CardTitle>
          <CardDescription>
            Xarajat va reklama tushumi — Uzum kabineti voronkasidan; jami tushum va foyda — eStats&apos;dagi haqiqiy sotuv
            (FIFO). DRR (ACOS) = xarajat ÷ reklama tushumi · ROAS = reklama tushumi ÷ xarajat · TACoS = xarajat ÷ jami tushum.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-2 text-sm">
            {PRESETS.map((n) => (
              <Button key={n} size="sm" variant={from === daysAgo(n - 1) && to === daysAgo(0) ? "default" : "outline"}
                      onClick={() => { setFrom(daysAgo(n - 1)); setTo(daysAgo(0)); }}>
                {n} kun
              </Button>
            ))}
            <Input className="h-8 w-40" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span>—</span>
            <Input className="h-8 w-40" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button size="sm" variant="outline" onClick={() => void sync()}>
              <RefreshCw className="h-3.5 w-3.5" />Kabinetdan yangilash
            </Button>
          </div>
          {data ? (
            <p className="text-muted-foreground text-xs">
              {data.coverage
                ? `Saqlangan ma'lumot: ${formatDate(data.coverage.from)} — ${formatDate(data.coverage.to)}`
                : "Reklama hisoboti hali o'qilmagan — «Kabinetdan yangilash»ni bosing."}
              {data.syncedAt ? ` · oxirgi o'qish ${formatDate(data.syncedAt)}` : ""}
              {data.error ? ` · ${data.error}` : ""}
            </p>
          ) : null}
          {error ? <p className="text-sm text-[var(--bad)]">{error}</p> : null}
          {!data && !error ? <Skeleton className="h-24 w-full" /> : null}
          {s ? (
            <div className={`grid grid-cols-2 gap-3 md:grid-cols-4 ${loading ? "opacity-60" : ""}`}>
              <Kpi label="Xarajat" value={money(s.spend)} unit="so'm" now={s.spend} prev={p?.spend} lowerBetter />
              <Kpi label="Reklama tushumi" value={money(s.adRevenue)} unit="so'm" now={s.adRevenue} prev={p?.adRevenue} />
              <Kpi label="DRR / ACOS" value={pct(s.drr)} now={s.drr} prev={p?.drr} lowerBetter />
              <Kpi label="ROAS" value={times(s.roas)} now={s.roas} prev={p?.roas} />
              <Kpi label="TACoS" value={pct(s.tacos)} hint="jami tushumga nisbatan" />
              <Kpi label="CPO" value={money(s.cpo)} unit="so'm" now={s.cpo} prev={p?.cpo} lowerBetter />
              <Kpi label="CTR" value={pct(s.ctr)} hint={`${money(s.clicks)} klik / ${money(s.impressions)} ko'rsatish`} />
              <Kpi label="Reklamadan keyingi foyda" value={money(s.profitAfterAds)} unit="so'm"
                   bad={s.profitAfterAds != null && s.profitAfterAds < 0}
                   hint={s.profitAfterAds == null ? "tannarx to'liq emas" : undefined} />
            </div>
          ) : null}
          {p ? (
            <p className="text-muted-foreground text-xs">
              Solishtirish: {formatDate(p.from)} — {formatDate(p.to)}
              {p.complete ? "" : " (bu davr uchun ma'lumot to'liq saqlanmagan — o'zgarish taxminiy)"}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {data ? (
        <Card>
          <CardHeader>
            <CardTitle>Kampaniyalar</CardTitle>
            <CardDescription>
              CPO («Buyurtmalarni ko&apos;paytirish») — Uzum&apos;da har tovar o&apos;z reklamasi. Bust TOP kampaniyalari —
              eStats orqali yaratilganlar; boshqaruv{" "}
              <Link className="text-primary underline-offset-2 hover:underline" href={"/bust" as Route}>Bust TOP</Link>{" "}
              sahifasida.
              {data.lossCount ? <span className="text-[var(--bad)]"> Zarar: {data.lossCount} ta.</span> : null}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!data.campaigns.length ? (
              <p className="text-muted-foreground text-sm">Bu davrda reklama xarajati yo&apos;q.</p>
            ) : (
              <KpiTable rows={data.campaigns.map((c) => ({
                key: `${c.kind}-${c.id}`, title: c.name, sub: c.kind === "cpo"
                  ? `CPO${c.commission != null ? ` · ${c.commission}%` : ""}${c.status ? ` · ${c.status}` : ""}`
                  : `Bust TOP${c.autopilot ? " · avto-rejim" : ""}`, k: c,
              }))} />
            )}
            {caps && !caps.bustStats ? (
              <p className="text-muted-foreground mt-2 text-xs">{caps.blocked.bustStats}</p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {data?.products.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Tovarlar bo&apos;yicha</CardTitle>
            <CardDescription>
              Dona foydasi (FIFO) − CPO = reklama orqali sotilgan har donadan qoladigan foyda. Manfiy bo&apos;lsa reklama zarar.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-left text-xs">
                  <th className="p-2">Tovar</th>
                  <th className="p-2 text-right">Xarajat</th>
                  <th className="p-2 text-right">Oldingi</th>
                  <th className="p-2 text-right">Buyurtma</th>
                  <th className="p-2 text-right">DRR</th>
                  <th className="p-2 text-right">TACoS</th>
                  <th className="p-2 text-right">CPO</th>
                  <th className="p-2 text-right">Dona foydasi</th>
                  <th className="p-2 text-right">Reklamadan keyin</th>
                  <th className="p-2">Holat</th>
                </tr>
              </thead>
              <tbody>
                {data.products.map((r) => (
                  <tr key={r.productId}
                      className={`border-t ${r.verdict === "loss" ? "bg-[var(--bad)]/10" : ""}`}>
                    <td className="max-w-[300px] p-2">
                      <div className="truncate font-medium" title={r.title}>{r.title}</div>
                      {!r.own ? <div className="text-muted-foreground text-xs">eStats omborida yo&apos;q</div> : null}
                    </td>
                    <td className="p-2 text-right">{money(r.spend)}</td>
                    <td className="text-muted-foreground p-2 text-right">{money(r.prevSpend)}</td>
                    <td className="p-2 text-right">{r.orders ?? "—"}</td>
                    <td className="p-2 text-right">{pct(r.drr)}</td>
                    <td className="p-2 text-right">{pct(r.tacos)}</td>
                    <td className="p-2 text-right">{money(r.cpo)}</td>
                    <td className="p-2 text-right">{money(r.unitProfit)}</td>
                    <td className={`p-2 text-right ${(r.unitProfitAfterAds ?? 0) < 0 ? "font-semibold text-[var(--bad)]" : ""}`}>
                      {money(r.unitProfitAfterAds)}
                    </td>
                    <td className={`p-2 text-xs ${VERDICT[r.verdict].cls}`}>
                      {r.verdict === "loss" ? <AlertTriangle className="mr-1 inline h-3 w-3" /> : null}
                      {VERDICT[r.verdict].text}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

function Kpi({ label, value, unit, now, prev, lowerBetter, hint, bad }: {
  label: string; value: string; unit?: string; now?: number | null; prev?: number | null;
  lowerBetter?: boolean; hint?: string; bad?: boolean;
}) {
  let delta: React.ReactNode = null;
  if (now != null && prev != null && prev !== 0) {
    const change = ((now - prev) / Math.abs(prev)) * 100;
    const good = lowerBetter ? change < 0 : change > 0;
    delta = <span className={`text-xs ${good ? "text-[var(--ok)]" : "text-[var(--bad)]"}`}>{formatDelta(change)}</span>;
  }
  return (
    <div className="rounded-lg border p-3">
      <div className="text-muted-foreground text-xs">{label}</div>
      <div className={`text-lg font-semibold ${bad ? "text-[var(--bad)]" : ""}`}>
        {value}{unit && value !== "—" ? <span className="text-muted-foreground ml-1 text-xs font-normal">{unit}</span> : null}
      </div>
      <div className="flex items-center gap-2">{delta}{hint ? <span className="text-muted-foreground text-xs">{hint}</span> : null}</div>
    </div>
  );
}

function KpiTable({ rows }: { rows: { key: string; title: string; sub: string; k: AdKpis }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-muted-foreground text-left text-xs">
            <th className="p-2">Kampaniya</th>
            <th className="p-2 text-right">Xarajat</th>
            <th className="p-2 text-right">Ko&apos;rsatish</th>
            <th className="p-2 text-right">CTR</th>
            <th className="p-2 text-right">Buyurtma</th>
            <th className="p-2 text-right">Tushum</th>
            <th className="p-2 text-right">DRR</th>
            <th className="p-2 text-right">ROAS</th>
            <th className="p-2 text-right">Foyda (reklamadan keyin)</th>
            <th className="p-2">Holat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ key, title, sub, k }) => (
            <tr key={key} className={`border-t ${k.verdict === "loss" ? "bg-[var(--bad)]/10" : ""}`}>
              <td className="max-w-[280px] p-2">
                <div className="truncate font-medium" title={title}>{title}</div>
                <div className="text-muted-foreground text-xs">{sub}</div>
              </td>
              <td className="p-2 text-right">{money(k.spend)}</td>
              <td className="p-2 text-right">{money(k.impressions)}</td>
              <td className="p-2 text-right">{pct(k.ctr)}</td>
              <td className="p-2 text-right">{k.orders ?? "—"}</td>
              <td className="p-2 text-right">{money(k.adRevenue)}</td>
              <td className="p-2 text-right">{pct(k.drr)}</td>
              <td className="p-2 text-right">{times(k.roas)}</td>
              <td className={`p-2 text-right ${(k.profitAfterAds ?? 0) < 0 ? "font-semibold text-[var(--bad)]" : ""}`}>
                {money(k.profitAfterAds)}
              </td>
              <td className={`p-2 text-xs ${VERDICT[k.verdict].cls}`}>
                <Badge variant="outline" className={VERDICT[k.verdict].cls}>{VERDICT[k.verdict].text}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
