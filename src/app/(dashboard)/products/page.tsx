"use client";

import * as React from "react";
import { Download, Filter, Package } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  ProductFilters,
  applyFilters,
  type SortKey,
} from "@/features/products/components/product-filters";
import { ProductCard } from "@/features/products/components/product-card";
import { PRODUCTS } from "@/data/products";
import { CATEGORIES } from "@/data/categories";

export default function ProductsPage() {
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [sort, setSort] = React.useState<SortKey>("revenue");

  const filtered = React.useMemo(
    () => applyFilters(PRODUCTS, { query, category, sort }),
    [query, category, sort]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mahsulotlar"
        description={`Jami ${PRODUCTS.length} ta mahsulot · ${filtered.length} ta natija ko'rsatilmoqda`}
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Ko'proq filter
            </Button>
            <Button size="sm">
              <Download className="h-4 w-4" /> CSV eksport
            </Button>
          </>
        }
      />

      <ProductFilters
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
        sort={sort}
        onSort={setSort}
        categories={CATEGORIES.map((c) => ({ key: c.key, name: c.name }))}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Mahsulotlar topilmadi"
          description="Filterlarni o'zgartirib ko'ring yoki boshqa kalit so'z bilan qidiring."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
