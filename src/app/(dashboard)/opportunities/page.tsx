"use client";

import * as React from "react";
import Image from "next/image";
import {
  AlertTriangle,
  ArrowUp,
  Check,
  ChevronRight,
  Filter,
  Heart,
  Lightbulb,
  Plus,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/dashboard/page-header";
import { ScoreGauge, ScoreBar } from "@/components/dashboard/score-gauge";
import { OPPORTUNITIES, type Opportunity } from "@/data/opportunities";
import { formatNumber, formatPercent, formatSum, formatSumShort } from "@/lib/format";
import { cn } from "@/lib/utils";

const DIFFICULTY = {
  easy: { label: "Oson", variant: "success" as const },
  medium: { label: "O'rtacha", variant: "warning" as const },
  hard: { label: "Qiyin", variant: "destructive" as const },
};

export default function OpportunitiesPage() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [difficulty, setDifficulty] = React.useState("all");
  const [budget, setBudget] = React.useState(50_000_000);
  const [minMargin, setMinMargin] = React.useState(15);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return OPPORTUNITIES.filter((o) => {
      if (q && !o.title.toLowerCase().includes(q) && !o.niche.toLowerCase().includes(q))
        return false;
      if (category !== "all" && o.category !== category) return false;
      if (difficulty !== "all" && o.difficulty !== difficulty) return false;
      if (o.startingInvestment > budget) return false;
      if (o.estimatedMargin < minMargin) return false;
      return true;
    });
  }, [query, category, difficulty, budget, minMargin]);

  const stats = React.useMemo(() => {
    const top = filtered.slice(0, 5);
    const avgScore = top.length > 0 ? Math.round(top.reduce((a, o) => a + o.totalScore, 0) / top.length) : 0;
    const totalRevenue = top.reduce((a, o) => a + o.estimatedMonthlyRevenue, 0);
    return { avgScore, totalRevenue };
  }, [filtered]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahsulot fursatlari"
        description="AI sizning byudjet va maqsadingizga mos mahsulotlarni topib, har birini 4 kriteriya bo'yicha baholaydi."
        badge={
          <Badge variant="default" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI
          </Badge>
        }
        actions={
          <Button variant="default" size="sm">
            <Wand2 className="h-4 w-4" /> AI tavsiyalari
          </Button>
        }
      />

      <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 via-card to-info/5">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Topildi
                </div>
                <div className="text-2xl font-bold tabular-nums">{filtered.length}</div>
                <div className="text-xs text-muted-foreground">
                  {OPPORTUNITIES.length} ta dan
                </div>
              </div>
            </div>
            <div className="hidden h-12 w-px self-center bg-border lg:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  TOP 5 o'rt. ball
                </div>
                <div className="text-2xl font-bold tabular-nums">{stats.avgScore}/100</div>
                <div className="text-xs text-muted-foreground">tavsiyalar sifati</div>
              </div>
            </div>
            <div className="hidden h-12 w-px self-center bg-border lg:block" />
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  TOP 5 daromad
                </div>
                <div className="text-2xl font-bold tabular-nums">
                  {formatSumShort(stats.totalRevenue)}
                </div>
                <div className="text-xs text-muted-foreground">oyiga taxminan</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-4 w-4" /> Mezonlaringizni kiriting
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            har bir o'zgarish — yangi natijalar
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Qidirish</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="nisha yoki mahsulot..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Kategoriya</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="electronics">Elektronika</SelectItem>
                  <SelectItem value="fashion">Kiyim</SelectItem>
                  <SelectItem value="beauty">Go'zallik</SelectItem>
                  <SelectItem value="home">Uy</SelectItem>
                  <SelectItem value="kids">Bolalar</SelectItem>
                  <SelectItem value="sports">Sport</SelectItem>
                  <SelectItem value="auto">Avto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Boshlash qiyinligi</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Hamma</SelectItem>
                  <SelectItem value="easy">Oson</SelectItem>
                  <SelectItem value="medium">O'rtacha</SelectItem>
                  <SelectItem value="hard">Qiyin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Boshlang'ich byudjet (so'm)</Label>
              <Input
                type="number"
                value={budget}
                step={1_000_000}
                onChange={(e) => setBudget(Number(e.target.value) || 0)}
                className="h-9 text-sm font-mono tabular-nums"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Min foyda marjasi (%)</Label>
              <Input
                type="number"
                value={minMargin}
                step={1}
                min={0}
                onChange={(e) => setMinMargin(Number(e.target.value) || 0)}
                className="h-9 text-sm font-mono tabular-nums"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filtered.map((o, idx) => (
          <OpportunityCard key={o.id} opportunity={o} rank={idx + 1} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <AlertTriangle className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="font-medium">Mezonlarga mos fursatlar topilmadi</div>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Byudjetni oshiring yoki min marja foizini pasaytiring.
          </p>
        </Card>
      )}
    </div>
  );
}

function OpportunityCard({ opportunity, rank }: { opportunity: Opportunity; rank: number }) {
  const diff = DIFFICULTY[opportunity.difficulty];
  const trendPositive = opportunity.trendPercent >= 0;

  return (
    <Card className="group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl">
      <div className="absolute right-4 top-4 z-10 flex h-7 w-7 items-center justify-center rounded-full border bg-card/80 text-xs font-bold tabular-nums backdrop-blur">
        #{rank}
      </div>

      <div className="flex">
        <div className="relative h-44 w-44 shrink-0 overflow-hidden bg-muted">
          <Image
            src={opportunity.image}
            alt={opportunity.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="176px"
            unoptimized
          />
          <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
            <Badge variant="secondary" className="backdrop-blur">
              {opportunity.categoryName}
            </Badge>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1 pr-8">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant={diff.variant}>{diff.label}</Badge>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{opportunity.niche}</span>
              </div>
              <h3 className="mt-1.5 line-clamp-2 text-sm font-bold leading-tight">
                {opportunity.title}
              </h3>
            </div>
            <ScoreGauge score={opportunity.totalScore} size={68} label="ball" />
          </div>

          <div className="mt-3 space-y-1.5">
            <ScoreBar label="Talab" value={opportunity.scoreDemand} />
            <ScoreBar label="Raqobat" value={opportunity.scoreCompetition} />
            <ScoreBar label="Marja" value={opportunity.scoreMargin} />
            <ScoreBar label="Trend" value={opportunity.scoreTrend} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border md:grid-cols-4">
        <Metric label="Tavsiya narx" value={formatSum(opportunity.suggestedPrice)} accent />
        <Metric
          label="Oylik daromad"
          value={formatSumShort(opportunity.estimatedMonthlyRevenue)}
          hint={`${formatNumber(opportunity.monthlyDemand)} talab`}
        />
        <Metric
          label="Foyda marjasi"
          value={`${opportunity.estimatedMargin}%`}
          hint={`ROI ${opportunity.estimatedRoi.toFixed(0)}%`}
        />
        <Metric
          label="Boshlang'ich"
          value={formatSumShort(opportunity.startingInvestment)}
          hint={`${opportunity.daysToFirstSale} kun ichida sotuv`}
        />
      </div>

      <CardContent className="space-y-3 border-t pt-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              Nima uchun yaxshi
            </div>
            <ul className="space-y-1">
              {opportunity.why.map((w) => (
                <li key={w} className="flex items-start gap-1.5 text-xs">
                  <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3" />
              Diqqat qiling
            </div>
            <ul className="space-y-1">
              {opportunity.warnings.map((w) => (
                <li key={w} className="flex items-start gap-1.5 text-xs">
                  <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-amber-500" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center gap-2 border-t pt-3">
          <Badge
            variant={trendPositive ? "success" : "destructive"}
            className="gap-1 font-semibold"
          >
            <ArrowUp className={cn("h-3 w-3", !trendPositive && "rotate-180")} />
            {Math.abs(opportunity.trendPercent)}% trend
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Target className="h-3 w-3" />
            {formatNumber(opportunity.competitorCount)} raqobatchi
          </Badge>
          <div className="ml-auto flex gap-1.5">
            <Button variant="outline" size="sm">
              <Heart className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm">
              <Plus className="h-3.5 w-3.5" />
              Ro'yxatga qo'shish
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-card p-3">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 text-sm font-bold tabular-nums", accent && "text-primary")}>
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
