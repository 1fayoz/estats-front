"use client";

import * as React from "react";

import { formatCompact } from "@/lib/format";
import { report, type ReportIndex } from "@/lib/report";

import { SelectControl, type Option } from "./ui";

/*
  Sahifalar orasida umumiy filtrlar: «Toifa 1» va «Tovar turini qidirish».
  Ro'yxatlar bir marta yuklanadi va modul darajasida saqlanadi —
  har sahifa almashganda qayta so'ralmasin.
*/

let indexCache: Promise<ReportIndex> | null = null;

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
