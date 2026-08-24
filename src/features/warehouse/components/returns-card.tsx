"use client";

import { AlertTriangle, CheckCircle2, PackageX, Truck, XCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductReturnRow, ReturnsSummary } from "@/lib/types";

const STATUS_LABEL: Record<string, string> = {
  pending: "tayyorlanmoqda",
  sent: "yo'lda",
  completed: "qabul qilindi",
  canceled: "bekor qilindi",
};

/**
 * Returned goods, and the question that actually matters: is it back with me?
 *
 * Uzum releases a returned unit back into the stock figure as soon as the buyer
 * cancels — but the item itself can still be in transit for weeks, or arrive
 * damaged. So the warehouse number can be right on paper and wrong on the shelf.
 * This card makes that gap explicit instead of letting it hide inside "qoldiq".
 */
export function ReturnsCard({
  returns,
  summary,
}: {
  returns: ProductReturnRow[];
  summary: ReturnsSummary;
}) {
  if (!returns.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <PackageX className="h-4 w-4" /> Qaytarishlar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Bu tovar bo&apos;yicha qaytarish yo&apos;q.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PackageX className="h-4 w-4" /> Qaytarishlar
        </CardTitle>
        <CardDescription>
          Zakaz qilingan, lekin qaytarilgan tovarlar — va ularning qaysi biri
          haqiqatan qo&apos;lingizga yetib kelgani.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat icon={PackageX} label="Jami qaytgan" value={summary.totalQuantity} />
          <Stat
            icon={CheckCircle2}
            label="Qo'limda"
            value={summary.receivedQuantity}
            tone="positive"
          />
          <Stat
            icon={Truck}
            label="Yo'lda"
            value={summary.pendingQuantity}
            tone={summary.pendingQuantity > 0 ? "warning" : undefined}
          />
          <Stat
            icon={XCircle}
            label="Nuqsonli"
            value={summary.defectedQuantity}
            tone={summary.defectedQuantity > 0 ? "negative" : undefined}
          />
        </div>

        {summary.pendingQuantity > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <span className="font-medium">
                {formatNumber(summary.pendingQuantity)} dona hali yo&apos;lda.
              </span>{" "}
              Uzum bu donalarni hisobda qoldig&apos;ingizga qaytargan, lekin ular
              jismonan hali kelmagan — ya&apos;ni ombordagi raqam shuncha donaga
              optimistik. Yetib kelgach, holat &quot;qabul qilindi&quot;ga o&apos;zgaradi.
            </div>
          </div>
        )}

        {summary.defectedQuantity > 0 && (
          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <div>
              <span className="font-medium">
                {formatNumber(summary.defectedQuantity)} dona nuqsonli qaytgan.
              </span>{" "}
              Ularni qayta sotib bo&apos;lmaydi — tan narxi zarar sifatida qoladi.
            </div>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Sana</th>
                <th className="px-3 py-2 text-right font-medium">Dona</th>
                <th className="px-3 py-2 text-left font-medium">Holat</th>
                <th className="px-3 py-2 text-left font-medium">Qo&apos;limdami?</th>
                <th className="px-3 py-2 text-left font-medium">Nakladnoy</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {returns.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-muted/30">
                  <td className="whitespace-nowrap px-3 py-2 tabular-nums">
                    {row.returnedAt.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 text-right font-medium tabular-nums">
                    {formatNumber(row.quantity)}
                  </td>
                  <td className="px-3 py-2">
                    <Badge
                      variant={
                        row.status === "completed"
                          ? "success"
                          : row.status === "canceled"
                            ? "secondary"
                            : "warning"
                      }
                      className="text-[10px]"
                    >
                      {STATUS_LABEL[row.status] ?? row.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-2">
                    {row.status === "canceled" ? (
                      <span className="text-muted-foreground">—</span>
                    ) : row.isResellable ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ha, sotsa bo&apos;ladi
                      </span>
                    ) : row.isReceived ? (
                      <span className="flex items-center gap-1.5 text-destructive">
                        <XCircle className="h-3.5 w-3.5" /> Keldi, lekin nuqsonli
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                        <Truck className="h-3.5 w-3.5" /> Yo&apos;q, yo&apos;lda
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                    #{row.externalReturnId}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone?: "positive" | "warning" | "negative";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "positive" && "border-emerald-500/40 bg-emerald-500/5",
        tone === "warning" && "border-amber-500/40 bg-amber-500/5",
        tone === "negative" && "border-destructive/40 bg-destructive/5"
      )}
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "warning" && "text-amber-600 dark:text-amber-500",
          tone === "negative" && "text-destructive"
        )}
      >
        {formatNumber(value)} dona
      </div>
    </div>
  );
}
