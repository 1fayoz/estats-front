import type { Keyword } from "@/types/domain";
import { rand, randInt, pick } from "./seed";

const QUERIES = [
  "iphone 15 pro", "airpods pro", "samsung a55", "xiaomi redmi note 13",
  "ayollar koylagi", "erkaklar krossovkasi", "nike air max", "adidas",
  "vitamin c serum", "shampun loreal", "tovasi tefal", "lego konstruktor",
  "bolalar avtokreslosi", "yoga gilam", "akkumulyator bosch", "dyson v12",
  "smart soat", "jbl flip 6", "logitech sichqoncha", "kitob atomic habits",
  "premium telefon", "smart tv 55", "robot changyutgich", "naushnik bluetooth",
  "qishki kurtka", "qish poyabzali",
];

const DIFFICULTY = ["low", "medium", "high"] as const;

export const KEYWORDS: Keyword[] = QUERIES.map((q, idx) => {
  const ourPosition = Math.random() > 0.25 ? randInt(1, 90) : null;
  return {
    id: `k-${idx + 1}`,
    query: q,
    searchVolume: randInt(1_800, 124_000),
    ourPosition,
    competitors: randInt(48, 1_200),
    topRevenue: randInt(40_000_000, 1_400_000_000),
    difficulty: pick(DIFFICULTY),
    trendPercent: +rand(-22, 88).toFixed(1),
    cpc: randInt(800, 14_500),
  };
});
