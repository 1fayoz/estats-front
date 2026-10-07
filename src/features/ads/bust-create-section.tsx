"use client";

import * as React from "react";
import { BadgeDollarSign, Rocket } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createBust, fetchBustInsights, startBustInsights,
  type BustInsightsJob, type BustPlan, type BustQueryBid,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";

/**
 * Uzum'ning o'rinlar narxi (kabinetdan, fonda) + kampaniya yaratish.
 *
 * Yaratish PUL SARFLAYDI (haftalik byudjet): ikki bosqichli tasdiq — summa
 * ko'rsatiladi; stavka shiftdan (beziyon) yuqori bo'lsa alohida belgi talab qilinadi.
 */
const VERDICT: Record<BustQueryBid["verdict"], { text: string; tone: string }> = {
  profitable: { text: "foydali", tone: "text-[var(--ok)]" },
  loss: { text: "zarar", tone: "text-[var(--bad)]" },
  unknown: { text: "shift yo'q", tone: "text-muted-foreground" },
  no_auction: { text: "aukcion yo'q", tone: "text-muted-foreground" },
};

export function BustCreateSection({ plan, minus }: { plan: BustPlan; minus: string[] }) {
  const [job, setJob] = React.useState<BustInsightsJob | null>(null);
  const [picked, setPicked] = React.useState<Record<string, number>>({});
  const [budget, setBudget] = React.useState(String(plan.minBudget));
  const [uniform, setUniform] = React.useState(true);
  const [name, setName] = React.useState(plan.title.slice(0, 40));
  const [minusText, setMinusText] = React.useState(minus.join("\n"));
  const [overOk, setOverOk] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => setMinusText(minus.join("\n")), [minus]);

  React.useEffect(() => {
    if (job?.status !== "running") return;
    const t = window.setInterval(() => {
      fetchBustInsights(job.job).then(setJob).catch(() => undefined);
    }, 4000);
    return () => window.clearInterval(t);
  }, [job?.status, job?.job]);

  const group = job?.result?.groups?.[0] ?? null;
  const ceiling = job?.result?.bidCeiling ?? plan.bidCeiling;
  const chosen = Object.entries(picked);
  const over = chosen.some(([, cpm]) => ceiling != null && cpm > ceiling);
  const pct = job?.status === "running"
    ? Math.min(95, Math.round(((job.elapsedSeconds ?? 0) / Math.max(job.expectedSeconds, 1)) * 100))
    : null;

  const toggle = (q: BustQueryBid) =>
    setPicked((prev) => {
      const next = { ...prev };
      if (q.query in next) delete next[q.query];
      else next[q.query] = q.suggestedCpm ?? q.recommendedBid ?? 0;
      return next;
    });

  const submit = async () => {
    if (!group) return;
    setSending(true);
    try {
      await createBust({
        productId: plan.productId,
        skuGroupId: group.skuGroupId,
        name,
        weeklyAmount: Number(budget),
        uniform,
        ads: chosen.map(([query, cpm]) => ({ query, cpm })),
        minus: minusText.split("\n").map((s) => s.trim()).filter(Boolean),
        allowOverCeiling: overOk,
        confirm: true,
      });
      toast.success("Kampaniya Uzum'da yaratildi — kabinetda «Bust TOP» bo'limida ko'rinadi");
      setConfirming(false);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 border-t pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" disabled={job?.status === "running"}
                onClick={() => startBustInsights(plan.productId).then(setJob).catch((e: Error) => toast.error(e.message))}>
          <BadgeDollarSign className="h-3.5 w-3.5" />
          {job?.status === "running" ? `Uzum narxlari olinmoqda · ${pct}%` : "Uzum'dagi o'rinlar narxini olish"}
        </Button>
        {job?.status === "running" ? (
          <span className="text-muted-foreground text-xs">
            kabinet ochilmoqda · {Math.round(job.elapsedSeconds ?? 0)} s · taxminan{" "}
            {Math.max(0, Math.round(job.expectedSeconds - (job.elapsedSeconds ?? 0)))} s qoldi
          </span>
        ) : null}
      </div>
      {job?.status === "failed" ? <p className="text-[var(--bad)] text-xs">{job.error}</p> : null}

      {group ? (
        <div className="space-y-3">
          <p className="text-muted-foreground text-xs">
            Narxlar — Uzum&apos;ning o&apos;zi (1000 ko&apos;rsatish uchun). Shift:{" "}
            {ceiling != null ? `${formatNumber(ceiling)} so'm` : "hisoblanmagan"} — undan qimmat ko&apos;rsatish zarar.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground text-left">
                  <th className="p-1" />
                  <th className="p-1">So&apos;rov</th>
                  <th className="p-1 text-right">Uzum tavsiyasi</th>
                  <th className="p-1 text-right">1-o&apos;rin</th>
                  <th className="p-1">Holat</th>
                  <th className="p-1 text-right">Stavka</th>
                </tr>
              </thead>
              <tbody>
                {group.queries.filter((q) => q.ok).map((q) => (
                  <tr key={q.query} className="border-t">
                    <td className="p-1">
                      <input type="checkbox" checked={q.query in picked} onChange={() => toggle(q)}
                             aria-label={`${q.query} tanlash`} />
                    </td>
                    <td className="p-1">{q.query}{q.recommendedByUzum ? <span className="text-muted-foreground"> · Uzum</span> : null}</td>
                    <td className="p-1 text-right">{q.recommendedBid != null ? formatNumber(q.recommendedBid) : "—"}</td>
                    <td className="p-1 text-right">{q.topPositionCpm ? formatNumber(q.topPositionCpm) : "—"}</td>
                    <td className={`p-1 ${VERDICT[q.verdict].tone}`}>{VERDICT[q.verdict].text}</td>
                    <td className="p-1 text-right">
                      {q.query in picked ? (
                        <Input type="number" className="h-7 w-24 text-right" value={picked[q.query]}
                               onChange={(e) => setPicked((p) => ({ ...p, [q.query]: Number(e.target.value) }))} />
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {chosen.length ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="space-y-1">
                <span className="text-muted-foreground text-xs">Kampaniya nomi</span>
                <Input value={name} maxLength={50} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="space-y-1">
                <span className="text-muted-foreground text-xs">Haftalik byudjet, so&apos;m (kamida {formatNumber(plan.minBudget)})</span>
                <Input type="number" min={plan.minBudget} value={budget} onChange={(e) => setBudget(e.target.value)} />
              </label>
              <label className="flex items-center gap-2 text-xs sm:col-span-2">
                <input type="checkbox" checked={uniform} onChange={(e) => setUniform(e.target.checked)} />
                Bir tekisda — kuniga byudjetning ko&apos;pi bilan 20% (kurs: o&apos;rganish uchun shoshilmang)
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-muted-foreground text-xs">Minus so&apos;zlar (har biri yangi qatorda)</span>
                <textarea className="min-h-20 w-full rounded-md border bg-transparent p-2 text-xs" value={minusText}
                          onChange={(e) => setMinusText(e.target.value)} />
              </label>
              {over ? (
                <label className="flex items-center gap-2 text-xs text-[var(--bad)] sm:col-span-2">
                  <input type="checkbox" checked={overOk} onChange={(e) => setOverOk(e.target.checked)} />
                  Ayrim stavkalar shiftdan yuqori — har ko&apos;rsatish zarar bo&apos;lishini bilaman
                </label>
              ) : null}
              <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
                {!confirming ? (
                  <Button size="sm" disabled={(over && !overOk) || Number(budget) < plan.minBudget}
                          onClick={() => setConfirming(true)}>
                    <Rocket className="h-3.5 w-3.5" />Uzum&apos;da yaratish
                  </Button>
                ) : (
                  <>
                    <Button size="sm" variant="destructive" disabled={sending} onClick={() => void submit()}>
                      {sending ? "Yaratilmoqda…" : `Ha, yaratish — haftasiga ${formatNumber(Number(budget))} so'mgacha`}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Bekor qilish</Button>
                    <span className="text-muted-foreground text-xs">
                      {chosen.length} so&apos;rov · pul faqat haqiqiy ko&apos;rsatishlar uchun yechiladi
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">Kampaniyaga kiradigan so&apos;rovlarni belgilang.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
