import type { MonitoringEvent } from "@/types/domain";
import { PRODUCTS } from "./products";
import { rand, randInt, pick } from "./seed";

const TYPES: MonitoringEvent["type"][] = [
  "price_change",
  "stock_change",
  "content_change",
  "rank_change",
  "new_review",
];

function eventFor(type: MonitoringEvent["type"], productPrice: number) {
  switch (type) {
    case "price_change": {
      const delta = +rand(-15, 15).toFixed(1);
      const newPrice = Math.round(productPrice * (1 + delta / 100));
      return {
        before: `${productPrice.toLocaleString("uz-UZ")} so'm`,
        after: `${newPrice.toLocaleString("uz-UZ")} so'm`,
        delta,
        severity: Math.abs(delta) > 8 ? "warning" : ("info" as MonitoringEvent["severity"]),
      };
    }
    case "stock_change": {
      const before = randInt(20, 200);
      const after = randInt(0, before);
      return {
        before: `${before} dona`,
        after: `${after} dona`,
        delta: -((before - after) / before) * 100,
        severity: after < 10 ? "alert" : after < 30 ? "warning" : ("info" as MonitoringEvent["severity"]),
      };
    }
    case "rank_change": {
      const before = randInt(1, 50);
      const after = randInt(1, 50);
      return {
        before: `#${before} pozitsiya`,
        after: `#${after} pozitsiya`,
        delta: ((before - after) / before) * 100,
        severity: after > before + 5 ? "warning" : ("info" as MonitoringEvent["severity"]),
      };
    }
    case "content_change":
      return {
        before: "Sarlavha v1",
        after: "Sarlavha yangilandi",
        severity: "info" as const,
      };
    case "new_review": {
      const rating = randInt(1, 5);
      return {
        before: "yangi sharh",
        after: `${rating} yulduz`,
        severity: rating <= 2 ? "alert" : "info" as MonitoringEvent["severity"],
      };
    }
  }
}

export const MONITORING_EVENTS: MonitoringEvent[] = Array.from({ length: 22 }, (_, idx) => {
  const product = PRODUCTS[randInt(0, PRODUCTS.length - 1)];
  const type = pick(TYPES);
  const e = eventFor(type, product.price);
  const hoursAgo = randInt(0, 96);
  const date = new Date();
  date.setHours(date.getHours() - hoursAgo);
  return {
    id: `m-${idx + 1}`,
    type,
    productId: product.id,
    productImage: product.image,
    productTitle: product.title,
    detectedAt: date.toISOString(),
    ...e,
  };
}).sort((a, b) => b.detectedAt.localeCompare(a.detectedAt));
