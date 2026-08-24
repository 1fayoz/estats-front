"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Info,
  PackageX,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { GoalJourney } from "@/features/plan/components/goal-journey";
import { GoalDialog } from "@/features/plan/components/goal-dialog";
import { ApiError, achieveGoal, deleteGoal, fetchPlan } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/utils";
import type { Goal, Insight, Plan } from "@/lib/types";

export default function PlanPage() {
  const [plan, setPlan] = React.useState<Plan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [adding, setAdding] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      setPlan(await fetchPlan());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  const onAchieve = async (goal: Goal) => {
    try {
      await achieveGoal(goal.id);
      toast.success(`«${goal.title}» — tabriklaymiz! 🎉`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    }
  };

  const onDelete = async (goal: Goal) => {
    try {
      await deleteGoal(goal.id);
      await load();
      toast.success("Maqsad o'chirildi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    }
  };

  if (loading && !plan) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {error ?? "Ma'lumot yo'q"}
      </div>
    );
  }

  const { balance, rate, forecast } = plan;
  const growing = rate.trendPercent >= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reja"
        description="Hozir qancha pul kutilyapti, qanday sur'atda o'syapti va shu ketishda nimaga yetadi."
      />

      {/* ── Balans ───────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-info/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Wallet className="h-4 w-4" /> Kutilayotgan pul
            </div>
            <BigNumber value={balance.expected} />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="To'lovga tayyor" value={balance.readyToWithdraw} tone="positive" />
              <Mini label="Yo'lda (kafolatsiz)" value={balance.inProgress} />
              <Mini label="Omborda muzlagan" value={balance.stockValue} />
              <Mini label="Bu oy sof foyda" value={plan.thisMonth} tone="positive" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Uzum&apos;da balans endpointi yo&apos;q — bu raqamlar buyurtma satrlaridan
              hisoblanadi. &quot;To&apos;lovga tayyor&quot; — Uzum to&apos;lashga
              tayyorlagan summa; &quot;yo&apos;lda&quot; — hali yetkazilmagan va bir
              qismi bekor bo&apos;lishi mumkin.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Sur'at va prognoz ────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Sur&apos;at va prognoz</CardTitle>
              <CardDescription>
                {`Oxirgi ${rate.windowDays} kun bo'yicha o'rtacha kunlik sof foyda` +
                  (rate.activeDays > 0 ? ` (${rate.activeDays} kun sotuv bo'lgan)` : "")}
              </CardDescription>
            </div>
            <Badge variant={growing ? "success" : "warning"} className="gap-1">
              {growing ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {rate.trendPercent > 0 ? "+" : ""}
              {rate.trendPercent.toFixed(0)}% (7 kun)
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4">
            <div className="text-xs text-muted-foreground">Kunlik sof foyda</div>
            <div className="text-2xl font-bold tabular-nums">
              {formatSum(rate.dailyProfit)}
            </div>
            <div className="text-xs text-muted-foreground">
              kuniga ~{rate.dailyUnits} dona · {formatSum(rate.dailyRevenue)} tushum
            </div>
          </div>

          {forecast.days30 > 0 ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "7 kunda", value: forecast.days7, delay: 0 },
                { label: "30 kunda", value: forecast.days30, delay: 0.08 },
                { label: "90 kunda", value: forecast.days90, delay: 0.16 },
                { label: "1 yilda", value: forecast.days365, delay: 0.24, hero: true },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay, duration: 0.35 }}
                  className={cn(
                    "rounded-lg border p-4",
                    item.hero && "border-primary/40 bg-primary/5"
                  )}
                >
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div
                    className={cn(
                      "mt-0.5 font-semibold tabular-nums",
                      item.hero && "text-primary"
                    )}
                  >
                    {formatSum(item.value)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Bashorat uchun sotuv tarixi hali kam. Ma&apos;lumot to&apos;planishi bilan
              bu yerda 7 kun, 30 kun va 1 yillik prognoz paydo bo&apos;ladi.
            </p>
          )}

          <p className="text-xs text-muted-foreground">
            Prognoz — hozirgi sur&apos;at o&apos;zgarmasa degan taxmin, va&apos;da emas.
            Mavsum, reklama va qoldiq uni o&apos;zgartiradi.
          </p>
        </CardContent>
      </Card>

      {/* ── Maqsadlar ────────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maqsadlar yo&apos;li</CardTitle>
          <CardDescription>
            Har bir bosqich — kutilayotgan pulga nisbatan o&apos;lchanadi. Arzonidan
            qimmatiga qarab tartiblanadi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalJourney
            goals={plan.goals}
            dailyProfit={rate.dailyProfit}
            onAdd={() => setAdding(true)}
            onAchieve={onAchieve}
            onDelete={onDelete}
          />
        </CardContent>
      </Card>

      {/* ── Xulosalar ────────────────────────────────────────────────────── */}
      {plan.insights.length > 0 && (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {plan.insights.map((insight, index) => (
            <InsightCard key={insight.title} insight={insight} index={index} />
          ))}
        </div>
      )}

      {/* ── Tugayotgan tovarlar ──────────────────────────────────────────── */}
      {plan.stockouts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PackageX className="h-4 w-4" /> Tugayotgan tovarlar
            </CardTitle>
            <CardDescription>
              Hozirgi sotuv sur&apos;atida qoldiq necha kunga yetadi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.stockouts.map((item) => {
              const urgent = item.daysLeft != null && item.daysLeft <= 7;
              const soon = item.daysLeft != null && item.daysLeft <= 14;
              return (
                <Link
                  key={item.productId}
                  href={`/warehouse/${item.productId}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-10 w-10 rounded-md border object-cover" />
                  ) : (
                    <div className="h-10 w-10 rounded-md border bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">
                      qoldiq {formatNumber(item.onHand)} dona · kuniga ~{item.dailyRate}
                    </div>
                  </div>
                  <Badge variant={urgent ? "destructive" : soon ? "warning" : "secondary"} className="gap-1">
                    <Clock className="h-3 w-3" />
                    {item.daysLeft} kun
                  </Badge>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* ── Eng foydali tovarlar ─────────────────────────────────────────── */}
      {plan.topProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4" /> Foydangiz qayerdan kelyapti
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {plan.topProducts.map((item, index) => (
              <Link
                key={item.productId}
                href={`/warehouse/${item.productId}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <span className="w-5 shrink-0 text-center text-sm font-semibold text-muted-foreground">
                  {index + 1}
                </span>
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-10 w-10 rounded-md border object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-md border bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.title}</div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.share}%` }}
                      transition={{ delay: 0.1 + index * 0.06, duration: 0.7 }}
                    />
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {formatSum(item.profit)}
                  </div>
                  <div className="text-xs text-muted-foreground">{item.share.toFixed(0)}%</div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      <GoalDialog
        open={adding}
        onOpenChange={setAdding}
        onSaved={load}
        dailyProfit={rate.dailyProfit}
      />
    </div>
  );
}

function BigNumber({ value }: { value: number }) {
  const animated = useCountUp(value);
  return (
    <div className="mt-1 text-4xl font-bold tabular-nums tracking-tight md:text-5xl">
      {formatSum(animated)}
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "positive";
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400"
        )}
      >
        {formatSum(value)}
      </div>
    </div>
  );
}

const INSIGHT_STYLE = {
  good: { icon: CheckCircle2, cls: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/5", text: "text-amber-600 dark:text-amber-500" },
  danger: { icon: AlertTriangle, cls: "border-destructive/40 bg-destructive/5", text: "text-destructive" },
  info: { icon: Info, cls: "", text: "text-muted-foreground" },
} as const;

function InsightCard({ insight, index }: { insight: Insight; index: number }) {
  const style = INSIGHT_STYLE[insight.kind] ?? INSIGHT_STYLE.info;
  const Icon = style.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={cn("flex items-start gap-3 rounded-xl border p-4 text-sm", style.cls)}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.text)} />
      <div>
        <div className="font-medium">{insight.title}</div>
        <div className="mt-0.5 text-muted-foreground">{insight.detail}</div>
      </div>
    </motion.div>
  );
}
