import { ArrowDown, ArrowUp, MinusCircle, Search } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { KEYWORDS } from "@/data/keywords";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const DIFFICULTY: Record<string, { label: string; variant: "success" | "warning" | "destructive" }> = {
  low: { label: "Oson", variant: "success" },
  medium: { label: "O'rtacha", variant: "warning" },
  high: { label: "Qiyin", variant: "destructive" },
};

export default function KeywordsPage() {
  const tracked = KEYWORDS.filter((k) => k.ourPosition !== null);
  const top10 = tracked.filter((k) => (k.ourPosition ?? 999) <= 10).length;
  const top3 = tracked.filter((k) => (k.ourPosition ?? 999) <= 3).length;
  const totalVolume = KEYWORDS.reduce((a, k) => a + k.searchVolume, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalit so'zlar va SEO"
        description="Qidiruv pozitsiyalari, raqobat darajasi va potensial bozor sig'imi."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Kuzatilayotgan" value={formatNumber(KEYWORDS.length)} hint="kalit so'z" />
        <StatCard label="Top 10 da" value={String(top10)} hint={`${tracked.length} dan`} tone="success" />
        <StatCard label="Top 3 da" value={String(top3)} hint="liderlik" tone="warning" />
        <StatCard
          label="Bozor sig'imi"
          value={formatNumber(totalVolume)}
          hint="oylik qidiruv"
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kalit so'zlar ro'yxati</CardTitle>
          <CardDescription>
            Sizning pozitsiyangiz, qidiruv hajmi va Top 10 daromadi
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Kalit so'z</th>
                  <th className="px-6 py-3 text-right font-medium">Hajm</th>
                  <th className="px-6 py-3 text-right font-medium">Bizning pozitsiya</th>
                  <th className="px-6 py-3 text-right font-medium">Raqobatchilar</th>
                  <th className="px-6 py-3 text-right font-medium">Top daromad</th>
                  <th className="px-6 py-3 font-medium">Trend</th>
                  <th className="px-6 py-3 font-medium">Qiyinlik</th>
                </tr>
              </thead>
              <tbody>
                {KEYWORDS.map((k) => {
                  const diff = DIFFICULTY[k.difficulty];
                  const positive = k.trendPercent >= 0;
                  const hasPos = k.ourPosition !== null;
                  const goodPos = hasPos && (k.ourPosition as number) <= 10;
                  return (
                    <tr
                      key={k.id}
                      className="border-b last:border-0 transition-colors hover:bg-accent/30"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Search className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="font-medium">{k.query}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {formatNumber(k.searchVolume)}
                      </td>
                      <td className="px-6 py-3 text-right">
                        {hasPos ? (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-md px-2 py-0.5 font-semibold tabular-nums",
                              goodPos
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            #{k.ourPosition}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <MinusCircle className="h-3 w-3" /> kuzatilmagan
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {formatNumber(k.competitors)}
                      </td>
                      <td className="px-6 py-3 text-right font-semibold tabular-nums">
                        {formatSumShort(k.topRevenue)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 text-xs font-semibold",
                            positive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          )}
                        >
                          {positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                          {Math.abs(k.trendPercent)}%
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant={diff.variant}>{diff.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone = "primary",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "info";
}) {
  const toneClass = {
    primary: "from-primary/15 text-primary",
    success: "from-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    warning: "from-amber-500/15 text-amber-600 dark:text-amber-400",
    info: "from-sky-500/15 text-sky-600 dark:text-sky-400",
  };
  return (
    <Card className={cn("bg-gradient-to-br to-card p-4", toneClass[tone])}>
      <div className="text-[10px] uppercase tracking-wider text-current/80">{label}</div>
      <div className="mt-1 text-2xl font-bold tabular-nums text-foreground">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </Card>
  );
}
