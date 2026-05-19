import { CATEGORIES } from "./categories";
import { SELLERS } from "./sellers";
import { PRODUCTS } from "./products";
import { rand, randInt } from "./seed";
import type { DailyPoint } from "@/types/domain";

export interface MarketKpi {
  revenue: number;
  revenueDelta: number;
  stores: number;
  storesDelta: number;
  activeStores: number;
  activeStoresPercent: number;
  cards: number;
  cardsDelta: number;
  activeCards: number;
  activeCardsPercent: number;
  skus: number;
  skusDelta: number;
  turnoverDays: number;
  turnoverDelta: number;
}

export function getMarketKpi(): MarketKpi {
  return {
    revenue: 287_200_000_000,
    revenueDelta: 14.0,
    stores: 15_600,
    storesDelta: 8.2,
    activeStores: Math.round(15_600 * 0.76),
    activeStoresPercent: 76,
    cards: 513_500,
    cardsDelta: 4.4,
    activeCards: Math.round(513_500 * 0.32),
    activeCardsPercent: 32,
    skus: 1_400_000,
    skusDelta: 5.8,
    turnoverDays: 57,
    turnoverDelta: -19.1,
  };
}

export interface TreemapNode {
  name: string;
  size: number;
  category?: string;
  fill?: string;
}

const TREEMAP_COLORS = [
  "oklch(0.72 0.16 280)",
  "oklch(0.72 0.16 230)",
  "oklch(0.72 0.16 190)",
  "oklch(0.72 0.16 150)",
  "oklch(0.75 0.16 75)",
  "oklch(0.72 0.18 30)",
  "oklch(0.72 0.18 340)",
  "oklch(0.7 0.16 110)",
];

const CATEGORY_TREE: { parent: string; children: { name: string; weight: number }[] }[] = [
  {
    parent: "Ayollar kiyimi",
    children: [
      { name: "Ust kiyim", weight: 18 },
      { name: "Sport kiyim", weight: 14 },
      { name: "Uy kiyimi", weight: 8 },
      { name: "Ichki kiyim", weight: 7 },
      { name: "Jemperlar", weight: 6 },
      { name: "Shimlar", weight: 5 },
      { name: "Futbolkalar", weight: 5 },
      { name: "Bluzkalar", weight: 4 },
      { name: "Ko'ylaklar", weight: 4 },
    ],
  },
  {
    parent: "Erkaklar kiyimi",
    children: [
      { name: "Ust kiyim", weight: 14 },
      { name: "Sport kiyim", weight: 10 },
      { name: "Jinslar", weight: 7 },
      { name: "Futbolkalar", weight: 6 },
      { name: "Shimlar", weight: 5 },
      { name: "Termobelye", weight: 4 },
      { name: "Maykalar", weight: 3 },
    ],
  },
  {
    parent: "Bolalar kiyimi",
    children: [
      { name: "Qiz bolalar", weight: 7 },
      { name: "O'g'il bolalar", weight: 6 },
      { name: "Chaqaloqlar", weight: 4 },
    ],
  },
];

export function getCategoryTreemap(): TreemapNode[] {
  const nodes: TreemapNode[] = [];
  CATEGORY_TREE.forEach((parent, pIdx) => {
    parent.children.forEach((child) => {
      nodes.push({
        name: child.name,
        size: child.weight * randInt(80_000_000, 220_000_000),
        category: parent.parent,
        fill: TREEMAP_COLORS[pIdx % TREEMAP_COLORS.length],
      });
    });
  });
  return nodes;
}

export interface AssortmentBubble {
  category: string;
  competitors: number;
  cards: number;
  revenue: number;
  color: string;
}

export function getAssortmentBubbles(): AssortmentBubble[] {
  const labels = ["Elektronika", "Maishiy texnika", "Uy", "Go'zallik", "Kiyim", "Aksessuar", "Bolalar", "Avto"];
  return labels.map((name, i) => ({
    category: name,
    competitors: randInt(800, 4_800),
    cards: randInt(8_000, 80_000),
    revenue: randInt(1_400_000_000, 32_000_000_000),
    color: TREEMAP_COLORS[i % TREEMAP_COLORS.length],
  }));
}

export interface DualPeriodPoint {
  date: string;
  current: number;
  previous: number;
}

export function getDualPeriodRevenue(): DualPeriodPoint[] {
  const result: DualPeriodPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const base = 8_000_000_000 + (30 - i) * 280_000_000;
    const current = Math.round(base * rand(0.85, 1.15));
    const previous = Math.round(base * rand(0.65, 1.05) * 0.82);
    result.push({
      date: date.toISOString().slice(0, 10),
      current,
      previous,
    });
  }
  return result;
}

export interface SalesStockPoint {
  date: string;
  sales: number;
  stock: number;
}

export function getSalesStockSeries(): SalesStockPoint[] {
  const result: SalesStockPoint[] = [];
  const today = new Date();
  let stock = 540;
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const sales = randInt(20, 95);
    stock = Math.max(0, stock - sales + (i % 5 === 0 ? 80 : 0));
    result.push({
      date: date.toISOString().slice(0, 10),
      sales,
      stock,
    });
  }
  return result;
}

export interface TopCategoryDonutItem {
  name: string;
  value: number;
  color: string;
}

export function getTopCategoriesDonut(): TopCategoryDonutItem[] {
  const data = [
    { name: "Elektronika", value: 29.8 },
    { name: "Maishiy texnika", value: 11.1 },
    { name: "Uy tovarlari", value: 10.2 },
    { name: "Go'zallik va parvarish", value: 8.2 },
    { name: "Kiyim-kechak", value: 5.7 },
    { name: "Aksessuarlar", value: 4.8 },
    { name: "Bolalar tovarlari", value: 4.5 },
    { name: "Avto tovarlar", value: 4.1 },
    { name: "Poyabzal", value: 3.8 },
    { name: "Qurilish", value: 3.2 },
    { name: "Sport", value: 2.8 },
    { name: "Salomatlik", value: 2.4 },
    { name: "Boshqalar", value: 9.4 },
  ];
  return data.map((d, i) => ({ ...d, color: TREEMAP_COLORS[i % TREEMAP_COLORS.length] }));
}

export interface Top100Store {
  rank: number;
  name: string;
  revenue: number;
  deltaPercent: number;
  marketShare: number;
}

export function getTop100Stores(): Top100Store[] {
  return [
    { rank: 1, name: "In Touch", revenue: 9_200_000_000, deltaPercent: 12.0, marketShare: 3.21 },
    { rank: 2, name: "Radius Mobile", revenue: 6_000_000_000, deltaPercent: 120.0, marketShare: 2.1 },
    { rank: 3, name: "PepsiCo", revenue: 5_000_000_000, deltaPercent: 608.9, marketShare: 1.74 },
    { rank: 4, name: "TCL Smart Online", revenue: 2_800_000_000, deltaPercent: 3.9, marketShare: 0.99 },
    { rank: 5, name: "Mobile Outlet", revenue: 2_500_000_000, deltaPercent: 403.2, marketShare: 0.88 },
    { rank: 6, name: "mzone", revenue: 2_500_000_000, deltaPercent: -17.4, marketShare: 0.87 },
    { rank: 7, name: "Artel Brand Shop", revenue: 1_700_000_000, deltaPercent: 45.9, marketShare: 0.61 },
    { rank: 8, name: "VOLTO UZBEKISTAN", revenue: 1_700_000_000, deltaPercent: 28.4, marketShare: 0.59 },
    { rank: 9, name: "Samsung Official", revenue: 1_600_000_000, deltaPercent: 8.2, marketShare: 0.56 },
    { rank: 10, name: "Apple Premium", revenue: 1_500_000_000, deltaPercent: -3.4, marketShare: 0.52 },
    { rank: 11, name: "Xiaomi Center", revenue: 1_420_000_000, deltaPercent: 64.2, marketShare: 0.5 },
    { rank: 12, name: "Asaxiy Books", revenue: 1_380_000_000, deltaPercent: 12.8, marketShare: 0.48 },
    { rank: 13, name: "BeautyHub", revenue: 1_240_000_000, deltaPercent: 32.1, marketShare: 0.43 },
    { rank: 14, name: "Optomus", revenue: 1_180_000_000, deltaPercent: -8.4, marketShare: 0.41 },
    { rank: 15, name: "TechZone Uz", revenue: 1_120_000_000, deltaPercent: 22.4, marketShare: 0.39 },
  ];
}

export type DailyPointForKpi = DailyPoint;

export function getKpiSparkline(seed: number): { v: number }[] {
  const r: { v: number }[] = [];
  let val = 50 + seed * 5;
  for (let i = 0; i < 30; i++) {
    val += randInt(-15, 18);
    r.push({ v: Math.max(0, val) });
  }
  return r;
}
