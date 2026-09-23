"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Database,
  Inbox,
  LoaderCircle,
  PlugZap,
  Search,
  Store,
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

import { formatCompact, formatDecimal, formatNumber } from "@/lib/format";
import { onReportActivity, reportBusy } from "@/lib/report";
import type { PeriodOption, ReportMeta } from "@/lib/report";
import { cn } from "@/lib/utils";

import s from "./report.module.css";

/*
  Bozor hisobotining umumiy qismlari — tashqi xizmat (Looker Studio)
  ko'rinishi bilan bir-bir. O'lchangan qiymatlar `report.module.css`
  boshida.

  Looker'ning TIZIM so'zlari («Общий итог», «Нет данных»,
  «за предыдущие 30 дней») hisobotga emas, Google hisobining tiliga
  tegishli — ular o'zbekchaga o'girilgan. Hisobot muallifi qo'ygan
  yorliqlar (Tushim, Do'kon, Muddat…) esa aynan saqlangan.
*/

export const styles = s;

const PAGE_INFO: Record<string, { title: string; description: string }> = {
  "/market": { title: "Uzum bozori", description: "Bozor hajmi, o‘sish va yetakchilar" },
  "/market/categories": { title: "Kategoriyalar", description: "Toifalar kesimida tushum va raqobat" },
  "/market/dynamics": { title: "Kategoriya dinamikasi", description: "Tushum va narxning vaqt bo‘yicha o‘zgarishi" },
  "/market/niches": { title: "Bozor qatlamlari", description: "Talab yuqori va raqobat past yo‘nalishlar" },
  "/market/prices": { title: "Narx tahlili", description: "Narx oralig‘i bo‘yicha talab va tushum" },
  "/market/competition": { title: "Raqobat va assortiment", description: "Taklif, sotuv va bozor ulushi" },
  "/market/products": { title: "Mahsulotlar", description: "Kartochkalar kesimida bozor natijalari" },
  "/market/skus": { title: "SKU tahlili", description: "Variantlar kesimida sotuv va qoldiq" },
  "/market/card": { title: "Mahsulot kartochkasi", description: "Bitta mahsulotning batafsil ko‘rsatkichlari" },
  "/market/card-table": { title: "Kartochkalar jadvali", description: "Mahsulot tarixining to‘liq ko‘rinishi" },
  "/market/seo": { title: "Mahsulot kalitlari", description: "Qidiruv talabi va kalit so‘zlar" },
  "/market/seo/keyword": { title: "Kalit so‘z tahlili", description: "Qamrov va qidiruv dinamikasi" },
  "/market/seo/competitors": { title: "SEO raqobatchilar", description: "Qidiruvdagi kartochkalar va pozitsiyalar" },
  "/market/shops": { title: "Do‘konlar reytingi", description: "Yetakchi do‘konlar va bozor ulushi" },
  "/market/shop": { title: "Do‘kon tahlili", description: "Do‘konning sotuv va assortiment dinamikasi" },
  "/market/seller-skus": { title: "Sotuvchi SKUlari", description: "Sotuvchi assortimentining natijalari" },
  "/market/sellers": { title: "Sotuvchilar", description: "Yuridik shaxslar, do‘konlar va bozor natijalari" },
};

// ── Formatlar ───────────────────────────────────────────────────

export const fmt = {
  int: (v: number | null | undefined) => (v == null ? "-" : formatNumber(Math.round(v))),
  money: (v: number | null | undefined) => (v == null ? "-" : formatNumber(Math.round(v))),
  compact: (v: number | null | undefined) => (v == null ? "-" : formatCompact(v)),
  // Butun qisqartma — hisobot «Yo'qotilgan foyda» ni shunday yozadi.
  compact0: (v: number | null | undefined) => (v == null ? "-" : formatCompact(v, 0)),
  // ⚠️ `formatNumber` EMAS: u kasr bo'lsa har doim bitta xona qoldiradi,
  // ya'ni `dec(2)` ham "32,4" chiqarardi (hisobotda "32,37").
  dec: (digits: number) => (v: number | null | undefined) =>
    v == null ? "-" : formatDecimal(v, digits),
  pct: (digits = 0, space = false) => (v: number | null | undefined) =>
    v == null || !Number.isFinite(v) ? "-" : `${formatNumber(Number((v * 100).toFixed(digits)))}${space ? " " : ""}%`,
};

// ── Sahifa ──────────────────────────────────────────────────────

/** Hisobot so'rovi ketyaptimi — BITTA manbadan (`lib/report`). */
export function useReportBusy(): boolean {
  return React.useSyncExternalStore(onReportActivity, reportBusy, () => false);
}

export function ReportPage({
  children,
  title,
  description,
  showHeader = true,
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
}) {
  const busy = useReportBusy();
  const pathname = usePathname();
  const routeInfo = PAGE_INFO[pathname]
    ?? (pathname.startsWith("/market/sellers/") ? PAGE_INFO["/market/sellers"] : undefined)
    ?? { title: "Bozor tahlili", description: "Uzum Market ma’lumotlari" };
  const info = {
    title: title ?? routeInfo.title,
    description: description ?? routeInfo.description,
  };
  return (
    <div className={s.page}>
      <div className={s.canvas}>
        {showHeader ? (
          <div className={s.strip}>
            <div className={s.brandBlock}>
              <span className={s.brandIcon}><Store aria-hidden="true" /></span>
              <span>
                <span className={s.brand}>{info.title}</span>
                <span className={s.brandMeta}>{info.description}</span>
              </span>
            </div>
            <div className={s.stripActions}>
              <Link href="/integrations"><PlugZap aria-hidden="true" /> Ulanishlar</Link>
              <a href="https://t.me/estats_uz_bot" target="_blank" rel="noreferrer">
                <CircleHelp aria-hidden="true" /> Yordam
              </a>
            </div>
          </div>
        ) : null}
        {busy ? (
          <div className={s.loadingWrap} role="status" aria-live="polite">
            <LoaderCircle aria-hidden="true" />
            <span>Ma’lumot yangilanmoqda</span>
            <div className={s.loading} />
          </div>
        ) : null}
        <div className={s.body}>{children}</div>
      </div>
    </div>
  );
}

export function Row({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className={s.row} style={style}>
      {children}
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return <div className={s.filterBar}>{children}</div>;
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className={s.statsGrid}>{children}</div>;
}

export function ChartGrid({ children }: { children: React.ReactNode }) {
  return <div className={s.chartGrid}>{children}</div>;
}

export function Card({
  title, children, style, bordered, center,
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  bordered?: boolean;
  center?: boolean;
}) {
  return (
    <div className={cn(s.card, bordered && s.cardBordered)} style={style}>
      {title ? <div className={cn(s.cardTitle, center && s.cardTitleCenter)}>{title}</div> : null}
      {children}
    </div>
  );
}

/** Pastki yozuv: raqam qaysi kun holatiga va qayerdan — yashirilmaydi. */
export function SourceNote({ meta }: { meta: ReportMeta | undefined }) {
  if (!meta || !meta.as_of) return null;
  const own = meta.source === "estats";
  return (
    <div className={s.note}>
      <Database aria-hidden="true" />
      <span>Ma&apos;lumot {meta.as_of.split("-").reverse().join(".")} holatiga ·{" "}
      <span className={own ? s.sourceOwn : s.sourceZs}>
        {own ? "o'z o'lchovimiz" : "import qilingan tarix (import)"}
      </span></span>
    </div>
  );
}

export function Empty({ children = "Ma'lumot yo'q" }: { children?: React.ReactNode }) {
  // So'rov hali ketayotgan bo'lsa «ma'lumot yo'q» deyish YOLG'ON —
  // foydalanuvchi buni buzuq sahifa deb o'qiydi.
  const busy = useReportBusy();
  return busy ? (
    <div className={s.pendingSpace} aria-hidden="true" />
  ) : (
    <div className={s.empty}><Inbox aria-hidden="true" /><span>{children}</span></div>
  );
}

// ── Filtr: tanlov ro'yxati ──────────────────────────────────────

export type Option = { value: string; label: string; metric?: string | null };

function useOutside(ref: React.RefObject<HTMLElement | null>, onOutside: () => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, onOutside]);
}

export function SelectControl({
  label, value, options, onChange, metricLabel, style, allowClear = true, searchable = true, onSearch,
  placeholderValue,
}: {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string | null) => void;
  metricLabel?: string;
  style?: React.CSSProperties;
  allowClear?: boolean;
  searchable?: boolean;
  onSearch?: (q: string) => void;
  placeholderValue?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, close);
  const current = options.find((o) => o.value === value);
  const shown = onSearch
    ? options
    : options.filter((o) => !query || o.label.toLowerCase().includes(query.toLowerCase()));

  /* Ro'yxat MINGLAB qatorli bo'lishi mumkin (turkumlar — 5 337 ta), shuning
     uchun DOM'ga faqat ko'rinadigan oyna chiziladi. Ilgari ro'yxat 600 ta
     bilan CHEKLANGAN edi va pastdagi turkumlarni (masalan «…tennis va
     badminton, padel») aylantirib topib bo'lmasdi — faqat yozib qidirsa
     chiqardi. tashqi hisobotda esa butun ro'yxat aylantiriladi. */
  const listRef = React.useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewport, setViewport] = React.useState(320);
  React.useEffect(() => {
    if (!open) return;
    setScrollTop(0);
    if (listRef.current) {
      listRef.current.scrollTop = 0;
      setViewport(listRef.current.clientHeight || 320);
    }
  }, [open]);
  React.useEffect(() => { setScrollTop(0); if (listRef.current) listRef.current.scrollTop = 0; }, [query]);
  const ROW = 32;
  const OVER = 8;
  const virtual = shown.length > 120;
  const first = virtual ? Math.max(0, Math.floor(scrollTop / ROW) - OVER) : 0;
  const last = virtual ? Math.min(shown.length, Math.ceil((scrollTop + viewport) / ROW) + OVER) : shown.length;
  const window_ = shown.slice(first, last);

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      <div
        className={s.control}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <span className={s.controlLabel}>
          {label}
          {current || placeholderValue ? ":" : ""}
        </span>
        <span className={s.controlValue}>{current?.label ?? placeholderValue ?? ""}</span>
        {value ? <span className={s.controlCount}>(1)</span> : null}
        <ChevronDown className={s.caret} aria-hidden="true" />
      </div>
      {open ? (
        <div className={s.dropdown}>
          <div className={s.dropdownHead}>
            <span>
              {label} {value ? "(1)" : ""}
            </span>
            {metricLabel ? <span>{metricLabel}</span> : null}
          </div>
          {searchable ? (
            <div className={s.dropdownSearch}>
              <Search aria-hidden="true" />
              <input
                autoFocus
                placeholder="Qidirish"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  onSearch?.(e.target.value);
                }}
              />
            </div>
          ) : null}
          <div
            className={s.dropdownList}
            ref={listRef}
            onScroll={virtual ? (e) => setScrollTop((e.target as HTMLDivElement).scrollTop) : undefined}
          >
            {allowClear && value ? (
              <div className={s.option} onClick={() => { onChange(null); setOpen(false); }}>
                <span className={s.check} />
                <span className={cn(s.optionText, s.muted)}>Tanlovni bekor qilish</span>
              </div>
            ) : null}
            {virtual && first ? <div style={{ height: first * ROW }} /> : null}
            {window_.map((o) => (
              <div
                key={o.value}
                className={s.option}
                style={virtual ? { height: ROW } : undefined}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
              >
                <span className={s.check}>{o.value === value ? <Check aria-hidden="true" /> : null}</span>
                <span className={s.optionText}>{o.label}</span>
                {o.metric ? <span className={s.optionMetric}>{o.metric}</span> : null}
              </div>
            ))}
            {virtual && last < shown.length ? <div style={{ height: (shown.length - last) * ROW }} /> : null}
            {!shown.length ? <Empty>Hech narsa topilmadi</Empty> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const UZ_MONTHS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr",
  "Noyabr", "Dekabr"];

/** `d30` → «30 kun», `m2026-08` → «'26 Avgust» (estats-market `report/periods.label`). */
export function periodLabel(key: string): string {
  const sliding = /^d(\d+)$/.exec(key);
  if (sliding) return `${sliding[1]} kun`;
  const month = /^m(\d{4})-(\d{2})$/.exec(key);
  if (month) return `'${month[1].slice(2)} ${UZ_MONTHS[Number(month[2]) - 1] ?? month[2]}`;
  return key;
}

export function PeriodControl({
  value, periods, onChange, label = "Muddat", style,
}: {
  value: string;
  periods: PeriodOption[];
  onChange: (value: string) => void;
  label?: string;
  style?: React.CSSProperties;
}) {
  // Davr ro'yxati bo'sh bo'lsa (bu kesimda hali snapshot yo'q) ham yozuv
  // «d30» emas, «30 kun» bo'lsin — backend `periods.label()` bilan bir xil.
  const options = periods.map((p) => ({ value: p.key, label: p.label }));
  if (!options.some((o) => o.value === value)) options.unshift({ value, label: periodLabel(value) });
  return (
    <SelectControl
      label={label}
      value={value}
      options={options}
      allowClear={false}
      onChange={(v) => v && onChange(v)}
      style={style}
    />
  );
}

const RU_MONTHS = ["yan.", "fev.", "mar.", "apr.", "may", "iyun", "iyul", "avg.", "sen.", "okt.", "noy.", "dek."];

export function dayLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${RU_MONTHS[m - 1]} ${y} y.`;
}

export function DateRangeControl({
  start, end, onChange, style,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState({ start, end });
  const ref = React.useRef<HTMLDivElement>(null);
  const close = React.useCallback(() => setOpen(false), []);
  useOutside(ref, close);
  React.useEffect(() => setDraft({ start, end }), [start, end]);

  const preset = (days: number) => {
    const last = new Date(`${end}T00:00:00`);
    const first = new Date(last);
    first.setDate(first.getDate() - (days - 1));
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    onChange(iso(first), iso(last));
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative", ...style }}>
      <div
        className={s.control}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((v) => !v);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={open}
      >
        <span className={s.controlValue} style={{ fontSize: 13 }}>
          {dayLabel(start)} - {dayLabel(end)}
        </span>
        <ChevronDown className={s.caret} aria-hidden="true" />
      </div>
      {open ? (
        <div className={s.dropdown} style={{ minWidth: 300, padding: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "end", fontSize: 12 }}>
            <label style={{ flex: 1 }}>
              Boshlanish
              <input
                className={s.input}
                type="date"
                value={draft.start}
                onChange={(e) => setDraft((d) => ({ ...d, start: e.target.value }))}
              />
            </label>
            <label style={{ flex: 1 }}>
              Tugash
              <input
                className={s.input}
                type="date"
                value={draft.end}
                onChange={(e) => setDraft((d) => ({ ...d, end: e.target.value }))}
              />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            {[7, 14, 30, 90, 365].map((d) => (
              <button key={d} type="button" className={s.option} style={{ border: "1px solid var(--border)" }}
                      onClick={() => preset(d)}>
                {d} kun
              </button>
            ))}
            <button
              type="button"
              className={s.option}
              style={{ marginLeft: "auto", background: "var(--primary)", color: "var(--primary-foreground)" }}
              onClick={() => {
                onChange(draft.start, draft.end);
                setOpen(false);
              }}
            >
              Qo&apos;llash
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function InputControl({
  label, value, onCommit, placeholder = "Qiymat kiriting", style, inputMode, options, onDraft,
}: {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
  inputMode?: "numeric" | "text";
  /** Tayyor variantlar (ZoomSelling'dagi ro'yxatli filtrlar kabi). */
  options?: string[];
  /** Har tugmabosishda chaqiriladi — takliflarni serverdan olish uchun. */
  onDraft?: (value: string) => void;
}) {
  const [draft, setDraft] = React.useState(value);
  const listId = React.useId();
  React.useEffect(() => setDraft(value), [value]);
  return (
    <div className={s.control} style={{ cursor: "default", ...style }}>
      <span className={s.controlLabel} style={{ fontSize: 12 }}>{label}</span>
      <input
        className={s.input}
        value={draft}
        inputMode={inputMode}
        placeholder={placeholder}
        list={options ? listId : undefined}
        onChange={(e) => { setDraft(e.target.value); onDraft?.(e.target.value); }}
        onBlur={() => draft !== value && onCommit(draft)}
        onKeyDown={(e) => e.key === "Enter" && onCommit(draft)}
      />
      {options ? (
        <datalist id={listId}>
          {options.map((o) => <option key={o} value={o} />)}
        </datalist>
      ) : null}
    </div>
  );
}

// ── Ko'rsatkich kartasi ─────────────────────────────────────────

export function Scorecard({
  label, value, growth, format = fmt.compact, compare, spark, style, invert,
}: {
  label: string;
  value: number | null | undefined;
  growth?: number | null;
  format?: (v: number | null | undefined) => string;
  compare?: string;
  spark?: { day: string; value: number | null }[];
  style?: React.CSSProperties;
  /** O'sish yomon bo'lgan ko'rsatkich (oborot) — rang teskari. */
  invert?: boolean;
}) {
  const good = growth == null ? null : invert ? growth < 0 : growth > 0;
  return (
    <div className={s.score} style={style}>
      <span className={s.scoreLabel}>{label}</span>
      <span className={s.scoreValue}>{format(value)}</span>
      {growth != null || compare ? (
        <span className={s.scoreDelta}>
          {growth != null ? (
            <span className={good ? s.up : s.down}>
              {growth >= 0 ? <ArrowUpRight aria-hidden="true" /> : <ArrowDownRight aria-hidden="true" />}
              {formatNumber(Number((Math.abs(growth) * 100).toFixed(1)))}%
            </span>
          ) : null}
          {compare ? <span className={s.muted}>{compare}</span> : null}
        </span>
      ) : null}
      {spark && spark.length > 1 ? (
        <div style={{ height: 22, marginTop: 2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark} margin={{ top: 1, bottom: 0, left: 0, right: 0 }}>
              <Area dataKey="value" stroke="var(--primary)" fill="var(--accent)" strokeWidth={1.7} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}

// ── Jadval ──────────────────────────────────────────────────────

export type Column<T> = {
  key: string;
  title: React.ReactNode;
  value?: (row: T) => number | string | null | undefined;
  render?: (row: T) => React.ReactNode;
  format?: (v: number | null | undefined) => string;
  num?: boolean;
  width?: number | string;
  /** Heatmap: ustun rangi, alfa = qiymat / eng katta qiymat. */
  heat?: [number, number, number];
  /** Qatordagi chiziqcha (Looker «bar» uslubi). */
  bar?: string;
  /** Qiymatga qarab matn/fon rangi. */
  tone?: (row: T) => React.CSSProperties | undefined;
  sortable?: boolean;
  center?: boolean;
};

export function ZTable<T>({
  columns, rows, sort, dir, onSort, numbered = true, offset = 0, total, limit, onPage, totalsRow,
  height, rowKey, empty,
}: {
  columns: Column<T>[];
  rows: T[];
  sort?: string;
  dir?: "asc" | "desc";
  onSort?: (key: string, dir: "asc" | "desc") => void;
  numbered?: boolean;
  offset?: number;
  total?: number;
  limit?: number;
  onPage?: (offset: number) => void;
  totalsRow?: Partial<Record<string, React.ReactNode>>;
  height?: number | string;
  rowKey: (row: T, index: number) => React.Key;
  empty?: React.ReactNode;
}) {
  const maxima = React.useMemo(() => {
    const result: Record<string, number> = {};
    for (const column of columns) {
      if (!column.heat && !column.bar) continue;
      let max = 0;
      for (const row of rows) {
        const raw = column.value?.(row);
        const v = typeof raw === "number" ? Math.abs(raw) : 0;
        if (v > max) max = v;
      }
      result[column.key] = max;
    }
    return result;
  }, [columns, rows]);

  const cell = (column: Column<T>, row: T) => {
    if (column.render) return column.render(row);
    const raw = column.value?.(row);
    if (typeof raw === "number" || raw == null) {
      const text = (column.format ?? fmt.int)(raw as number | null | undefined);
      if (column.bar && typeof raw === "number" && maxima[column.key]) {
        const width = Math.max(1, Math.round((Math.abs(raw) / maxima[column.key]) * 100));
        return (
          <span className={s.barCell}>
            {text}
            <span className={s.bar} style={{ width: `${width * 0.6}px`, background: column.bar }} />
          </span>
        );
      }
      return text;
    }
    return raw;
  };

  return (
    <>
      <div className={s.tableWrap} style={{ maxHeight: height }}>
        <table className={s.ztable}>
          <thead>
            <tr>
              {numbered ? <th className={s.index} /> : null}
              {columns.map((column) => {
                const active = sort === column.key;
                return (
                  <th
                    key={column.key}
                    className={cn(column.num && s.num, column.center && s.center)}
                    style={{ width: column.width }}
                    onClick={() => {
                      if (!onSort || column.sortable === false) return;
                      onSort(column.key, active && dir === "desc" ? "asc" : "desc");
                    }}
                  >
                    {column.title}
                    {active ? <span style={{ fontSize: 9, marginLeft: 4 }}>{dir === "asc" ? "▲" : "▼"}</span> : null}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {numbered ? <td className={s.index}>{offset + index + 1}.</td> : null}
                {columns.map((column) => {
                  const raw = column.value?.(row);
                  let style: React.CSSProperties | undefined = column.tone?.(row);
                  if (column.heat && typeof raw === "number" && maxima[column.key]) {
                    const alpha = Math.max(0, Math.min(1, raw / maxima[column.key]));
                    const [r, g, b] = column.heat;
                    style = { background: `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`, ...style };
                  }
                  return (
                    <td key={column.key} className={cn(column.num && s.num, column.center && s.center)}
                        style={style}>
                      {cell(column, row)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {!rows.length ? (
              <tr>
                <td colSpan={columns.length + (numbered ? 1 : 0)}>
                  <Empty>{empty ?? "Ma'lumot yo'q"}</Empty>
                </td>
              </tr>
            ) : null}
          </tbody>
          {totalsRow && rows.length ? (
            <tfoot>
              <tr className={s.totalRow}>
                {numbered ? <td /> : null}
                {columns.map((column, i) => (
                  <td key={column.key} className={cn(column.num && s.num)}>
                    {totalsRow[column.key] ?? (i === 0 ? "Jami" : "")}
                  </td>
                ))}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>
      {total != null && limit ? (
        <div className={s.pager}>
          <span>
            {total ? offset + 1 : 0} - {Math.min(offset + limit, total)} / {formatNumber(total)}
          </span>
          <button type="button" disabled={offset <= 0} onClick={() => onPage?.(Math.max(0, offset - limit))}>
            ‹
          </button>
          <button type="button" disabled={offset + limit >= total} onClick={() => onPage?.(offset + limit)}>
            ›
          </button>
        </div>
      ) : null}
    </>
  );
}

// ── URL holati ──────────────────────────────────────────────────

/** Bir nechta filtrni bitta `replace` bilan manzilda saqlaydi. */
export function useParams(defaults: Record<string, string>) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const values = React.useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, fallback] of Object.entries(defaults)) out[key] = search.get(key) ?? fallback;
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.toString()]);

  const set = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(search.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === "" || value === defaults[key]) next.delete(key);
        else next.set(key, value);
      }
      const query = next.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pathname, router, search.toString()],
  );
  return [values, set] as const;
}

/** Ma'lumot yuklash: bekor qilinadigan, xatoni ushlaydigan. */
export function useLoad<T>(load: () => Promise<T>, deps: React.DependencyList) {
  const [state, setState] = React.useState<{ data: T | null; error: string | null; loading: boolean }>({
    data: null, error: null, loading: true,
  });
  React.useEffect(() => {
    let alive = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    load()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch((e: Error) => alive && setState({ data: null, error: e.message, loading: false }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const COLORS = {
  heatBlue: [91, 132, 232] as [number, number, number],
  heatLight: [196, 214, 248] as [number, number, number],
  heatDeep: [55, 98, 220] as [number, number, number],
  heatGreen: [95, 196, 154] as [number, number, number],
  heatPurple: [173, 135, 231] as [number, number, number],
  heatTeal: [74, 185, 201] as [number, number, number],
  heatOrange: [242, 183, 103] as [number, number, number],
  heatRed: [232, 132, 126] as [number, number, number],
  heatPink: [221, 117, 169] as [number, number, number],
  bar: "var(--primary)",
};
