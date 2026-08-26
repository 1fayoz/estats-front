"use client";

import { AlertTriangle, MessageSquare, Star, ThumbsUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SeoReviews } from "@/lib/types";

/**
 * Sharhlar xulosasi.
 *
 * Bu kartochkadagi yagona joy — matnni sotuvchi emas, xaridor yozgan.
 * Shuning uchun undagi so'zlar kalit so'z yadrosiga tushadi va
 * shikoyatlar tavsifda oldindan javob berilishi kerak bo'lgan
 * narsani ko'rsatadi.
 */
export function ReviewsBlock({ reviews }: { reviews: SeoReviews | null }) {
  if (!reviews || reviews.total === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 p-10 text-center">
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
          <p className="max-w-md text-sm text-muted-foreground">
            Bu tovarda hali sharh yo&apos;q. Birinchi sharhlar kelgach bu yerda
            xaridorlar nimani maqtagani va nimadan shikoyat qilgani ko&apos;rinadi —
            va o&apos;sha so&apos;zlar kalit so&apos;zlar yadrosiga qo&apos;shiladi.
          </p>
        </CardContent>
      </Card>
    );
  }

  const stars = ["5", "4", "3", "2", "1"];
  const maxCount = Math.max(1, ...Object.values(reviews.breakdown ?? {}));

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tabular-nums">
                  {reviews.rating != null ? reviews.rating.toFixed(1) : "—"}
                </span>
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xs text-muted-foreground">
                {`${formatNumber(reviews.total)} sharh`}
                {reviews.analysed > 0 && reviews.analysed < reviews.total && (
                  <span>{` · ${reviews.analysed} tasi o'qildi`}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="space-y-1 p-4">
            {stars.map((star) => {
              const count = reviews.breakdown?.[star] ?? 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 tabular-nums text-muted-foreground">{star}</span>
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        Number(star) >= 4 ? "bg-emerald-500" : "bg-amber-500",
                      )}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right tabular-nums text-muted-foreground">
                    {count || "—"}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {(reviews.loved.length > 0 || reviews.complaints.length > 0) && (
        <div className="grid gap-3 lg:grid-cols-2">
          {reviews.loved.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ThumbsUp className="h-4 w-4 text-emerald-600 dark:text-emerald-500" />
                  Nimani maqtaydi
                </CardTitle>
                <CardDescription>
                  Bu iboralar tavsifda bo&apos;lishi kerak — ular sotadi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {reviews.loved.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {reviews.complaints.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
                  Nimadan shikoyat qiladi
                </CardTitle>
                <CardDescription>
                  Tavsifda oldindan javob bersangiz — qaytarish kamayadi.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {reviews.complaints.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {reviews.words.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Xaridor ishlatgan so&apos;zlar</CardTitle>
            <CardDescription>
              Odam tovarni sizning nomingiz bilan emas, o&apos;z so&apos;zi bilan
              ataydi — va qidiruvga ham o&apos;shani yozadi. Bular yadroga qo&apos;shildi.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {reviews.words.map((word) => (
              <Badge key={word} variant="secondary">{word}</Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {reviews.advice.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Nima qilish kerak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {reviews.advice.map((line) => (
              <div key={line} className="flex items-start gap-2 text-sm">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-500" />
                <span className="text-muted-foreground">{line}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
