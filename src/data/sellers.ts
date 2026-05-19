import type { Seller } from "@/types/domain";
import { rand, randInt, pick } from "./seed";

const STORES = [
  { store: "TechZone Uz", legal: "Texzon Trade MChJ", topCategory: "Elektronika", city: "Toshkent" },
  { store: "ModaStyle", legal: "Moda Style Group MChJ", topCategory: "Ayollar kiyimi", city: "Toshkent" },
  { store: "BeautyHub", legal: "Beauty Hub Uzbekistan MChJ", topCategory: "Kosmetika", city: "Samarqand" },
  { store: "HomeMax", legal: "Home Maximum MChJ", topCategory: "Uy jihozlari", city: "Toshkent" },
  { store: "KidsPlanet", legal: "Kids Planet MChJ", topCategory: "Bolalar tovarlari", city: "Andijon" },
  { store: "FitPro", legal: "Fitness Professional MChJ", topCategory: "Sport jihozlar", city: "Toshkent" },
  { store: "AutoTrend", legal: "Auto Trend Service MChJ", topCategory: "Avto aksessuar", city: "Farg'ona" },
  { store: "SmartLife", legal: "Smart Life MChJ", topCategory: "Smart uy", city: "Toshkent" },
  { store: "EcoFood Uz", legal: "Eco Food Distribution MChJ", topCategory: "Oziq-ovqat", city: "Buxoro" },
  { store: "BookWorld", legal: "Book World Publishing MChJ", topCategory: "Kitoblar", city: "Toshkent" },
  { store: "MegaMart", legal: "Mega Mart Trade MChJ", topCategory: "Aralash", city: "Toshkent" },
  { store: "Optomus", legal: "Optomus Wholesale MChJ", topCategory: "Maishiy", city: "Namangan" },
];

const STATUSES: Seller["paymentStatus"][] = ["verified", "verified", "verified", "premium", "pending"];

export const SELLERS: Seller[] = STORES.map((s, idx) => {
  const revenue30d = randInt(120_000_000, 5_400_000_000);
  return {
    id: `s-${idx + 1}`,
    store: s.store,
    logo: `https://api.dicebear.com/9.x/shapes/svg?seed=${encodeURIComponent(s.store)}`,
    legalEntity: s.legal,
    inn: String(randInt(200_000_000, 999_999_999)),
    city: s.city,
    joinedYear: randInt(2020, 2025),
    rating: +rand(4.1, 4.95).toFixed(2),
    reviews: randInt(800, 42_000),
    productsCount: randInt(80, 1_800),
    activeProducts: randInt(60, 1_500),
    revenue30d,
    revenue60d: Math.round(revenue30d * rand(1.6, 2.3)),
    sales30d: randInt(1_400, 22_500),
    growthPercent: +rand(-18, 92).toFixed(1),
    marketShare: +rand(0.4, 12.5).toFixed(2),
    topCategory: s.topCategory,
    paymentStatus: pick(STATUSES),
  };
});
