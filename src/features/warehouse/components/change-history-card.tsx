"use client";

import * as React from "react";
import { History, RotateCcw, TrendingDown, TrendingUp, Minus, HelpCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchChangeImpact, revertProductChange } from "@/lib/api";
import { formatDate, formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ChangeImpact, ProductChangeLog } from "@/lib/types";

const FIELD_LABEL: Record<string, string> = {
  title_uz: "Nom (o'zbekcha)",
  title_ru: "Nom (ruscha)",
  description_uz: "Tavsif (o'zbekcha)",
  description_ru: "Tavsif (ruscha)",
};

const REVERTABLE = new Set(Object.keys(FIELD_LABEL));

function truncate(text: string | null, max = 140): string {
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

const VERDICT: Record<string, { label: string; tone: string; Icon: typeof TrendingUp }> = {
  improved: { label: "yaxshilandi", tone: "text-emerald-600 dark:text-emerald-400", Icon: TrendingUp },
  worsened: { label: "yomonlashdi", tone: "text-destructive", Icon: TrendingDown },
  flat: { label: "o'zgarmadi", tone: "text-muted-foreground", Icon: Minus },
  unknown: { label: "ma'lumot yetarli emas", tone: "text-muted-foreground", Icon: HelpCircle },
};

function ImpactRow({ impact }: { impact: ChangeImpact }) {
  const v = VERDICT[impact.verdict] ?? VERDICT.unknown;
  return (
    <div className="mt-2 rounded-md border bg-muted/30 p-2 text-xs">
      <div className={cn("mb-1.5 flex items-center gap-1.5 font-medium", v.tone)}>
        <v.Icon className="h-3.5 w-3.5" /> SEO va sotuv: {v.label}
      </div>
      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
        <div>
          <div className="font-medium text-foreground">Oldin (~{impact.before.days} kun)</div>
          <div>
            O&apos;rin:{" "}
            {impact.before.avgPosition != null
              ? `~${formatNumber(impact.before.avgPosition)}`
              : "o'lchanmagan"}
          </div>
          <div>Kunlik sotuv: {formatNumber(impact.before.dailySold)} dona</div>
          <div>Kunlik tushum: {formatSum(impact.before.dailyRevenue)}</div>
        </div>
        <div>
          <div className="font-medium text-foreground">Keyin (~{impact.after.days} kun)</div>
          <div>
            O&apos;rin:{" "}
            {impact.after.avgPosition != null
              ? `~${formatNumber(impact.after.avgPosition)}`
              : "o'lchanmagan"}
          </div>
          <div>Kunlik sotuv: {formatNumber(impact.after.dailySold)} dona</div>
          <div>Kunlik tushum: {formatSum(impact.after.dailyRevenue)}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Kartochkaning matn/nom tarixi: nima, qachon, nima uchun o'zgargani va
 * o'zgarishdan oldin/keyin SEO o'rni va sotuv qanday bo'lgani.
 *
 * Nima uchun kerak. Sotuvchi AI yoki Auto-Fix bilan tavsifni tuzatgach
 * "bu YAXSHI bo'ldimi?" degan savolga hech qanday raqamsiz javob
 * topolmasdi. Endi har o'zgarish o'zining oldin/keyin oynasi bilan
 * keladi va yoqmasa bitta tugma bilan orqaga qaytarish mumkin.
 */
export function ChangeHistoryCard({
  productId,
  changeLogs,
  draftTextPushedAt,
  onReverted,
}: {
  productId: number;
  changeLogs: ProductChangeLog[];
  /** Qoralama matni oxirgi marta Uzum'ga qachon yuborilgani (`edit-uzum`). */
  draftTextPushedAt: string | null;
  onReverted: () => void | Promise<void>;
}) {
  const [impacts, setImpacts] = React.useState<Record<number, ChangeImpact>>({});
  const [revertBusy, setRevertBusy] = React.useState<number | null>(null);
  const [note, setNote] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!changeLogs.length) return;
    let cancelled = false;
    fetchChangeImpact(productId)
      .then((rows) => {
        if (cancelled) return;
        const byLog: Record<number, ChangeImpact> = {};
        for (const r of rows) byLog[r.logId] = r;
        setImpacts(byLog);
      })
      .catch(() => {
        // Ta'sir statistikasi ixtiyoriy — bo'lmasa jadval baribir foydali.
      });
    return () => {
      cancelled = true;
    };
  }, [productId, changeLogs.length]);

  if (!changeLogs.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-4 w-4" /> O&apos;zgarishlar tarixi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Bu tovarda hali AI/Auto-Fix bilan qilingan o&apos;zgarish yo&apos;q.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" /> O&apos;zgarishlar tarixi
        </CardTitle>
        <CardDescription>
          Nom va tavsif qachon, nima uchun o&apos;zgargani — va yoqmasa orqaga
          qaytarish.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {note && (
          <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {note}
          </div>
        )}
        {changeLogs.map((log) => {
          const impact = impacts[log.id];
          const canRevert = REVERTABLE.has(log.fieldName) && log.changedBy !== "revert";
          // Uzum'dagi TIRIK kartochka matni oxirgi marta shu paytda
          // yangilangan (`edit-uzum`) — shundan KEYINGI yozuv hali
          // faqat qoralamada, tirik e'londa emas. Umuman yuborilmagan
          // bo'lsa (`draftTextPushedAt` yo'q) — barchasi kutilyapti.
          const isPending =
            REVERTABLE.has(log.fieldName) &&
            (!draftTextPushedAt || Date.parse(log.createdAt) > Date.parse(draftTextPushedAt));
          return (
            <div key={log.id} className="rounded-md border p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{FIELD_LABEL[log.fieldName] ?? log.fieldName}</Badge>
                  <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                  {log.changedBy && (
                    <Badge variant="secondary" className="text-[10px]">
                      {log.changedBy === "revert"
                        ? "qaytarildi"
                        : log.changedBy === "ai_auto_fix"
                          ? "AI Auto-Fix"
                          : log.changedBy}
                    </Badge>
                  )}
                  {isPending && (
                    <Badge
                      variant="outline"
                      className="border-amber-500/40 text-[10px] text-amber-600 dark:text-amber-400"
                    >
                      Joriy — Uzum&apos;ga hali yuborilmagan
                    </Badge>
                  )}
                </div>
                {canRevert && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revertBusy !== null}
                    onClick={async () => {
                      setRevertBusy(log.id);
                      setNote(null);
                      try {
                        await revertProductChange(productId, log.id);
                        setNote(
                          `"${FIELD_LABEL[log.fieldName] ?? log.fieldName}" oldingi holatiga qaytarildi. ` +
                            "Uzumdagi tirik kartochkaga ko'chirish uchun \"Tahrirlash\" → \"Uzumda yangilash\"ni ishlating.",
                        );
                        await onReverted();
                      } catch (e) {
                        setNote(e instanceof Error ? e.message : "Qaytarib bo'lmadi.");
                      } finally {
                        setRevertBusy(null);
                      }
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    {revertBusy === log.id ? "Qaytarilmoqda…" : "Qaytarish"}
                  </Button>
                )}
              </div>

              {log.reason && <div className="mt-1 text-xs text-muted-foreground">{log.reason}</div>}

              <div className="mt-2 grid gap-2 md:grid-cols-2">
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Oldin edi</div>
                  <div className="text-muted-foreground">{truncate(log.beforeValue)}</div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground">Bunga o&apos;zgardi</div>
                  <div>{truncate(log.afterValue)}</div>
                </div>
              </div>

              {impact && <ImpactRow impact={impact} />}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
