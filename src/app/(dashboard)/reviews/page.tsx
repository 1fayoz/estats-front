import { MessageCircle, Star, ThumbsDown, ThumbsUp, Smile } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { REVIEWS } from "@/data/reviews";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

const SENTIMENT_VARIANT: Record<string, "success" | "secondary" | "destructive"> = {
  positive: "success",
  neutral: "secondary",
  negative: "destructive",
};
const SENTIMENT_LABEL: Record<string, string> = {
  positive: "Ijobiy",
  neutral: "Neytral",
  negative: "Salbiy",
};

export default function ReviewsPage() {
  const total = REVIEWS.length;
  const avg = REVIEWS.reduce((acc, r) => acc + r.rating, 0) / total;
  const positive = REVIEWS.filter((r) => r.sentiment === "positive").length;
  const negative = REVIEWS.filter((r) => r.sentiment === "negative").length;
  const distribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: REVIEWS.filter((r) => r.rating === stars).length,
  }));
  const unanswered = REVIEWS.filter((r) => !r.reply).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sharhlar"
        description="Mijozlar fikr-mulohazalari, reyting taqsimoti va sentiment tahlili."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Umumiy reyting
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-bold tabular-nums">{avg.toFixed(2)}</span>
            <span className="text-sm text-muted-foreground">/ 5.0</span>
          </div>
          <div className="mt-2 flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < Math.round(avg)
                    ? "fill-amber-400 text-amber-400"
                    : "text-muted-foreground/30"
                )}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">
              {formatNumber(total)} sharh asosida
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Sentiment tahlili
          </div>
          <div className="mt-3 space-y-2">
            <SentRow icon={ThumbsUp} label="Ijobiy" count={positive} total={total} tone="success" />
            <SentRow
              icon={Smile}
              label="Neytral"
              count={total - positive - negative}
              total={total}
              tone="info"
            />
            <SentRow icon={ThumbsDown} label="Salbiy" count={negative} total={total} tone="destructive" />
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Reyting taqsimoti
          </div>
          <div className="mt-3 space-y-2">
            {distribution.map((d) => (
              <div key={d.stars} className="flex items-center gap-3 text-xs">
                <span className="flex w-8 items-center gap-0.5">
                  {d.stars}
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                </span>
                <Progress
                  value={(d.count / total) * 100}
                  className="flex-1"
                  indicatorClassName="bg-amber-400"
                />
                <span className="w-8 text-right font-medium tabular-nums">{d.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Oxirgi sharhlar
            </CardTitle>
            <CardDescription>{unanswered} ta sharh javobsiz qoldi</CardDescription>
          </div>
          <Button size="sm" variant="outline">
            Hammasiga javob berish
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {REVIEWS.slice(0, 12).map((r) => (
            <div
              key={r.id}
              className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/30"
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarFallback>
                    {r.author
                      .split(" ")
                      .map((p) => p[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{r.author}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "h-3 w-3",
                            i < r.rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                    </div>
                    <Badge variant={SENTIMENT_VARIANT[r.sentiment]}>
                      {SENTIMENT_LABEL[r.sentiment]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.date).toLocaleDateString("uz-UZ")}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{r.productTitle}</div>
                  <p className="mt-2 text-sm">{r.text}</p>
                  {r.reply && (
                    <div className="mt-3 rounded-lg border-l-2 border-primary bg-primary/5 p-2.5 text-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        sotuvchi javobi
                      </div>
                      <div className="mt-0.5 text-muted-foreground">{r.reply}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SentRow({
  icon: Icon,
  label,
  count,
  total,
  tone,
}: {
  icon: typeof Star;
  label: string;
  count: number;
  total: number;
  tone: "success" | "info" | "destructive";
}) {
  const pct = (count / total) * 100;
  const colorClass = {
    success: "text-emerald-600 dark:text-emerald-400",
    info: "text-sky-600 dark:text-sky-400",
    destructive: "text-rose-600 dark:text-rose-400",
  }[tone];
  const barClass = {
    success: "bg-emerald-500",
    info: "bg-sky-500",
    destructive: "bg-rose-500",
  }[tone];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className={cn("flex items-center gap-1.5 font-medium", colorClass)}>
          <Icon className="h-3.5 w-3.5" />
          {label}
        </span>
        <span className="tabular-nums">
          {count} · {pct.toFixed(0)}%
        </span>
      </div>
      <Progress value={pct} className="h-1.5" indicatorClassName={barClass} />
    </div>
  );
}
