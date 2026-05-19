import Image from "next/image";
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Flame,
  Rocket,
  Snowflake,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { RISING, FALLING, SEASONAL_CATEGORIES, EMERGING_NICHES } from "@/data/trends";
import { formatNumber, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const MONTHS_UZ = [
  "Yan", "Fev", "Mar", "Apr", "May", "Iyn",
  "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek",
];

const CURRENT_MONTH = new Date().getMonth() + 1;

const VELOCITY_BADGE = {
  explosive: { label: "Portlash", variant: "destructive" as const, icon: Flame },
  rising: { label: "Ko'tarilmoqda", variant: "success" as const, icon: TrendingUp },
  steady: { label: "Barqaror", variant: "secondary" as const, icon: ArrowUp },
  cooling: { label: "Pasaymoqda", variant: "warning" as const, icon: TrendingDown },
};

export default function TrendsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trendlar va mavsumlar"
        description="Bozorda nima qiziqarli — ko'tarilayotgan mahsulotlar, mavsumiy taqvim va yangi paydo bo'layotgan nishlar."
        badge={
          <Badge variant="warning" className="gap-1.5">
            <Flame className="h-3 w-3" />
            jonli ma'lumotlar
          </Badge>
        }
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Tez o'sayotgan
            </CardTitle>
            <CardDescription>Oxirgi 14 kunda eng katta o'sish</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {RISING.map((item, idx) => {
              const velocity = VELOCITY_BADGE[item.velocity];
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-emerald-500/40"
                >
                  <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-muted-foreground">
                    {idx + 1}
                  </span>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-lg border object-cover"
                    unoptimized
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{item.title}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                      <span>{item.category}</span>
                      <span className="flex items-center gap-0.5">
                        <ArrowUp className="h-2.5 w-2.5 text-emerald-500" />
                        pozitsiya +{item.positionChange}
                      </span>
                      <span>qidiruv +{item.searchVolumeChange}%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={velocity.variant} className="gap-0.5 text-[10px]">
                      <velocity.icon className="h-2.5 w-2.5" />
                      {velocity.label}
                    </Badge>
                    <span className="text-xs font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                      +{item.revenueChange}%
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Snowflake className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              Sovuyayotgan nishlar
            </CardTitle>
            <CardDescription>Bu nishlardan ehtiyot bo'ling — talab pasaymoqda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {FALLING.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3 opacity-90 transition-opacity hover:opacity-100"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={44}
                  height={44}
                  className="h-11 w-11 rounded-lg border object-cover"
                  unoptimized
                />
                <div className="min-w-0 flex-1">
                  <span className="truncate text-sm font-medium">{item.title}</span>
                  <div className="flex items-center gap-x-3 text-[10px] text-muted-foreground">
                    <span>{item.category}</span>
                    <span className="flex items-center gap-0.5">
                      <ArrowDown className="h-2.5 w-2.5 text-rose-500" />
                      {item.positionChange} pozitsiya
                    </span>
                  </div>
                </div>
                <span className="text-xs font-bold tabular-nums text-rose-600 dark:text-rose-400">
                  {item.revenueChange}%
                </span>
              </div>
            ))}

            <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
                <Sparkles className="h-3.5 w-3.5" />
                Maslahat
              </div>
              <p className="mt-1 text-muted-foreground">
                Bu nishlardagi mahsulotlaringizni chegirma bilan tezroq tugatib, yangi
                ko'tarilayotgan nishlarga o'tishni rejalashtiring.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Mavsumiy taqvim
          </CardTitle>
          <CardDescription>
            Yil davomida har bir nisha qachon pik darajada bo'lishini ko'ring
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-y bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th className="w-[200px] px-4 py-2 text-left font-medium">Nisha</th>
                  {MONTHS_UZ.map((m, i) => (
                    <th
                      key={m}
                      className={cn(
                        "px-1.5 py-2 text-center font-medium",
                        i + 1 === CURRENT_MONTH && "bg-primary/10 text-primary"
                      )}
                    >
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SEASONAL_CATEGORIES.map((cat) => (
                  <tr key={cat.name} className="border-b last:border-0">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{cat.emoji}</span>
                        <div>
                          <div className="text-sm font-medium">{cat.name}</div>
                          <div className="text-[10px] text-muted-foreground">{cat.category}</div>
                        </div>
                      </div>
                    </td>
                    {MONTHS_UZ.map((_, i) => {
                      const isPeak = cat.peaks.includes(i + 1);
                      const isCurrent = i + 1 === CURRENT_MONTH;
                      return (
                        <td key={i} className={cn("p-1.5 text-center", isCurrent && "bg-primary/5")}>
                          {isPeak ? (
                            <div
                              className={cn(
                                "mx-auto flex h-7 w-7 items-center justify-center rounded-md font-bold",
                                "bg-gradient-to-br from-orange-500/40 to-rose-500/40 text-orange-700 dark:text-orange-300"
                              )}
                              title="Pik mavsumi"
                            >
                              <Flame className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="mx-auto h-1 w-6 rounded-full bg-muted" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 pt-3 text-xs text-muted-foreground">
              🔥 — pik mavsum · joriy oy <span className="font-semibold text-primary">{MONTHS_UZ[CURRENT_MONTH - 1]}</span> ajratilgan
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            Yangi paydo bo'layotgan nishlar
          </CardTitle>
          <CardDescription>
            Bozorga endi kirib kelayotgan, kam raqobatli, yuqori o'sishli nishlar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {EMERGING_NICHES.map((n, i) => (
              <div
                key={n.niche}
                className={cn(
                  "group relative overflow-hidden rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
                  i === 0 && "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-card"
                )}
              >
                {i === 0 && (
                  <div className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md">
                    <Flame className="h-4 w-4" />
                  </div>
                )}
                <Badge variant="success" className="font-bold">
                  +{n.growth}%
                </Badge>
                <h3 className="mt-2 text-sm font-bold">{n.niche}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{n.description}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-[10px] text-muted-foreground">Mahsulot</div>
                    <div className="font-semibold tabular-nums">{formatNumber(n.productsCount)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Top narx</div>
                    <div className="font-semibold tabular-nums">{formatSumShort(n.topPrice)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground">Raqobat</div>
                    <div className="font-semibold tabular-nums">{n.competitorsCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
