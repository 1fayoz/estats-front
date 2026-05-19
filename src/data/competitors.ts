import type { Competitor } from "@/types/domain";
import { rand, randInt } from "./seed";

const STORES = [
  { store: "TechZone Uz", niche: "Elektronika", topProduct: "iPhone 15 Pro 256GB" },
  { store: "ModaStyle", niche: "Ayollar kiyimi", topProduct: "Trikotaj ko'ylak Premium" },
  { store: "BeautyHub", niche: "Kosmetika", topProduct: "Niacinamide serum 10%" },
  { store: "HomeMax", niche: "Uy jihozlari", topProduct: "Multivarka Polaris 5L" },
  { store: "KidsPlanet", niche: "Bolalar tovarlari", topProduct: "Konstruktor 500 detal" },
  { store: "FitPro", niche: "Sport jihozlar", topProduct: "Yoga gilam Premium" },
  { store: "AutoTrend", niche: "Avto aksessuar", topProduct: "Video registrator 4K" },
  { store: "SmartLife", niche: "Smart uy", topProduct: "Robot changyutgich Pro" },
  { store: "EcoFood Uz", niche: "Oziq-ovqat", topProduct: "Organik mevali choy 250g" },
  { store: "BookWorld", niche: "Kitoblar", topProduct: "Biznes bestseller to'plam" },
];

export const COMPETITORS: Competitor[] = STORES.map((s, idx) => ({
  id: `comp-${idx + 1}`,
  store: s.store,
  logo: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(s.store)}`,
  rating: +rand(4.1, 4.95).toFixed(2),
  reviews: randInt(800, 32_000),
  productsCount: randInt(60, 1_400),
  revenue30d: randInt(280_000_000, 4_800_000_000),
  sales30d: randInt(1_400, 18_500),
  growthPercent: +rand(-12, 78).toFixed(1),
  averagePrice: randInt(180_000, 2_900_000),
  niche: s.niche,
  topProduct: s.topProduct,
}));
