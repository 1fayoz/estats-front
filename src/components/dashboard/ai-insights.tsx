import { ArrowRight, Brain, Lightbulb, Sparkles, TrendingUp, AlertTriangle, Target } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const INSIGHTS = [
  {
    icon: TrendingUp,
    type: "Imkoniyat",
    title: "Yoga gilam — nishingizda 3× o'sish",
    desc:
      "Sport kategoriyasida 'yoga gilam' so'rovi 218% o'sgan. Sizning kategoriyaga mos mahsulot kiritsangiz, 30 kun ichida ~12M so'm daromad olishingiz mumkin.",
    cta: "Imkoniyatlarni ko'rish",
    href: "/opportunities",
    tone: "emerald",
  },
  {
    icon: AlertTriangle,
    type: "Diqqat",
    title: "3 ta SKU qoldiqsiz qolish arafasida",
    desc:
      "iPhone 11 Pro Max, AirPods Pro 2, va Apple Watch SE — qoldiq 5 kun ichida tugaydi. Buyurtma berish vaqti keldi.",
    cta: "Mahsulotlarga o'tish",
    href: "/products",
    tone: "amber",
  },
  {
    icon: Target,
    type: "SEO",
    title: "12 ta kalit so'z pozitsiyasi tushdi",
    desc:
      "'krossovka nike' va 'samsung a55' kalit so'zlarida raqobatchilar Boost TOP bilan oldinga o'tdi. Sizning kampaniyalarni yangilang.",
    cta: "Boost'ni yangilash",
    href: "/boost",
    tone: "sky",
  },
];

const TONE_BG = {
  emerald: "from-emerald-500/15 to-card border-emerald-500/30",
  amber: "from-amber-500/15 to-card border-amber-500/30",
  sky: "from-sky-500/15 to-card border-sky-500/30",
};

const TONE_ICON = {
  emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
};

export function AiInsights() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/[0.04] to-info/[0.04]">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-info text-white shadow-md">
              <Brain className="h-4 w-4" />
            </div>
            AI maslahatlari
          </CardTitle>
          <CardDescription>Sizning ma'lumotlaringizdan kelib chiqib 3 ta muhim tavsiya</CardDescription>
        </div>
        <Badge variant="default" className="gap-1">
          <Sparkles className="h-3 w-3" />
          AI
        </Badge>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {INSIGHTS.map((insight, idx) => (
          <Link
            key={idx}
            href={insight.href}
            className={cn(
              "group block rounded-xl border bg-gradient-to-br p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg",
              TONE_BG[insight.tone as keyof typeof TONE_BG]
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", TONE_ICON[insight.tone as keyof typeof TONE_ICON])}>
                <insight.icon className="h-4 w-4" />
              </div>
              <Badge variant="outline" className="text-[10px]">
                {insight.type}
              </Badge>
            </div>
            <h4 className="mt-3 text-sm font-bold leading-tight">{insight.title}</h4>
            <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
              {insight.desc}
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
              {insight.cta}
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
