import { rand, randInt, pick } from "./seed";
import type { CategoryCommissionKey } from "@/types/domain";

export interface Opportunity {
  id: string;
  title: string;
  image: string;
  category: CategoryCommissionKey;
  categoryName: string;
  niche: string;
  suggestedPrice: number;
  estimatedCost: number;
  monthlyDemand: number;
  competitorCount: number;
  topCompetitorRevenue: number;
  estimatedMonthlyRevenue: number;
  estimatedMargin: number;
  estimatedRoi: number;
  daysToFirstSale: number;
  startingInvestment: number;
  trendPercent: number;
  difficulty: "easy" | "medium" | "hard";
  scoreDemand: number;
  scoreCompetition: number;
  scoreMargin: number;
  scoreTrend: number;
  totalScore: number;
  why: string[];
  warnings: string[];
}

const SEEDS: { title: string; cat: CategoryCommissionKey; catName: string; niche: string; price: number; costRatio: number }[] = [
  { title: "Avtomat sovun dispenseri sensorli", cat: "home", catName: "Uy jihozlari", niche: "Smart hammom", price: 289_000, costRatio: 0.38 },
  { title: "Bolalar uchun LED kechki chiroq", cat: "kids", catName: "Bolalar uchun", niche: "Bolalar xonasi", price: 159_000, costRatio: 0.32 },
  { title: "Yoga gilam premium 6mm anti-slip", cat: "sports", catName: "Sport", niche: "Uy fitnesi", price: 249_000, costRatio: 0.34 },
  { title: "Akumulyatorli avto kompressor 12V", cat: "auto", catName: "Avto aksessuar", niche: "Avto vositalar", price: 489_000, costRatio: 0.42 },
  { title: "Yuz uchun jade roller + gua sha", cat: "beauty", catName: "Yuz parvarishi", niche: "Koreya kosmetik", price: 109_000, costRatio: 0.24 },
  { title: "Bluetooth audio kassa 5.3 mini", cat: "electronics", catName: "Audio", niche: "Wireless audio", price: 199_000, costRatio: 0.28 },
  { title: "Aqlli ko'p funksiyali tarozi (Bluetooth)", cat: "beauty", catName: "Salomatlik", niche: "Smart healthcare", price: 349_000, costRatio: 0.36 },
  { title: "Magnit avtomobil tutqichi telefon uchun", cat: "auto", catName: "Avto", niche: "Avto telefon", price: 79_000, costRatio: 0.22 },
  { title: "USB-C 100W tezkor zaryadlovchi blok", cat: "electronics", catName: "Aksessuar", niche: "Zaryad", price: 189_000, costRatio: 0.31 },
  { title: "Sport krossovka erkaklar uchun", cat: "fashion", catName: "Sport poyabzal", niche: "Erkaklar sport", price: 489_000, costRatio: 0.42 },
  { title: "Bolalar uchun motor mashina batareyali", cat: "kids", catName: "O'yinchoqlar", niche: "Bolalar texnika", price: 1_290_000, costRatio: 0.48 },
  { title: "Multifunksional yog' dispenseri 500ml", cat: "home", catName: "Oshxona", niche: "Oshxona", price: 89_000, costRatio: 0.28 },
];

const WHY_REASONS = [
  "Talab oxirgi 3 oyda 3× oshgan",
  "Yetakchi sotuvchilar bor-yo'g'i 8 ta",
  "Mavsumiy o'sish boshlangan",
  "Yuqori marja (40%+)",
  "Top 3 sotuvchi bir xil narxda",
  "Mahsulot sifati past raqobatchi sharhlari",
  "Aralash sotuvchilar — barkamol nisha",
  "Yetkazib berish katta muammo emas",
  "Aksiya/festival sezonida pik",
  "Tashqi havola va reklama sust",
];

const WARNINGS = [
  "1688 dan keltirish 3-4 hafta oladi",
  "Sertifikatlash zarur bo'lishi mumkin",
  "Top 3 ga chiqish uchun 2-3 oy kerak",
  "Reklama xarajati yuqori bo'lishi mumkin",
  "Qaytarish darajasi o'rta",
];

const DIFFICULTIES: Opportunity["difficulty"][] = ["easy", "medium", "hard"];

export const OPPORTUNITIES: Opportunity[] = SEEDS.map((s, idx) => {
  const monthlyDemand = randInt(800, 18_000);
  const competitorCount = randInt(4, 380);
  const cost = Math.round(s.price * s.costRatio);
  const topCompetitorRevenue = randInt(80_000_000, 1_400_000_000);
  const scoreDemand = randInt(45, 98);
  const scoreCompetition = randInt(35, 95);
  const scoreMargin = Math.round((1 - s.costRatio) * 100 - 18);
  const scoreTrend = randInt(40, 98);
  const totalScore = Math.round((scoreDemand + scoreCompetition + scoreMargin + scoreTrend) / 4);
  const estimatedMonthlyRevenue = Math.round(monthlyDemand * s.price * rand(0.05, 0.15));
  const margin = ((s.price - cost) / s.price) * 100 - 35;
  const roi = ((s.price - cost - s.price * 0.35) / cost) * 100;
  const trend = +rand(-12, 145).toFixed(1);
  const difficulty: Opportunity["difficulty"] =
    totalScore >= 80 ? "easy" : totalScore >= 60 ? "medium" : "hard";
  const why: string[] = [];
  for (let i = 0; i < 3; i++) why.push(WHY_REASONS[(idx + i) % WHY_REASONS.length]);
  const warnings: string[] = [];
  for (let i = 0; i < 2; i++) warnings.push(WARNINGS[(idx + i) % WARNINGS.length]);
  return {
    id: `opp-${idx + 1}`,
    title: s.title,
    image: `https://picsum.photos/seed/opp-${idx + 1}/400/400`,
    category: s.cat,
    categoryName: s.catName,
    niche: s.niche,
    suggestedPrice: s.price,
    estimatedCost: cost,
    monthlyDemand,
    competitorCount,
    topCompetitorRevenue,
    estimatedMonthlyRevenue,
    estimatedMargin: +margin.toFixed(1),
    estimatedRoi: +roi.toFixed(1),
    daysToFirstSale: randInt(1, 14),
    startingInvestment: cost * randInt(30, 100),
    trendPercent: trend,
    difficulty,
    scoreDemand,
    scoreCompetition,
    scoreMargin: Math.max(0, scoreMargin),
    scoreTrend,
    totalScore,
    why,
    warnings,
  };
}).sort((a, b) => b.totalScore - a.totalScore);
