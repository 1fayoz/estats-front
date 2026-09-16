"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { market, type MarketCategoryOption } from "@/lib/market";

const ALL = "__all__";
const CURRENT = "__current__";
let categoryTreeRequest: Promise<MarketCategoryOption[]> | null = null;

function loadCategoryTree() {
  if (!categoryTreeRequest) {
    categoryTreeRequest = market.categoryTree().catch((error) => {
      categoryTreeRequest = null;
      throw error;
    });
  }
  return categoryTreeRequest;
}

export function useCategoryParam(): [number | null, (value: number | null) => void] {
  const router = useRouter();
  const params = useSearchParams();
  const raw = Number(params.get("category"));
  const value = Number.isInteger(raw) && raw > 0 ? raw : null;

  const setValue = React.useCallback((category: number | null) => {
    const next = new URLSearchParams(params.toString());
    if (category) next.set("category", String(category));
    else next.delete("category");
    next.delete("page");
    router.push(`?${next.toString()}`);
  }, [params, router]);

  return [value, setValue];
}

export function CategoryFilter({
  value,
  onChange,
  allowAll = true,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  allowAll?: boolean;
}) {
  const [items, setItems] = React.useState<MarketCategoryOption[]>([]);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    loadCategoryTree().then(setItems).catch(() => setFailed(true));
  }, []);

  const byId = React.useMemo(
    () => new Map(items.map((item) => [item.category_id, item])),
    [items],
  );
  const children = React.useMemo(() => {
    const grouped = new Map<number | null, MarketCategoryOption[]>();
    for (const item of items) {
      const siblings = grouped.get(item.parent_id) ?? [];
      siblings.push(item);
      grouped.set(item.parent_id, siblings);
    }
    return grouped;
  }, [items]);

  const chain = React.useMemo(() => {
    const result: MarketCategoryOption[] = [];
    let current = value ? byId.get(value) : undefined;
    while (current) {
      result.unshift(current);
      current = current.parent_id ? byId.get(current.parent_id) : undefined;
    }
    return result;
  }, [byId, value]);

  const roots = children.get(null) ?? [];

  React.useEffect(() => {
    if (!allowAll && value === null && roots.length) onChange(roots[0].category_id);
  }, [allowAll, onChange, roots, value]);

  if (failed) {
    return <span className="text-xs text-[color:var(--bad)]">Turkumlar yuklanmadi</span>;
  }
  if (!items.length) {
    return <span className="text-xs text-muted-foreground">Turkumlar yuklanmoqda…</span>;
  }

  const levels: { parent: MarketCategoryOption | null; options: MarketCategoryOption[] }[] = [
    { parent: null, options: roots },
  ];
  for (const picked of chain) {
    const next = children.get(picked.category_id) ?? [];
    if (next.length) levels.push({ parent: picked, options: next });
  }

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {levels.map(({ parent, options }, index) => {
        const selected = chain[index];
        const selectValue = selected?.category_id
          ? String(selected.category_id)
          : parent
            ? CURRENT
            : ALL;
        return (
          <Select
            key={parent?.category_id ?? "root"}
            value={selectValue}
            onValueChange={(next) => {
              if (next === ALL) onChange(null);
              else if (next === CURRENT) onChange(parent?.category_id ?? null);
              else onChange(Number(next));
            }}
          >
            <SelectTrigger className="h-10 w-[min(18rem,80vw)]">
              <SelectValue placeholder={`${index + 1}-toifani tanlang`} />
            </SelectTrigger>
            <SelectContent>
              {index === 0 && allowAll ? <SelectItem value={ALL}>Barcha toifalar</SelectItem> : null}
              {parent ? <SelectItem value={CURRENT}>Shu toifa: {parent.title}</SelectItem> : null}
              {!allowAll && index === 0 && !selected ? (
                <SelectItem value={ALL} disabled>Toifani tanlang</SelectItem>
              ) : null}
              {options.map((option) => (
                <SelectItem key={option.category_id} value={String(option.category_id)}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
      {value && byId.get(value) ? (
        <span className="max-w-full truncate text-xs text-muted-foreground" title={byId.get(value)?.full_title}>
          {byId.get(value)?.full_title}
        </span>
      ) : null}
    </div>
  );
}
