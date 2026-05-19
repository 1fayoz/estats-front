import type { Review } from "@/types/domain";
import { PRODUCTS } from "./products";
import { rand, randInt, pick } from "./seed";

const NAMES = ["Sardor A.", "Madina K.", "Jasur T.", "Nilufar R.", "Akmal S.", "Diyora M.", "Bekzod H.", "Lola P.", "Otabek U.", "Shaxnoza B.", "Anvar D.", "Malika Y."];

const POSITIVE = [
  "Mahsulot juda yaxshi keldi, tezkor yetkazib berildi. Tavsiya qilaman!",
  "Sifati a'lo darajada, oilamga juda yoqdi.",
  "Narxi va sifati mos. Yetkazib berish o'z vaqtida.",
  "Qadoq mukammal, hech qanday muammosiz keldi.",
];
const NEUTRAL = [
  "Yomon emas, lekin tasvirdagiga to'liq mos kelmadi.",
  "O'rtacha, narxiga yarasha sifat.",
  "Yetkazib berish biroz kechikdi, lekin mahsulot yaxshi.",
];
const NEGATIVE = [
  "Sifati pastroq chiqdi, kutganimdan past.",
  "Yetkazib berishda mahsulot biroz shikastlangan edi.",
  "Tavsiyaga ko'ra olmadim, qaytarib yubordim.",
];

function reviewText(sentiment: Review["sentiment"]): string {
  if (sentiment === "positive") return pick(POSITIVE);
  if (sentiment === "negative") return pick(NEGATIVE);
  return pick(NEUTRAL);
}

export const REVIEWS: Review[] = Array.from({ length: 40 }, (_, idx) => {
  const product = PRODUCTS[idx % PRODUCTS.length];
  const ratingRoll = rand(0, 1);
  const sentiment: Review["sentiment"] =
    ratingRoll > 0.65 ? "positive" : ratingRoll > 0.3 ? "neutral" : "negative";
  const rating = sentiment === "positive" ? randInt(4, 5) : sentiment === "neutral" ? 3 : randInt(1, 2);
  const daysAgo = randInt(0, 28);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `r-${idx + 1}`,
    productId: product.id,
    productTitle: product.title,
    author: pick(NAMES),
    rating,
    date: date.toISOString(),
    text: reviewText(sentiment),
    reply: Math.random() > 0.6 ? "Sharhingiz uchun rahmat! Biz xizmat sifatini doimo yaxshilashga harakat qilamiz." : undefined,
    sentiment,
  };
});
