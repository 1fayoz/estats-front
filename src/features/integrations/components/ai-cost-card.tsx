"use client";

/*
 * «AI yordamchilar» tabi — kartochkalar bo'yicha AI sarfi.
 *
 * Sotuvchi talabi (2026-09-15): «qaysi card uchun qancha ketdi — jami shuncha,
 * shu AI'dan shuncha pul». Manba — `ai_usage` (har chaqiruv o'z narxi bilan),
 * backend `product_ai/ai_cost.py`. Tuzilishi yuqoridagi «AI yordamchilar»
 * kartasi bilan bir xil: sarlavha, `bg-muted/15` plitkalar, jadval.
 */

import * as React from "react";
import Link from "next/link";
import { Coins } from "lucide-react";

import { Pagination, useServerPage } from "@/components/ui/pagination";
import { ApiError, fetchAiCosts, mediaUrl } from "@/lib/api";
import { formatDate, formatNumber, formatUsd } from "@/lib/format";
import type { AiCostList } from "@/lib/types";

export function AiCostCard() {
  const { page, setPage, offset, limit } = useServerPage({ param: "costPage" });
  const [data, setData] = React.useState<AiCostList | null>(null);
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    let alive = true;
    fetchAiCosts(offset, limit)
      .then((next) => alive && setData(next))
      .catch((error) => {
        // Ruxsat yo'q (products_ai.view) yoki eski backend — karta jimgina yashiriladi.
        if (alive && error instanceof ApiError && [403, 404, 405].includes(error.status)) setHidden(true);
      });
    return () => {
      alive = false;
    };
  }, [offset, limit]);

  if (hidden) return null;
  const service = (key: string) => data?.services.find((s) => s.key === key)?.usd ?? 0;

  return (
    <article className="min-w-0 rounded-2xl border bg-card p-5 sm:p-6">
      <div className="flex min-w-0 items-center gap-3">
        <span className="rounded-xl bg-primary/10 p-3 text-primary"><Coins className="size-5" /></span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold">Kartochkalar bo‘yicha AI sarfi</h2>
          <p className="mt-1 text-sm text-muted-foreground">Har bir tovar kartochkasiga qaysi AI’dan qancha pul ketgani.</p>
        </div>
      </div>

      <dl className="mt-5 grid min-w-0 grid-cols-2 gap-3 md:grid-cols-4">
        {([
          ["Jami", data?.totalUsd ?? 0],
          ["Gemini", service("gemini")],
          ["OpenAI", service("openai")],
          ["Kartochkasiz", data?.unassignedUsd ?? 0],
        ] as const).map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-2xl border bg-muted/15 p-4">
            <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
            <dd className="mt-1 truncate text-xl font-semibold tabular-nums tracking-tight">{data ? formatUsd(value) : "…"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-muted-foreground">«Kartochkasiz» — kalit tekshiruvi, SEO auditi kabi tovarga bog‘lanmagan chaqiruvlar.</p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Kartochka</th>
              <th className="px-3 py-2 text-right font-medium">Gemini</th>
              <th className="px-3 py-2 text-right font-medium">OpenAI</th>
              <th className="px-3 py-2 text-right font-medium">Jami</th>
              <th className="px-3 py-2 text-right font-medium">Rasm</th>
              <th className="py-2 pl-3 text-right font-medium">Oxirgi</th>
            </tr>
          </thead>
          <tbody>
            {data?.drafts.map((row) => (
              <tr key={row.draftId} className="border-b last:border-0">
                <td className="py-2.5 pr-3">
                  <Link href={`/warehouse?draft=${row.draftId}`} className="flex min-w-0 items-center gap-3 hover:underline">
                    {row.cover ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(row.cover)} alt="" className="h-12 w-9 shrink-0 rounded-md border object-cover" />
                    ) : (
                      <span className="h-12 w-9 shrink-0 rounded-md border bg-muted" />
                    )}
                    <span className="min-w-0">
                      <span className="line-clamp-2 font-medium">{row.title}</span>
                      <span className="text-xs text-muted-foreground">#{row.draftId}{row.productId ? ` · Uzum ${row.productId}` : ""}</span>
                    </span>
                  </Link>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatUsd(row.geminiUsd)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatUsd(row.openaiUsd)}</td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{formatUsd(row.totalUsd)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{formatNumber(row.images)}</td>
                <td className="py-2.5 pl-3 text-right text-xs text-muted-foreground">{row.lastAt ? formatDate(new Date(row.lastAt)) : "—"}</td>
              </tr>
            ))}
            {data && data.drafts.length === 0 && (
              <tr><td colSpan={6} className="py-6 text-center text-sm text-muted-foreground">Hali kartochkalar uchun AI ishlatilmagan.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {data && <Pagination page={page} total={data.total} onPage={setPage} label="AI sarfi sahifalari" />}
    </article>
  );
}
