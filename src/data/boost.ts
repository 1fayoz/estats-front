import type { BoostCampaign, NegativeKeyword } from "@/types/domain";
import { PRODUCTS } from "./products";
import { rand, randInt, pick } from "./seed";

const KEYWORDS_POOL = [
  "iphone 15 pro", "airpods pro", "samsung a55", "xiaomi redmi", "ayollar koylagi",
  "krossovka nike", "smart soat", "jbl kolonka", "lego konstruktor", "yoga gilam",
  "vitamin c serum", "dyson changyutgich", "logitech mouse", "akkumulyator", "premium telefon",
];

const STATUSES: BoostCampaign["status"][] = ["active", "active", "active", "paused", "ended"];

export const BOOST_CAMPAIGNS: BoostCampaign[] = Array.from({ length: 14 }, (_, idx) => {
  const product = PRODUCTS[idx % PRODUCTS.length];
  const impressions = randInt(2_800, 84_000);
  const ctr = +rand(2.4, 9.8).toFixed(2);
  const clicks = Math.round((impressions * ctr) / 100);
  const conversions = Math.round(clicks * rand(0.04, 0.12));
  const bid = randInt(800, 12_500);
  const spend = clicks * bid;
  const revenue = conversions * product.price;
  const drr = revenue > 0 ? +((spend / revenue) * 100).toFixed(2) : 0;
  const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
  return {
    id: `boost-${idx + 1}`,
    productId: product.id,
    productTitle: product.title,
    productImage: product.image,
    keyword: pick(KEYWORDS_POOL),
    bid,
    position: randInt(1, 10),
    impressions,
    clicks,
    ctr,
    conversions,
    spend,
    revenue,
    drr,
    roas,
    status: pick(STATUSES),
  };
});

const NEGATIVE_WORDS = [
  "arzon", "ishlatilgan", "yangi emas", "shikastlangan", "buzilgan",
  "olmaslik", "qaytar", "sifati past", "tekin", "klon",
  "kopiya", "fake", "noma'lum", "katta o'lcham", "kichik o'lcham",
];

export const NEGATIVE_KEYWORDS: NegativeKeyword[] = NEGATIVE_WORDS.map((w, idx) => ({
  id: `neg-${idx + 1}`,
  word: w,
  blockedImpressions: randInt(40, 2_400),
  savedSpend: randInt(80_000, 4_800_000),
  addedDays: randInt(1, 60),
}));
