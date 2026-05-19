import { rand, randInt } from "./seed";

export interface TrendingItem {
  id: string;
  title: string;
  image: string;
  category: string;
  position: number;
  positionChange: number;
  searchVolume: number;
  searchVolumeChange: number;
  revenue: number;
  revenueChange: number;
  velocity: "explosive" | "rising" | "steady" | "cooling";
}

const RISING_TITLES = [
  { t: "Aqlli kechki chiroq sensorli", c: "Smart uy" },
  { t: "Yoga gilam premium 6mm", c: "Sport" },
  { t: "Bolalar uchun konstruktor 500+", c: "O'yinchoq" },
  { t: "Bluetooth quloqchin sport uchun", c: "Audio" },
  { t: "Avto sumkasi 4 mavsumiy", c: "Avto" },
  { t: "Mini portativ proyektor 4K", c: "Elektronika" },
  { t: "Hammom uchun anti-slip kovrik", c: "Uy" },
  { t: "Yuz uchun LED maska RGB", c: "Kosmetik" },
];

const FALLING_TITLES = [
  { t: "Eski model smartfon", c: "Elektronika" },
  { t: "Past sifatli airpod replica", c: "Audio" },
  { t: "Klassik shapka 2022", c: "Kiyim" },
];

function buildTrending(
  list: { t: string; c: string }[],
  direction: "up" | "down",
  prefix: string
): TrendingItem[] {
  return list.map((s, idx) => {
    const positionChange = direction === "up" ? randInt(5, 80) : -randInt(5, 50);
    const velocity: TrendingItem["velocity"] =
      direction === "up" && positionChange > 50
        ? "explosive"
        : direction === "up"
        ? "rising"
        : direction === "down"
        ? "cooling"
        : "steady";
    return {
      id: `${prefix}-${idx + 1}`,
      title: s.t,
      image: `https://picsum.photos/seed/${prefix}-${idx + 1}/200/200`,
      category: s.c,
      position: randInt(1, 80),
      positionChange,
      searchVolume: randInt(2_800, 84_000),
      searchVolumeChange: direction === "up" ? +rand(15, 180).toFixed(1) : -rand(8, 60),
      revenue: randInt(40_000_000, 1_400_000_000),
      revenueChange: direction === "up" ? +rand(20, 220).toFixed(1) : -rand(10, 65),
      velocity,
    };
  });
}

export const RISING = buildTrending(RISING_TITLES, "up", "rise");
export const FALLING = buildTrending(FALLING_TITLES, "down", "fall");

export interface SeasonalCategory {
  name: string;
  emoji: string;
  peaks: number[];
  category: string;
}

export const SEASONAL_CATEGORIES: SeasonalCategory[] = [
  { name: "Maktab tovarlari", emoji: "🎒", peaks: [7, 8], category: "Bolalar" },
  { name: "Yangi yil sovg'alari", emoji: "🎁", peaks: [11, 12], category: "Aralash" },
  { name: "Qishki kiyim", emoji: "🧥", peaks: [10, 11, 12, 1], category: "Kiyim" },
  { name: "Yozgi krossovkalar", emoji: "👟", peaks: [4, 5, 6, 7], category: "Sport" },
  { name: "Ramazon mahsulotlari", emoji: "🌙", peaks: [3, 4], category: "Oziq-ovqat" },
  { name: "Yozgi salqinlatgich", emoji: "❄️", peaks: [5, 6, 7, 8], category: "Maishiy" },
  { name: "Sport jihozlar", emoji: "⚽", peaks: [1, 2, 9], category: "Sport" },
  { name: "Plyaj tovarlari", emoji: "🏖️", peaks: [5, 6, 7], category: "Aralash" },
  { name: "Avto qishki vositalar", emoji: "🚗", peaks: [10, 11], category: "Avto" },
  { name: "Bayram dasturxon", emoji: "🍽️", peaks: [3, 9, 12], category: "Uy" },
];

export interface EmergingNiche {
  niche: string;
  description: string;
  growth: number;
  productsCount: number;
  topPrice: number;
  competitorsCount: number;
}

export const EMERGING_NICHES: EmergingNiche[] = [
  {
    niche: "Smart bolalar xonasi",
    description: "Sensorli chiroqlar, LED projektorlar, magnit o'yinchoqlar",
    growth: 218,
    productsCount: 420,
    topPrice: 489_000,
    competitorsCount: 38,
  },
  {
    niche: "Koreya kosmetikasi 2.0",
    description: "Niacinamide, jade roller, hydrating mask",
    growth: 145,
    productsCount: 890,
    topPrice: 289_000,
    competitorsCount: 124,
  },
  {
    niche: "Avto akumulyator vositalar",
    description: "Jump starter, kompressor, vakuum chistgich",
    growth: 132,
    productsCount: 280,
    topPrice: 890_000,
    competitorsCount: 42,
  },
  {
    niche: "Uy fitness mini",
    description: "Tabata bench, resistance bands, foam roller",
    growth: 98,
    productsCount: 340,
    topPrice: 690_000,
    competitorsCount: 67,
  },
  {
    niche: "Ofis ergonomikasi",
    description: "Standing desk, monitor stand, footrest",
    growth: 84,
    productsCount: 195,
    topPrice: 1_290_000,
    competitorsCount: 28,
  },
];
