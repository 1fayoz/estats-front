"use client";

import * as React from "react";

import { formatCompact } from "@/lib/format";
import { market, type MarketProduct } from "@/lib/market";
import { report, type ReportIndex } from "@/lib/report";

import { SelectControl, type Option } from "./ui";

/*
  Sahifalar orasida umumiy filtrlar: «Toifa 1» va «Tovar turini qidirish».
  Ro'yxatlar bir marta yuklanadi va modul darajasida saqlanadi —
  har sahifa almashganda qayta so'ralmasin.
*/

let indexCache: Promise<ReportIndex> | null = null;

type CurrentProduct = {
  product_id: number;
  title: string | null;
  shop: string | null;
  category: string | null;
};

function productOption(product: CurrentProduct): Option {
  const leaf = product.category?.split(",").at(-1)?.trim();
  const details = [`#${product.product_id}`, product.shop, leaf].filter(Boolean).join(" · ");
  return {
    value: String(product.product_id),
    label: product.title || `Mahsulot #${product.product_id}`,
    metric: details,
  };
}

/** Bitta qidiruv ID, nom, do'kon va turkumni qamraydi. */
export function ProductControl({
  value, current, onChange, style,
}: {
  value: string | null;
  current?: CurrentProduct | null;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
}) {
  const [query, setQuery] = React.useState("");
  const [products, setProducts] = React.useState<MarketProduct[]>([]);

  React.useEffect(() => {
    let alive = true;
    const timer = window.setTimeout(() => {
      market
        .products({ days: 30, q: query.trim() || undefined, limit: 50 })
        .then((page) => { if (alive) setProducts(page.items); })
        .catch(() => { if (alive) setProducts([]); });
    }, 300);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  const options = products.map(productOption);
  if (current && !options.some((option) => option.value === String(current.product_id))) {
    options.unshift(productOption(current));
  } else if (value && !options.some((option) => option.value === value)) {
    options.unshift({ value, label: `Mahsulot #${value}`, metric: `#${value}` });
  }

  return (
    <SelectControl
      label="Mahsulot"
      value={value}
      options={options}
      onChange={(next) => { if (next) onChange(next); }}
      onSearch={setQuery}
      metricLabel="ID · do'kon · turkum"
      placeholderValue={value ? `#${value}` : "Mahsulot tanlang"}
      allowClear={false}
      style={style}
    />
  );
}

export function useReportIndex(): ReportIndex | null {
  const [index, setIndex] = React.useState<ReportIndex | null>(null);
  React.useEffect(() => {
    indexCache ??= report.meta().catch((error) => {
      indexCache = null;
      throw error;
    });
    indexCache.then(setIndex).catch(() => setIndex({ toifas: [], periods: {}, as_of: null }));
  }, []);
  return index;
}

export function ToifaControl({
  label = "Toifa 1", value, onChange, style, allowClear = false,
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  style?: React.CSSProperties;
  allowClear?: boolean;
}) {
  const index = useReportIndex();
  const options: Option[] = (index?.toifas ?? []).map((t) => ({ value: t, label: t }));
  if (value && !options.some((o) => o.value === value)) options.unshift({ value, label: value });
  return (
    <SelectControl label={label} value={value} options={options} onChange={onChange} style={style}
                   allowClear={allowClear} metricLabel="Tushim (so'm)" />
  );
}

/* Ro'yxat TO'LIQ (sotuvsiz katalog barglari ham), lekin bir zumda
   5 000 qatorni brauzerga tashish shart emas: nazorat nomi ham
   «qidirish» — yozilgan matn serverda BUTUN ro'yxat bo'ylab
   qidiriladi, ro'yxatning o'zi esa tushum bo'yicha eng yiriklari. */
export function CategoryPathControl({
  label = "Tovar turini qidirish", value, onChange, period = "d30", root, style,
}: {
  label?: string;
  value: string | null;
  onChange: (value: string | null) => void;
  period?: string;
  root?: string | null;
  style?: React.CSSProperties;
}) {
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<Option[]>([]);
  /* Ro'yxat BIR MARTA, TO'LIQ olinadi (5 337 turkum ≈ 40 KB gzip) va
     qidiruv MIJOZDA ishlaydi. Ilgari har harfda server so'rovi ketardi
     va javob 600 ta bilan cheklanardi: pastdagi turkumni aylantirib
     topib bo'lmasdi. Endi tashqi hisobotdagi kabi butun ro'yxat
     aylantiriladi (`SelectControl` uni virtual chizadi). */
  React.useEffect(() => {
    let alive = true;
    report
      .categoryPaths({ period, root: root ? root.toLowerCase() : undefined, limit: 10000 })
      .then((rows) => {
        if (!alive) return;
        setOptions(rows.map((r) => ({
          value: r.path, label: r.path, metric: r.revenue ? formatCompact(r.revenue) : null,
        })));
      })
      .catch(() => { if (alive) setOptions([]); });
    return () => { alive = false; };
  }, [period, root]);
  const needle = query.trim().toLowerCase();
  const filtered = needle ? options.filter((o) => o.label.toLowerCase().includes(needle)) : options;
  const list = value && !filtered.some((o) => o.value === value)
    ? [{ value, label: value }, ...filtered]
    : filtered;
  return (
    <SelectControl label={label} value={value} options={list} onChange={onChange} style={style}
                   onSearch={setQuery} metricLabel="Tushim (so'm)" />
  );
}
