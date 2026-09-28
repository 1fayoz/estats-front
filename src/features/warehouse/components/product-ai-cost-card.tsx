"use client";

/*
 * Tovar sahifasi — shu tovarga (Uzum kartochkasiga) AI'ga ketgan pul.
 *
 * Sotuvchi talabi (2026-09-28): «Kartochkalar bo'yicha AI sarfi»
 * Integratsiyalardan olib tashlansin, har tovarning o'zida ko'rinsin.
 * Kartochkaning HAMMA qoralamasi (yaratish, keyingi tahrirlar, bo'lingan
 * qism) qo'shiladi — backend `ai_cost.card_cost`. Manba `ai_usage`: narx
 * chaqiruv paytidagi tarif bo'yicha yozilgan, qayta hisoblanmaydi.
 */

import * as React from "react";
import { Coins } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError, fetchProductAiCost } from "@/lib/api";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import type { CardAiCost } from "@/lib/types";

const SERVICE_TONE: Record<string, string> = {
  gemini: "bg-sky-500",
  openai: "bg-emerald-500",
};

export function ProductAiCostCard({ productId, onOpenDraft }: { productId: number; onOpenDraft?: (draftId: number) => void }) {
  const [cost, setCost] = React.useState<CardAiCost | null>(null);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetchProductAiCost(productId)
      .then((data) => alive && setCost(data))
      .catch((error) => {
        // Eski backend yoki ruxsat yo'q — karta jimgina yashiriladi.
        if (alive && error instanceof ApiError && [403, 404, 405].includes(error.status)) setHidden(true);
      });
    return () => {
      alive = false;
    };
  }, [productId]);

  if (hidden) return null;

  const max = Math.max(...(cost?.services.map((s) => s.usd) ?? [0]), 0.000001);
  const used = Boolean(cost && cost.calls > 0);

  return (
    <Card className="overflow-hidden rounded-2xl shadow-none">
      <CardHeader className="border-b">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="size-4 text-primary" /> AI sarfi
            </CardTitle>
            <CardDescription>Shu tovar kartochkasi uchun AI’ga ketgan pul — hamma qoralamalari bilan.</CardDescription>
          </div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{cost ? formatUsd(cost.totalUsd) : "…"}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-5">
        {!cost ? (
          <p className="text-sm text-muted-foreground">Yuklanmoqda…</p>
        ) : !used ? (
          <p className="text-sm text-muted-foreground">Bu tovar uchun hali AI ishlatilmagan.</p>
        ) : (
          <>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Xizmat bo‘yicha</p>
                {cost.services.map((service) => (
                  <div key={service.key} className="space-y-1">
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium">{service.label}</span>
                      <span className="tabular-nums">{formatUsd(service.usd)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full ${SERVICE_TONE[service.key] ?? "bg-primary"}`}
                        style={{ width: `${Math.max(3, (service.usd / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ish bo‘yicha</p>
                {cost.tasks.slice(0, 7).map((task) => (
                  <div key={task.key} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="min-w-0 truncate">
                      {task.label}
                      {task.images > 0 && (
                        <span className="text-muted-foreground">{` · ${formatNumber(task.images)} rasm`}</span>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums">{formatUsd(task.usd)}</span>
                  </div>
                ))}
              </div>
            </div>

            {cost.drafts.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-xs text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">AI kartochka</th>
                      <th className="px-3 py-2 text-right font-medium">Gemini</th>
                      <th className="px-3 py-2 text-right font-medium">OpenAI</th>
                      <th className="px-3 py-2 text-right font-medium">Jami</th>
                      <th className="py-2 pl-3 text-right font-medium">Oxirgi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cost.drafts.map((row) => (
                      <tr key={row.draftId} className="border-b last:border-0">
                        <td className="py-2.5 pr-3">
                          {onOpenDraft ? (
                            <button type="button" onClick={() => onOpenDraft(row.draftId)} className="text-left hover:underline">
                              <span className="line-clamp-1 font-medium">{row.title}</span>
                              <span className="text-xs text-muted-foreground">{`#${row.draftId} · ${formatNumber(row.calls)} chaqiruv`}</span>
                            </button>
                          ) : (
                            <span className="line-clamp-1 font-medium">{row.title}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{formatUsd(row.geminiUsd)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{formatUsd(row.openaiUsd)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatUsd(row.totalUsd)}</td>
                        <td className="py-2.5 pl-3 text-right text-xs text-muted-foreground">
                          {row.lastAt ? formatDate(new Date(row.lastAt)) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {`${formatNumber(cost.calls)} ta AI chaqiruvi · narx chaqiruv paytidagi tarif bo‘yicha`}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
