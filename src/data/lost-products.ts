import type { LostProduct } from "@/types/domain";
import { PRODUCTS } from "./products";
import { rand, randInt, pick } from "./seed";

const WAREHOUSES = ["Toshkent FC-1", "Toshkent FC-2", "Samarqand FC", "Andijon FC", "Buxoro FC"];
const STATUSES: LostProduct["status"][] = ["investigating", "compensated", "rejected", "pending", "pending"];

export const LOST_PRODUCTS: LostProduct[] = Array.from({ length: 9 }, (_, idx) => {
  const product = PRODUCTS[(idx * 3) % PRODUCTS.length];
  const expectedUnits = randInt(20, 200);
  const lostUnits = randInt(2, Math.min(15, expectedUnits));
  const receivedUnits = expectedUnits - lostUnits;
  const daysAgo = randInt(1, 28);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return {
    id: `lp-${idx + 1}`,
    sku: product.sku,
    productImage: product.image,
    productTitle: product.title,
    expectedUnits,
    receivedUnits,
    lostUnits,
    estimatedLoss: lostUnits * product.price,
    warehouse: pick(WAREHOUSES),
    detectedAt: date.toISOString(),
    status: pick(STATUSES),
  };
});
