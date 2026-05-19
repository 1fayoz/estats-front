import type { PhotoSearchResult } from "@/types/domain";
import { PRODUCTS } from "./products";
import { rand } from "./seed";

export function getPhotoSearchResults(): PhotoSearchResult[] {
  return PRODUCTS.slice(0, 8).map((p, idx) => ({
    id: `psr-${idx + 1}`,
    image: p.image,
    title: p.title,
    store: ["TechZone Uz", "ModaStyle", "BeautyHub", "HomeMax"][idx % 4],
    price: p.price,
    sales30d: p.sold30d,
    similarity: +rand(0.78, 0.99).toFixed(2),
  })).sort((a, b) => b.similarity - a.similarity);
}
