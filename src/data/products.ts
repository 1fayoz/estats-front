import type { DailyPoint, Product, CategoryCommissionKey } from "@/types/domain";
import { rand, randInt, pick } from "./seed";

interface ProductSeed {
  title: string;
  category: CategoryCommissionKey;
  categoryName: string;
  brand: string;
  basePrice: number;
  costRatio: number;
}

const SEEDS: ProductSeed[] = [
  { title: "Xiaomi Redmi Note 13 Pro 256GB", category: "electronics", categoryName: "Smartfonlar", brand: "Xiaomi", basePrice: 3_290_000, costRatio: 0.74 },
  { title: "Apple AirPods Pro 2-avlod", category: "electronics", categoryName: "Audio", brand: "Apple", basePrice: 2_890_000, costRatio: 0.78 },
  { title: "Samsung Galaxy A55 8/256GB", category: "electronics", categoryName: "Smartfonlar", brand: "Samsung", basePrice: 4_590_000, costRatio: 0.81 },
  { title: "Erkaklar uchun ko'ylak Slim Fit", category: "fashion", categoryName: "Erkaklar kiyimi", brand: "Zara", basePrice: 289_000, costRatio: 0.42 },
  { title: "Ayollar uchun ko'ylak Midi", category: "fashion", categoryName: "Ayollar kiyimi", brand: "H&M", basePrice: 459_000, costRatio: 0.38 },
  { title: "Nike Air Max 270 krossovka", category: "fashion", categoryName: "Sport poyabzal", brand: "Nike", basePrice: 1_290_000, costRatio: 0.55 },
  { title: "Mac mini M4 16/256GB", category: "electronics", categoryName: "Kompyuterlar", brand: "Apple", basePrice: 8_790_000, costRatio: 0.86 },
  { title: "Sezgi Lab vitamin C serum 30ml", category: "beauty", categoryName: "Yuz parvarishi", brand: "Sezgi", basePrice: 189_000, costRatio: 0.28 },
  { title: "L'Oreal Paris elvive shampun 400ml", category: "beauty", categoryName: "Soch parvarishi", brand: "L'Oreal", basePrice: 79_000, costRatio: 0.45 },
  { title: "Tefal teflon tovasi 28sm", category: "home", categoryName: "Oshxona", brand: "Tefal", basePrice: 489_000, costRatio: 0.5 },
  { title: "Philips dazmol Azur Steam", category: "home", categoryName: "Maishiy texnika", brand: "Philips", basePrice: 1_190_000, costRatio: 0.62 },
  { title: "Bolalar uchun konstruktor 250 detal", category: "kids", categoryName: "O'yinchoqlar", brand: "LEGO Friends", basePrice: 349_000, costRatio: 0.4 },
  { title: "Bolalar avtokreslosi 9-36 kg", category: "kids", categoryName: "Bolalar texnikasi", brand: "Maxi-Cosi", basePrice: 1_890_000, costRatio: 0.58 },
  { title: "Adidas sport sumkasi 50L", category: "sports", categoryName: "Sport jihozlar", brand: "Adidas", basePrice: 489_000, costRatio: 0.44 },
  { title: "Yoga gilam premium 6mm", category: "sports", categoryName: "Fitnes", brand: "Reebok", basePrice: 239_000, costRatio: 0.35 },
  { title: "Avto chexol 4 mavsumiy", category: "auto", categoryName: "Avto aksessuar", brand: "Drive", basePrice: 590_000, costRatio: 0.5 },
  { title: "Bosch akkumulyator 60Ah", category: "auto", categoryName: "Avto qismlar", brand: "Bosch", basePrice: 1_290_000, costRatio: 0.7 },
  { title: "Buyuk Britaniya choyi Earl Grey 250g", category: "food", categoryName: "Choy va kofe", brand: "Lipton", basePrice: 89_000, costRatio: 0.48 },
  { title: "Italyancha makaron De Cecco 500g", category: "food", categoryName: "Mahsulotlar", brand: "De Cecco", basePrice: 49_000, costRatio: 0.55 },
  { title: "JBL Flip 6 portativ kolonka", category: "electronics", categoryName: "Audio", brand: "JBL", basePrice: 1_590_000, costRatio: 0.72 },
  { title: "Logitech MX Master 3S sichqoncha", category: "electronics", categoryName: "Aksessuar", brand: "Logitech", basePrice: 1_390_000, costRatio: 0.7 },
  { title: "Dyson V12 Detect Slim changyutgich", category: "home", categoryName: "Maishiy texnika", brand: "Dyson", basePrice: 7_890_000, costRatio: 0.78 },
  { title: "Atomic Habits — kitob", category: "books", categoryName: "Biznes kitoblar", brand: "Asaxiy", basePrice: 109_000, costRatio: 0.4 },
  { title: "Smart soat Apple Watch SE 44mm", category: "electronics", categoryName: "Soatlar", brand: "Apple", basePrice: 3_290_000, costRatio: 0.79 },
];

const STATUSES: Product["status"][] = ["active", "active", "active", "low_stock", "out_of_stock", "paused"];
const TRENDS: Product["trend"][] = ["up", "up", "up", "down", "flat"];

function buildHistory(daily: number, growth: number): DailyPoint[] {
  const points: DailyPoint[] = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const noise = rand(0.7, 1.3);
    const trendFactor = 1 + ((30 - i) / 30) * (growth / 100);
    const sales = Math.max(0, Math.round(daily * noise * trendFactor));
    const visits = Math.round(sales / rand(0.04, 0.09));
    const conversion = visits > 0 ? +((sales / visits) * 100).toFixed(2) : 0;
    points.push({
      date: date.toISOString().slice(0, 10),
      sales,
      revenue: 0,
      visits,
      conversion,
    });
  }
  return points;
}

export const PRODUCTS: Product[] = SEEDS.map((seed, idx) => {
  const price = Math.round(seed.basePrice * rand(0.95, 1.08));
  const cost = Math.round(price * seed.costRatio * rand(0.95, 1.05));
  const stock = randInt(0, 250);
  const sold30d = randInt(40, 1800);
  const sold7d = Math.round(sold30d * rand(0.18, 0.32));
  const growthPercent = +rand(-15, 65).toFixed(1);
  const revenue30d = sold30d * price;
  const dailyAvg = sold30d / 30;
  const history = buildHistory(dailyAvg, growthPercent).map((p) => ({
    ...p,
    revenue: p.sales * price,
  }));
  const status: Product["status"] =
    stock === 0 ? "out_of_stock" : stock < 20 ? "low_stock" : pick(STATUSES);
  return {
    id: `p-${idx + 1}`,
    sku: `UZ-${(10000 + idx).toString()}`,
    title: seed.title,
    image: `https://picsum.photos/seed/uzum-${idx + 1}/400/400`,
    category: seed.category,
    categoryName: seed.categoryName,
    price,
    oldPrice: Math.random() > 0.4 ? Math.round(price * rand(1.05, 1.25)) : undefined,
    cost,
    stock,
    rating: +rand(3.6, 4.95).toFixed(2),
    reviews: randInt(8, 2400),
    sold30d,
    sold7d,
    revenue30d,
    growthPercent,
    conversionRate: +rand(2.1, 8.4).toFixed(2),
    searchPosition: randInt(1, 80),
    trend: growthPercent > 5 ? "up" : growthPercent < -3 ? "down" : pick(TRENDS),
    history,
    status,
    brand: seed.brand,
  };
});

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
