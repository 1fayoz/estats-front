"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { Pagination, usePagination } from "@/components/ui/pagination";
import { NoData, Pending } from "@/features/market/shared";
import { formatDate, formatNumber } from "@/lib/format";
import { MARKET_BASE } from "@/lib/market";
import { cn } from "@/lib/utils";

type Review = {
  id: number;
  rating: number | null;
  content: string | null;
  pros: string | null;
  cons: string | null;
  created_at: string | null;
  created_on: string | null;
};

type Summary = {
  total: number;
  avg_rating: number | null;
  histogram: Record<string, number>;
  last30: number;
  last_review_on: string | null;
  fetched_on: string | null;
};

const STARS = ["5", "4", "3", "2", "1"] as const;

/**
 * Xaridor sharhlari — matni bilan.
 *
 * Nega son yetarli emas: "sharh 320 ta" degan raqam tovar yaxshi
 * yoki yomonligini aytmaydi. Past baholi sharhlar esa tayyor
 * talablar ro'yxati — raqobatchining nimasi ishlamayotgani.
 *
 * Baholar TAQSIMOTI o'rtachadan muhimroq: o'rtacha 4.2 hammasi
 * to'rt yulduz bo'lganda ham, yarmi besh va yarmi uch bo'lganda
 * ham chiqadi — ikkinchisida tovarda aniq nuqson bor.
 *
 * Bo'sh ro'yxat «sharh yo'q» degani EMAS: sharhlar butun katalog
 * uchun yig'ilmaydi (har kartochka — alohida so'rov), shuning
 * uchun hali yig'ilmagani ochiq yoziladi.
 */
export function ReviewsCard({
  productId,
  reloadKey = 0,
}: {
  productId: number | string;
  reloadKey?: number;
}) {
  const [summary, setSummary] = React.useState<Summary | null>(null);
  const [items, setItems] = React.useState<Review[]>([]);
  const [rating, setRating] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { page, setPage, pageItems } = usePagination(items, {
    param: "reviews_page",
    resetKey: rating,
  });

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    const query = new URLSearchParams({ limit: "100" });
    if (rating) query.set("rating", String(rating));
    fetch(`${MARKET_BASE}/products/${productId}/reviews?${query}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        if (!alive) return;
        setSummary(body.summary ?? null);
        setItems(body.items ?? []);
      })
      .catch(() => alive && setItems([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [productId, rating, reloadKey]);

  const total = summary?.total ?? 0;
  const top = Math.max(1, ...STARS.map((s) => summary?.histogram?.[s] ?? 0));

  return (
    <section className="space-y-2.5">
      <div className="font-semibold">Xaridor sharhlari</div>

      {total > 0 && summary && (
        <div className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-[minmax(0,220px)_1fr]">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="air-num text-3xl font-semibold">
                {summary.avg_rating != null ? summary.avg_rating.toFixed(1) : "—"}
              </span>
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatNumber(total)} ta sharh yig&apos;ilgan
              {summary.last30 > 0 && ` · oxirgi 30 kunda ${formatNumber(summary.last30)} ta`}
            </p>
            {summary.fetched_on && (
              <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                Oxirgi yig&apos;ish: {formatDate(summary.fetched_on)}
              </p>
            )}
          </div>

          <div className="space-y-1">
            {STARS.map((star) => {
              const count = summary.histogram?.[star] ?? 0;
              const active = rating === Number(star);
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(active ? null : Number(star))}
                  aria-pressed={active}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-1.5 py-0.5 text-left transition-colors hover:bg-muted",
                    active && "bg-muted",
                  )}
                >
                  <span className="air-num w-3 text-xs text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-amber-400"
                      style={{ width: `${Math.round((count / top) * 100)}%` }}
                    />
                  </span>
                  <span className="air-num w-10 text-right text-xs tabular-nums text-muted-foreground">
                    {formatNumber(count)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loading ? (
        <Pending label="Sharhlar yuklanmoqda…" />
      ) : items.length === 0 ? (
        <NoData>
          {rating
            ? `${rating} yulduzli sharh topilmadi.`
            : "Sharhlar hali yig'ilmagan — «Hozir yangilash» ularni Uzum'dan olib keladi."}
        </NoData>
      ) : (
        <>
          <ul className="space-y-2">
            {pageItems.map((review) => (
              <li key={review.id} className="rounded-xl border bg-card p-3.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={cn(
                          "h-3.5 w-3.5",
                          (review.rating ?? 0) >= n
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {review.created_on ? formatDate(review.created_on) : ""}
                  </span>
                </div>
                {review.content && <p className="mt-2 text-sm">{review.content}</p>}
                {review.pros && (
                  <p className="mt-1.5 text-sm">
                    <span className="text-[color:var(--ok)]">+ </span>
                    {review.pros}
                  </p>
                )}
                {review.cons && (
                  <p className="mt-1.5 text-sm">
                    <span className="text-[color:var(--bad)]">− </span>
                    {review.cons}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <Pagination page={page} total={items.length} onPage={setPage} label="Sharhlar sahifalari" />
        </>
      )}
    </section>
  );
}
