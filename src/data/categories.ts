import type { Category } from "@/types/domain";
import { rand, randInt } from "./seed";

const CATS: Pick<Category, "key" | "name">[] = [
  { key: "electronics", name: "Elektronika" },
  { key: "fashion", name: "Kiyim-kechak" },
  { key: "beauty", name: "Go'zallik va salomatlik" },
  { key: "home", name: "Uy va bog'" },
  { key: "kids", name: "Bolalar tovarlari" },
  { key: "sports", name: "Sport va dam olish" },
  { key: "auto", name: "Avto tovarlar" },
  { key: "food", name: "Oziq-ovqat" },
  { key: "books", name: "Kitoblar" },
];

const SEGMENTS = [
  { range: "0 — 100k", weight: 0.18 },
  { range: "100k — 500k", weight: 0.32 },
  { range: "500k — 1.5M", weight: 0.27 },
  { range: "1.5M — 5M", weight: 0.16 },
  { range: "5M+", weight: 0.07 },
];

export const CATEGORIES: Category[] = CATS.map((c, idx) => {
  const marketRevenue = randInt(800_000_000, 14_500_000_000);
  return {
    id: `c-${idx + 1}`,
    key: c.key,
    name: c.name,
    productsCount: randInt(2_400, 48_000),
    activeStores: randInt(180, 3_400),
    averagePrice: randInt(120_000, 2_400_000),
    marketRevenue,
    growthPercent: +rand(-8, 42).toFixed(1),
    turnoverDays: randInt(7, 45),
    topShare: +rand(18, 64).toFixed(1),
    priceSegments: SEGMENTS.map((s) => ({
      range: s.range,
      share: +(s.weight * 100 * rand(0.85, 1.15)).toFixed(1),
      revenue: Math.round(marketRevenue * s.weight * rand(0.85, 1.15)),
    })),
  };
});
