import type { Brand } from "@/types/domain";
import { rand, randInt } from "./seed";

const BRANDS = [
  { name: "Apple", country: "🇺🇸 AQSh", category: "Elektronika", topProduct: "iPhone 15 Pro Max" },
  { name: "Samsung", country: "🇰🇷 Janubiy Koreya", category: "Elektronika", topProduct: "Galaxy S24 Ultra" },
  { name: "Xiaomi", country: "🇨🇳 Xitoy", category: "Elektronika", topProduct: "Redmi Note 13 Pro" },
  { name: "Nike", country: "🇺🇸 AQSh", category: "Sport poyabzal", topProduct: "Air Max 270" },
  { name: "Adidas", country: "🇩🇪 Germaniya", category: "Sport kiyim", topProduct: "Sport sumka 50L" },
  { name: "Zara", country: "🇪🇸 Ispaniya", category: "Kiyim-kechak", topProduct: "Slim Fit ko'ylak" },
  { name: "H&M", country: "🇸🇪 Shvetsiya", category: "Kiyim-kechak", topProduct: "Midi ko'ylak" },
  { name: "L'Oreal", country: "🇫🇷 Fransiya", category: "Kosmetika", topProduct: "Elvive shampun" },
  { name: "Philips", country: "🇳🇱 Niderlandiya", category: "Maishiy texnika", topProduct: "Azur Steam dazmol" },
  { name: "Tefal", country: "🇫🇷 Fransiya", category: "Oshxona", topProduct: "Teflon tovasi 28sm" },
  { name: "LEGO", country: "🇩🇰 Daniya", category: "O'yinchoqlar", topProduct: "Friends konstruktor" },
  { name: "Dyson", country: "🇬🇧 Buyuk Britaniya", category: "Maishiy texnika", topProduct: "V12 Detect Slim" },
  { name: "JBL", country: "🇺🇸 AQSh", category: "Audio", topProduct: "Flip 6 kolonka" },
  { name: "Bosch", country: "🇩🇪 Germaniya", category: "Avto", topProduct: "Akkumulyator 60Ah" },
  { name: "Logitech", country: "🇨🇭 Shveytsariya", category: "Aksessuar", topProduct: "MX Master 3S" },
];

export const BRANDS_DATA: Brand[] = BRANDS.map((b, idx) => ({
  id: `b-${idx + 1}`,
  name: b.name,
  logo: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(b.name)}&backgroundType=gradientLinear`,
  country: b.country,
  productsCount: randInt(40, 1_200),
  sellersCount: randInt(8, 380),
  averagePrice: randInt(180_000, 3_800_000),
  revenue30d: randInt(180_000_000, 6_400_000_000),
  sales30d: randInt(1_200, 24_000),
  growthPercent: +rand(-12, 88).toFixed(1),
  marketShare: +rand(0.4, 8.5).toFixed(2),
  rating: +rand(4.2, 4.95).toFixed(2),
  topProduct: b.topProduct,
  category: b.category,
}));
