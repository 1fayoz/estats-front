import { PRODUCTS } from "./products";
import type { DailyPoint } from "@/types/domain";

export function getOverviewMetrics() {
  const totalRevenue = PRODUCTS.reduce((acc, p) => acc + p.revenue30d, 0);
  const totalSales = PRODUCTS.reduce((acc, p) => acc + p.sold30d, 0);
  const avgRating =
    PRODUCTS.reduce((acc, p) => acc + p.rating, 0) / PRODUCTS.length;
  const totalReviews = PRODUCTS.reduce((acc, p) => acc + p.reviews, 0);
  const lowStock = PRODUCTS.filter((p) => p.status === "low_stock" || p.status === "out_of_stock").length;
  const avgConversion =
    PRODUCTS.reduce((acc, p) => acc + p.conversionRate, 0) / PRODUCTS.length;
  const growth =
    PRODUCTS.reduce((acc, p) => acc + p.growthPercent, 0) / PRODUCTS.length;

  return {
    totalRevenue,
    totalSales,
    avgRating: +avgRating.toFixed(2),
    totalReviews,
    lowStock,
    avgConversion: +avgConversion.toFixed(2),
    growth: +growth.toFixed(1),
    activeProducts: PRODUCTS.filter((p) => p.status === "active").length,
  };
}

export function getRevenueSeries(): DailyPoint[] {
  const aggregated: Map<string, DailyPoint> = new Map();
  for (const product of PRODUCTS) {
    for (const point of product.history) {
      const existing = aggregated.get(point.date);
      if (existing) {
        existing.sales += point.sales;
        existing.revenue += point.revenue;
        existing.visits = (existing.visits || 0) + (point.visits || 0);
      } else {
        aggregated.set(point.date, { ...point });
      }
    }
  }
  return Array.from(aggregated.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getCategoryDistribution() {
  const grouped: Record<string, { name: string; revenue: number; sales: number }> = {};
  for (const p of PRODUCTS) {
    if (!grouped[p.category]) {
      grouped[p.category] = { name: p.categoryName, revenue: 0, sales: 0 };
    }
    grouped[p.category].revenue += p.revenue30d;
    grouped[p.category].sales += p.sold30d;
  }
  return Object.entries(grouped).map(([key, v]) => ({ key, ...v }));
}

export function getTopProducts(limit = 5) {
  return [...PRODUCTS].sort((a, b) => b.revenue30d - a.revenue30d).slice(0, limit);
}

export function getGrowingProducts(limit = 5) {
  return [...PRODUCTS].sort((a, b) => b.growthPercent - a.growthPercent).slice(0, limit);
}
