import type { Order } from "@/types/domain";
import { PRODUCTS } from "./products";
import { rand, randInt, pick } from "./seed";

const CUSTOMERS = ["Sardor Aliyev", "Madina Karimova", "Jasur Tursunov", "Nilufar Rashidova", "Akmal Sobirov", "Diyora Mirzayeva", "Bekzod Hamidov", "Lola Pulatova", "Otabek Usmanov", "Shaxnoza Bekova", "Anvar Davlatov", "Malika Yusupova"];
const CITIES = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan", "Qarshi", "Nukus", "Urganch", "Jizzax"];
const STATUSES: Order["status"][] = ["delivered", "delivered", "delivered", "shipping", "processing", "returned", "cancelled"];

export const ORDERS: Order[] = Array.from({ length: 18 }, (_, idx) => {
  const product = PRODUCTS[randInt(0, PRODUCTS.length - 1)];
  const daysAgo = randInt(0, 8);
  const hoursAgo = randInt(0, 24);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  const units = randInt(1, 3);
  return {
    id: `ORD-${(86200 + idx).toString()}`,
    customer: pick(CUSTOMERS),
    product: product.title,
    productImage: product.image,
    amount: product.price * units,
    status: pick(STATUSES),
    date: date.toISOString(),
    city: pick(CITIES),
  };
});
