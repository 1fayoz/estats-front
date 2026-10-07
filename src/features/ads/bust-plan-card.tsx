"use client";

import * as React from "react";
import { Copy, Rocket, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchBustAi, fetchBustPlan, startBustAi, type BustAiJob, type BustPlan } from "@/lib/api";
import { formatNumber } from "@/lib/format";

import { BustCreateSection } from "./bust-create-section";

/**
 * Bust TOP rejasi — Uzum'ga HECH NARSA yozmaydi.
 *
 * O'lchangan: tayyorlik (sharh ≥20 — kurs qoidasi, qoldiq, dona foydasi), 1000 ko'rsatish
 * uchun beziyon stavka (voronkadan), tovar chiqqan so'rovlar. AI: kalit va minus so'zlar;
 * tovar chiqqan so'zga tegadigan minus so'zni backend o'zi olib tashlaydi.
 */
export function BustPlanCard({ productId }: { productId: number }) {
  const [plan, setPlan] = React.useState<BustPlan | null>(null);
  const [hidden, setHidden] = React.useState(false);
  const [job, setJob] = React.useState<BustAiJob | null>(null);

  React.useEffect(() => {
    fetchBustPlan(productId)
      .then(setPlan)
      .catch((err) => {
        if (err instanceof ApiError && [403, 404, 405].includes(err.status)) setHidden(true);
      });
  }, [productId]);

  React.useEffect(() => {
    if (job?.status !== "running") return;
    const t = window.setInterval(() => {
      fetchBustAi(job.job).then(setJob).catch(() => undefined);
    }, 3000);
    return () => window.clearInterval(t);
  }, [job?.status, job?.job]);

  if (hidden || !plan) return null;

  const copy = (items: string[], what: string) => {
    void navigator.clipboard.writeText(items.join("\n"));
    toast.success(`${what} nusxalandi (${items.length} ta)`);
  };
  const blocked = plan.readiness.some((r) => r.level === "block");
  const pct = job?.status === "running"
    ? Math.min(95, Math.round(((job.elapsedSeconds ?? 0) / Math.max(job.expectedSeconds, 1)) * 100))
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Rocket className="h-4 w-4" />Bust TOP rejasi</CardTitle>
        <CardDescription>
          Reja va Uzum narxlari faqat o&apos;qiladi; kampaniya faqat siz «Ha, yaratish» ni bosganingizda yaratiladi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {plan.readiness.length ? (
          <ul className="space-y-1">
            {plan.readiness.map((r) => (
              <li key={r.text} className={r.level === "block" ? "text-[var(--bad)]" : "text-[var(--warn)]"}>
                {r.level === "block" ? "⛔ " : "⚠ "}{r.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[var(--ok)]">Tovar tayyor: sharh {plan.reviews}, qoldiq {plan.onHand}, dona foydasi bor.</p>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-muted-foreground text-xs">Stavka shifti (1000 ko&apos;rsatish)</div>
            <div className="text-lg font-semibold">
              {plan.bidCeiling != null ? `${formatNumber(plan.bidCeiling)} so'm` : "—"}
            </div>
            <div className="text-muted-foreground text-xs">
              {plan.bidCeiling != null
                ? `${plan.bidCeilingFormula}; ${formatNumber(plan.funnel.impressions)} ko'rsatish, ${plan.funnel.orders} buyurtma`
                : "Voronkada ko'rsatish/buyurtma yoki tannarx yetarli emas"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Dona foydasi (FIFO, 90 kun)</div>
            <div className="text-lg font-semibold">
              {plan.unitProfit != null ? `${formatNumber(plan.unitProfit)} so'm` : "—"}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs">Minimal byudjet</div>
            <div className="text-lg font-semibold">{formatNumber(plan.minBudget)} so&apos;m</div>
            <div className="text-muted-foreground text-xs">kurs: tugash sanasini qo&apos;ymang, bitta rangdan boshlang</div>
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium">Tovar chiqqan so&apos;rovlar ({plan.targets.length})</span>
            {plan.targets.length ? (
              <Button size="sm" variant="ghost" onClick={() => copy(plan.targets.map((t) => t.phrase), "So'rovlar")}>
                <Copy className="h-3.5 w-3.5" />Nusxa
              </Button>
            ) : null}
          </div>
          {plan.targets.length ? (
            <div className="flex flex-wrap gap-1.5">
              {plan.targets.map((t) => (
                <span key={t.phrase} className="rounded-md border px-2 py-0.5 text-xs"
                      title={`eng yaxshi o'rin ${t.bestPosition}${t.demand != null ? `, talab ${t.demand}` : ""}`}>
                  {t.phrase} · {t.bestPosition}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-xs">
              Kuzatilgan so&apos;rovlarda tovar hali topilmagan — «Qidiruvdagi o&apos;rin» bo&apos;limida o&apos;lchang.
            </p>
          )}
        </div>

        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center gap-2">
            <Button size="sm" disabled={job?.status === "running" || blocked}
                    onClick={() => startBustAi(productId).then(setJob).catch((e: Error) => toast.error(e.message))}>
              <Sparkles className="h-3.5 w-3.5" />
              {job?.status === "running" ? `AI tahlil qilmoqda · ${pct}%` : "AI bilan kalit va minus so'zlar"}
            </Button>
            {job?.status === "running" ? (
              <span className="text-muted-foreground text-xs">
                {Math.round(job.elapsedSeconds ?? 0)} s · taxminan {Math.max(0, Math.round(job.expectedSeconds - (job.elapsedSeconds ?? 0)))} s qoldi
              </span>
            ) : null}
          </div>
          {job?.status === "failed" ? <p className="text-[var(--bad)] text-xs">{job.error}</p> : null}
          {job?.status === "done" && job.result ? (
            <div className="space-y-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">Kalit so&apos;zlar ({job.result.keywords.length})</span>
                  <Button size="sm" variant="ghost" onClick={() => copy(job.result!.keywords.map((k) => k.phrase), "Kalit so'zlar")}>
                    <Copy className="h-3.5 w-3.5" />Nusxa
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.result.keywords.map((k) => (
                    <span key={k.phrase} className="rounded-md border px-2 py-0.5 text-xs"
                          title={k.measured ? "o'lchangan so'rov" : "AI taklifi — hali o'lchanmagan"}>
                      {k.phrase}{k.measured ? "" : " ·AI"}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium">Minus so&apos;zlar ({job.result.minus.length})</span>
                  <Button size="sm" variant="ghost" onClick={() => copy(job.result!.minus, "Minus so'zlar")}>
                    <Copy className="h-3.5 w-3.5" />Nusxa
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {job.result.minus.map((m) => (
                    <span key={m} className="rounded-md border px-2 py-0.5 text-xs">−{m}</span>
                  ))}
                </div>
                {job.result.minusRejected.length ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Olib tashlandi (tovar shu so&apos;zlarda chiqadi): {job.result.minusRejected.join(", ")}
                  </p>
                ) : null}
              </div>
              {job.result.notes ? <p className="text-muted-foreground text-xs">{job.result.notes}</p> : null}
              <p className="text-muted-foreground text-xs">
                Kurs: har 2 soatda kalit so&apos;z statistikasini ko&apos;rib, tegishli bo&apos;lmaganini minusga o&apos;tkazing;
                stavkani shiftdan oshirmang.
              </p>
            </div>
          ) : null}
        </div>

        {!blocked ? <BustCreateSection plan={plan} minus={job?.result?.minus ?? []} /> : null}
      </CardContent>
    </Card>
  );
}
