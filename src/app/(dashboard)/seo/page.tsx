"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheckBig,
  Info,
  Loader2,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/features/seo/components/score-ring";
import { ApiError, fetchAiKey, fetchSeoList, runSeoBulk } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import { queuedProductIds, useSeoJobStore } from "@/stores/seo-job-store";
import type { AiKeyState, SeoAuditRow } from "@/lib/types";
import styles from "./seo-list.module.css";

type StatusFilter = "all" | "attention" | "good" | "pending";
type SortOrder = "opportunity" | "scoreAsc" | "scoreDesc" | "name";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Barchasi" },
  { value: "attention", label: "E'tibor kerak" },
  { value: "good", label: "Yaxshi" },
  { value: "pending", label: "Audit qilinmagan" },
];

export default function SeoPage() {
  const [rows, setRows] = React.useState<SeoAuditRow[]>([]);
  const [aiKey, setAiKey] = React.useState<AiKeyState | null>(null);
  const [query, setQuery] = useQueryState("q", "");
  const [filter, setFilter] = React.useState<StatusFilter>("all");
  const [sort, setSort] = React.useState<SortOrder>("opportunity");
  const [chosen, setChosen] = React.useState<Set<number>>(new Set());
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const put = useSeoJobStore((state) => state.put);
  const jobs = useSeoJobStore((state) => state.jobs);
  const queued = React.useMemo(() => queuedProductIds(jobs), [jobs]);
  const running = jobs.find((job) => job.active) ?? null;

  const load = React.useCallback(async () => {
    try {
      const [list, ai] = await Promise.all([
        fetchSeoList(),
        fetchAiKey().catch(() => null),
      ]);
      setRows(list);
      setAiKey(ai);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);

  const activeCount = jobs.filter((job) => job.active).length;
  const previousActiveCount = React.useRef(activeCount);
  React.useEffect(() => {
    if (previousActiveCount.current > 0 && activeCount === 0) void load();
    previousActiveCount.current = activeCount;
  }, [activeCount, load]);

  const analyse = async (ids: number[]) => {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      put(await runSeoBulk({ productIds: ids }));
      setChosen(new Set());
      toast.success(`${ids.length} ta tovar navbatga qo'yildi`, {
        description: "Tahlil fonda davom etadi — boshqa bo'limda ishlashingiz mumkin.",
      });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Navbatga qo'yilmadi.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (productId: number) => {
    setChosen((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const done = rows.filter((row) => row.score !== null);
  const pending = rows.filter((row) => row.score === null);
  const good = done.filter((row) => (row.score ?? 0) >= 75);
  const attention = done.filter((row) => (row.score ?? 0) < 60);
  const average = done.length
    ? Math.round(done.reduce((sum, row) => sum + (row.score ?? 0), 0) / done.length)
    : null;
  const missed = done.reduce((sum, row) => sum + row.coverageMissed, 0);

  const visible = React.useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = rows.filter((row) => {
      const matchesSearch = !search || row.title.toLowerCase().includes(search);
      if (!matchesSearch) return false;
      if (filter === "attention") return row.score !== null && row.score < 60;
      if (filter === "good") return row.score !== null && row.score >= 75;
      if (filter === "pending") return row.score === null;
      return true;
    });
    return [...filtered].sort((left, right) => {
      if (sort === "scoreAsc") return (left.score ?? 101) - (right.score ?? 101);
      if (sort === "scoreDesc") return (right.score ?? -1) - (left.score ?? -1);
      if (sort === "name") return left.title.localeCompare(right.title, "uz");
      return right.coverageMissed - left.coverageMissed;
    });
  }, [filter, query, rows, sort]);

  const allVisibleSelected = visible.length > 0 && visible.every((row) => chosen.has(row.productId));
  const filterCount = (value: StatusFilter) => {
    if (value === "attention") return attention.length;
    if (value === "good") return good.length;
    if (value === "pending") return pending.length;
    return rows.length;
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.eyebrow}><Sparkles aria-hidden="true" /> Kartochka optimizatsiyasi</span>
          <h1>SEO audit</h1>
          <p>Tovarlaringiz qidiruvda qanchalik yaxshi topilishini ko&apos;ring va eng katta imkoniyatdan boshlang.</p>
        </div>
        {!aiKey?.configured ? (
          <Button variant="outline" asChild className={styles.aiButton}>
            <Link href={"/integrations" as Route}><Sparkles aria-hidden="true" /> AI kalitini ulash</Link>
          </Button>
        ) : (
          <span className={styles.aiReady}><CircleCheckBig aria-hidden="true" /> AI yordamchi ulangan</span>
        )}
      </header>

      {done.length > 0 ? (
        <section className={styles.summary} aria-label="SEO umumiy ko'rsatkichlari">
          <article className={styles.averageCard}>
            <ScoreRing score={average} size={72} />
            <div><span>O&apos;rtacha ball</span><strong>{average ?? "—"}</strong><small>{done.length} / {rows.length} tovar tekshirilgan</small></div>
          </article>
          <SummaryCard label="Audit qamrovi" value={`${Math.round((done.length / Math.max(rows.length, 1)) * 100)}%`} note={`${pending.length} ta tovar navbat kutmoqda`} />
          <SummaryCard label="E'tibor kerak" value={String(attention.length)} note="60 balldan past kartochkalar" tone="warning" />
          <SummaryCard label="Boy berilayotgan qamrov" value={formatNumber(missed)} note="ishlatilmagan kalit so'zlar" tone="danger" />
        </section>
      ) : null}

      {running ? (
        <section className={styles.running} aria-live="polite">
          <span className={styles.runningIcon}><Loader2 className="animate-spin" aria-hidden="true" /></span>
          <div><strong>Tahlil davom etmoqda</strong><p>{running.done + running.failed} / {running.total} tovar yakunlandi{running.failed > 0 ? ` · ${running.failed} xato` : ""}</p></div>
          <span>Fonda ishlaydi — sahifani tark etishingiz mumkin.</span>
        </section>
      ) : null}

      <section className={styles.catalog} aria-labelledby="seo-catalog-title">
        <div className={styles.catalogHeader}>
          <div><h2 id="seo-catalog-title">Tovarlar</h2><p>{visible.length} ta natija</p></div>
          <div className={styles.filterTabs} role="group" aria-label="SEO holati">
            {FILTERS.map((item) => (
              <button key={item.value} type="button" onClick={() => { setFilter(item.value); setChosen(new Set()); }} className={cn(filter === item.value && styles.filterActive)} aria-pressed={filter === item.value}>
                {item.label}<span>{filterCount(item.value)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchField}>
            <Search aria-hidden="true" />
            <Input value={query} onChange={(event) => { setQuery(event.target.value); setChosen(new Set()); }} placeholder="Tovar nomi bo'yicha qidiring" />
          </div>
          <label className={styles.sortField}>
            <span>Tartiblash</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOrder)}>
              <option value="opportunity">Eng katta imkoniyat</option>
              <option value="scoreAsc">Eng past ball</option>
              <option value="scoreDesc">Eng yuqori ball</option>
              <option value="name">Nom bo'yicha</option>
            </select>
            <ChevronDown aria-hidden="true" />
          </label>
          <Button variant="outline" onClick={() => setChosen(allVisibleSelected ? new Set() : new Set(visible.map((row) => row.productId)))}>
            {allVisibleSelected ? "Tanlovni bekor qilish" : "Natijalarni tanlash"}
          </Button>
          <Button onClick={() => analyse([...chosen])} disabled={busy || chosen.size === 0} className={styles.bulkButton}>
            {busy ? <Loader2 className="animate-spin" /> : <Wand2 />}
            {chosen.size > 0 ? `${chosen.size} tani tahlil qilish` : "Tahlil uchun tanlang"}
          </Button>
        </div>

        <div className={styles.listHeader} aria-hidden="true">
          <span>Tovar</span><span>SEO bali</span><span>Kalit so&apos;zlar</span><span>Imkoniyat</span><span>Holat</span><span />
        </div>

        <div className={styles.productList}>
          {visible.map((row, index) => (
            <SeoProductRow
              key={row.productId}
              row={row}
              selected={chosen.has(row.productId)}
              queued={queued.has(row.productId)}
              busy={busy}
              index={index}
              onToggle={() => toggle(row.productId)}
              onAnalyse={() => analyse([row.productId])}
            />
          ))}
        </div>

        {visible.length === 0 ? (
          <div className={styles.empty}>
            <span><Search aria-hidden="true" /></span>
            <h3>{rows.length === 0 ? "Katalog hozircha bo'sh" : "Tovar topilmadi"}</h3>
            <p>{rows.length === 0 ? "Avval Uzum do'koningizni sinxronlang." : "Qidiruv yoki status filtrini o'zgartirib ko'ring."}</p>
          </div>
        ) : null}
      </section>

      <details className={styles.explainer}>
        <summary><Info aria-hidden="true" /> “Qamrov” qanday hisoblanadi?<ChevronDown aria-hidden="true" /></summary>
        <p>Qamrov — so&apos;rovga chiqqan tovarlarning jami buyurtma va sharhlari asosidagi talab signali. Bu qidiruv chastotasi emas: Uzum bu ma&apos;lumotni tashqariga bermaydi.</p>
      </details>
    </div>
  );
}

function SummaryCard({ label, value, note, tone }: { label: string; value: string; note: string; tone?: "warning" | "danger" }) {
  return <article className={cn(styles.summaryCard, tone === "warning" && styles.warningCard, tone === "danger" && styles.dangerCard)}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function SeoProductRow({
  row,
  selected,
  queued,
  busy,
  index,
  onToggle,
  onAnalyse,
}: {
  row: SeoAuditRow;
  selected: boolean;
  queued: boolean;
  busy: boolean;
  index: number;
  onToggle: () => void;
  onAnalyse: () => void;
}) {
  const analysed = Boolean(row.analyzedAt);
  const keywordPercent = row.keywordsTotal > 0 ? Math.min(100, (row.keywordsUsed / row.keywordsTotal) * 100) : 0;
  const status = queued
    ? { label: "Navbatda", className: styles.statusQueued }
    : !analysed
      ? { label: "Audit qilinmagan", className: styles.statusPending }
      : (row.score ?? 0) >= 75
        ? { label: "Yaxshi", className: styles.statusGood }
        : (row.score ?? 0) >= 60
          ? { label: "Yaxshilash mumkin", className: styles.statusNeutral }
          : { label: "E'tibor kerak", className: styles.statusWarning };

  return (
    <article className={cn(styles.productRow, selected && styles.productSelected)} style={{ animationDelay: `${Math.min(index, 10) * 24}ms` }}>
      <div className={styles.productCell}>
        <button type="button" onClick={onToggle} className={cn(styles.checkbox, selected && styles.checkboxSelected)} aria-label={`${row.title} tovarini tanlash`} aria-pressed={selected}>
          {selected ? <Check aria-hidden="true" /> : null}
        </button>
        <div className={styles.productImage}>{row.image ? <img src={row.image} alt="" loading="lazy" /> : <Sparkles aria-hidden="true" />}</div>
        <div className={styles.productName}><Link href={`/seo/${row.productId}` as Route}>{row.title}</Link><span>Mahsulot #{row.productId}</span></div>
      </div>
      <div className={styles.scoreCell}><ScoreRing score={row.score} size={48} /><span>100 dan</span></div>
      <div className={styles.keywordCell}><div><strong>{row.keywordsUsed}/{row.keywordsTotal}</strong><span>ishlatilgan</span></div><div className={styles.keywordProgress}><span style={{ width: `${keywordPercent}%` }} /></div></div>
      <div className={styles.opportunityCell}><span>Boy berilmoqda</span><strong>{analysed ? formatNumber(row.coverageMissed) : "—"}</strong></div>
      <div className={styles.statusCell}><span className={status.className}>{queued ? <Loader2 className="animate-spin" /> : <span />}{status.label}</span>{row.analyzedAt ? <small>{formatAuditDate(row.analyzedAt)}</small> : null}</div>
      <div className={styles.rowAction}>
        {analysed ? (
          <Button variant="outline" asChild><Link href={`/seo/${row.productId}` as Route}>Ochish <ArrowRight /></Link></Button>
        ) : (
          <Button onClick={onAnalyse} disabled={busy || queued}><Wand2 /> Tahlil qilish</Button>
        )}
      </div>
    </article>
  );
}

function formatAuditDate(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
