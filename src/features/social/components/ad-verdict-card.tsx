"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, HelpCircle, Megaphone, XCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAdVerdict } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdVerdict } from "@/lib/types";

const STYLE = {
  good: {
    icon: CheckCircle2,
    cls: "border-emerald-500/40 bg-emerald-500/5",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  careful: {
    icon: AlertTriangle,
    cls: "border-amber-500/40 bg-amber-500/5",
    text: "text-amber-600 dark:text-amber-500",
  },
  no: { icon: XCircle, cls: "border-destructive/40 bg-destructive/5", text: "text-destructive" },
  unknown: { icon: HelpCircle, cls: "border-dashed", text: "text-muted-foreground" },
} as const;

/**
 * "Bu tovarga reklama kerakmi yoki u reklamasiz ham ketyaptimi."
 *
 * Bu Meta bergan bashorat EMAS — sotuvchining o'z foydasi va o'z organik
 * sur'ati ustiga qurilgan hisob. Shuning uchun kartada hech qanday
 * "reklama shuncha keltiradi" degan va'da yo'q.
 */
export function AdVerdictCard({ productId }: { productId: number }) {
  const [data, setData] = React.useState<AdVerdict | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchAdVerdict(productId)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;
  if (!data) return null;

  const style = STYLE[data.verdict] ?? STYLE.unknown;
  const Icon = style.icon;

  return (
    <Card className={cn(style.cls)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Megaphone className="h-4 w-4" /> Reklama kerakmi?
        </CardTitle>
        <CardDescription>
          Hisob sizning o&apos;z foydangiz va o&apos;z sotuv sur&apos;atingizdan
          chiqadi — bu Meta bashorati emas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.text)} />
          <div className="font-medium">{data.headline}</div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat
            label="Bir donadan foyda"
            value={data.profitPerUnit != null ? formatSum(data.profitPerUnit) : "—"}
          />
          <Stat
            label="Reklamasiz sotuv"
            value={`${data.organicUnitsPerDay} dona/kun`}
            hint={
              data.organicProfitPerDay > 0
                ? `${formatSum(data.organicProfitPerDay)}/kun`
                : undefined
            }
          />
          <Stat
            label="Bitta xaridor"
            value={
              data.costPerCustomerLow != null
                ? `${formatSum(data.costPerCustomerLow)} dan`
                : "—"
            }
            hint={
              data.costPerCustomerHigh != null
                ? `${formatSum(data.costPerCustomerHigh)} gacha`
                : undefined
            }
          />
          <Stat
            label="Kunlik chegara"
            value={data.maxSensibleDaily != null ? formatSum(data.maxSensibleDaily) : "—"}
            accent={data.maxSensibleDaily != null}
          />
        </div>

        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {data.reasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-current" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        <p className="text-xs text-muted-foreground">
          &quot;Bitta xaridor&quot; — bosish narxini xaridga aylanish ulushiga bo&apos;lib
          chiqarilgan oraliq. U do&apos;konga qarab keskin farq qiladi, shuning uchun
          bitta aniq son emas, oraliq ko&apos;rsatiladi.
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-semibold tabular-nums", accent && "text-primary")}>
        {value}
      </div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
