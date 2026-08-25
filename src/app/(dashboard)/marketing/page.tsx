"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, Copy, Info, Snowflake, Target, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMarketingReport } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { cn } from "@/lib/utils";
import type { MarketingReport } from "@/lib/types";

const KIND = {
  good: { icon: CheckCircle2, cls: "border-emerald-500/40 bg-emerald-500/5", text: "text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/5", text: "text-amber-600 dark:text-amber-500" },
  danger: { icon: AlertTriangle, cls: "border-destructive/40 bg-destructive/5", text: "text-destructive" },
  info: { icon: Info, cls: "", text: "text-muted-foreground" },
} as const;

export default function MarketingPage() {
  const [data, setData] = React.useState<MarketingReport | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      setData(await fetchMarketingReport());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }
  if (!data) return null;

  const copyProof = (title: string, proof: string[]) => {
    const text = proof.length ? `${title}\n\n${proof.map((p) => `• ${p}`).join("\n")}` : title;
    void navigator.clipboard?.writeText(text);
    toast.success("Nusxalandi — postga qo'ying");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marketing"
        description={`Oxirgi ${data.windowDays} kun. Har tavsiya sizning o'z raqamingizdan chiqadi — umumiy maslahat emas.`}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label={`${data.windowDays} kunlik foyda`} value={formatSum(data.totalProfit)} />
        <Stat label="Sotilgan" value={`${formatNumber(data.totalUnits)} dona`} />
        <Stat
          label="Ishlayotgan tovar"
          value={`${data.productsSold} / ${data.productsTotal}`}
        />
        <Stat label="Auditoriya" value={formatNumber(data.audience)} />
      </div>

      {/* ── Nima qilish kerak ───────────────────────────────────────────── */}
      {data.actions.length > 0 && (
        <div className="space-y-3">
          {data.actions.map((action, index) => {
            const style = KIND[action.kind] ?? KIND.info;
            const Icon = style.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.35 }}
                className={cn("flex items-start gap-3 rounded-xl border p-4", style.cls)}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.text)} />
                <div>
                  <div className="font-medium">{action.title}</div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{action.detail}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ── Yetakchilar ─────────────────────────────────────────────────── */}
      {data.winners.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" /> Pulni keltirayotgan tovarlar
            </CardTitle>
            <CardDescription>
              {`${data.coreCount} ta tovar foydangizning ${data.coreShare.toFixed(0)}% ini beryapti. Kuchni shularga qarating.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.winners.map((item) => (
              <div key={item.productId} className="rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt="" className="h-11 w-11 shrink-0 rounded-md border object-cover" />
                  ) : (
                    <div className="h-11 w-11 shrink-0 rounded-md border bg-muted" />
                  )}
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/warehouse/${item.productId}` as Route}
                      className="block truncate text-sm font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>{`${item.units} dona · ${formatSum(item.profit)}`}</span>
                      <Badge variant="secondary">{`foydaning ${item.profitShare.toFixed(0)}%`}</Badge>
                      {item.marginPercent != null && (
                        <Badge variant={item.marginPercent < 15 ? "warning" : "success"}>
                          {`marja ${item.marginPercent.toFixed(0)}%`}
                        </Badge>
                      )}
                      {item.stock <= 0 && <Badge variant="destructive">qoldiq yo&apos;q</Badge>}
                    </div>
                  </div>
                  {item.proof.length > 0 && (
                    <button
                      type="button"
                      onClick={() => copyProof(item.title, item.proof)}
                      className="shrink-0 rounded-md border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      title="Dalillarni nusxalash"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {item.proof.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.proof.map((p) => (
                      <span
                        key={p}
                        className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                )}
                {item.actions.map((a) => (
                  <p key={a} className="mt-2 text-xs text-amber-600 dark:text-amber-500">
                    {a}
                  </p>
                ))}
              </div>
            ))}
            <p className="pt-1 text-xs text-muted-foreground">
              Yashil belgilar — postga qo&apos;yish mumkin bo&apos;lgan HAQIQIY dalillar.
              O&apos;ylab topilgan &quot;eng ko&apos;p sotilgan&quot; yozuvi bu yerda
              hech qachon chiqmaydi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Muzlagan pul ────────────────────────────────────────────────── */}
      {data.dead.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Snowflake className="h-4 w-4" /> Sotilmayotgan qoldiq
            </CardTitle>
            <CardDescription>
              {`Oxirgi ${data.windowDays} kunda umuman sotilmagan, lekin omborda turibdi.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.dead.map((item) => (
              <Link
                key={item.productId}
                href={`/warehouse/${item.productId}` as Route}
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
                    {`qoldiq ${formatNumber(item.stock)} dona${item.price ? ` · ${formatSum(item.stock * item.price)} muzlagan` : ""}`}
                  </div>
                </div>
                <TrendingUp className="h-4 w-4 shrink-0 rotate-180 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}
