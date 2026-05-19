"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/domain";

export type SortKey = "revenue" | "growth" | "stock" | "rating";

interface ProductFiltersProps {
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
  sort: SortKey;
  onSort: (v: SortKey) => void;
  categories: { key: string; name: string }[];
}

export function ProductFilters({
  query,
  onQuery,
  category,
  onCategory,
  sort,
  onSort,
  categories,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Mahsulot nomi yoki SKU..."
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          className="h-10 pl-9"
        />
      </div>
      <Select value={category} onValueChange={onCategory}>
        <SelectTrigger className="h-10 sm:w-56">
          <SelectValue placeholder="Kategoriya" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Barcha kategoriyalar</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.key} value={c.key}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(v) => onSort(v as SortKey)}>
        <SelectTrigger className="h-10 sm:w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="revenue">Daromad bo'yicha</SelectItem>
          <SelectItem value="growth">O'sish bo'yicha</SelectItem>
          <SelectItem value="stock">Qoldiq bo'yicha</SelectItem>
          <SelectItem value="rating">Reyting bo'yicha</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function applyFilters(
  products: Product[],
  { query, category, sort }: { query: string; category: string; sort: SortKey }
) {
  const q = query.trim().toLowerCase();
  const filtered = products.filter((p) => {
    const matchQ =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q);
    const matchC = category === "all" || p.category === category;
    return matchQ && matchC;
  });

  const sorters: Record<SortKey, (a: Product, b: Product) => number> = {
    revenue: (a, b) => b.revenue30d - a.revenue30d,
    growth: (a, b) => b.growthPercent - a.growthPercent,
    stock: (a, b) => a.stock - b.stock,
    rating: (a, b) => b.rating - a.rating,
  };
  return filtered.sort(sorters[sort]);
}
