"use client";

import * as React from "react";
import {
  Activity, ArrowDown, ArrowUp, HelpCircle, Loader2, Plus, Search, TrendingDown,
  TrendingUp, X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination, usePagination } from "@/components/ui/pagination";
import { CardHead, CardList, DataCard } from "@/components/dashboard/data-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError,
  addSeoPhrase,
  dropSeoPhrase,
  fetchSeoPositionTable,
  fetchSeoSuggestions,
  measureSeoPositions,
} from "@/lib/api";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { WhyDialog } from "@/features/seo/components/why-dialog";
import type {
  SeoPhraseSource, SeoPositionCell, SeoPositionTableRow, SeoPositionsTable,
} from "@/lib/types";

/** Nechanchi o'ringacha "yaxshi" hisoblanadi. */
const TOP = 10;
const PERIODS = [3, 30, 90] as const;
/** Fon vazifasi ketayotganda jadval shuncha vaqtda bir so'raladi. */
const POLL_MS = 3000;

type Tab = "visible" | "manual" | "all";

const SOURCE_LABEL: Record<SeoPhraseSource, string> = {
  manual: "siz qo'shgansiz",
  audit: "SEO tahlili",
  suggest: "Uzum taklifi",
  rival: "raqobatchilar nomidan",
  market: "bozordagi so'z",
  seed: "tovar nomidan",
  sibling: "do'kon tovarlaridan",
};

/**
 * Qidiruvdagi o'rin: qaysi so'z bilan izlaganda tovar nechanchi chiqadi.
 *
 * Ball — bashorat, o'rin — natija. Matnni o'zgartirgandan keyin
 * haqiqatan yuqoriga chiqdimi degan savolga faqat shu javob beradi.
 *
 * So'zlar ro'yxati TAXMIN emas: backend tovar nomi, Uzum takliflari va
 * raqobatchilar nomlaridan nomzodlarni o'zi topadi va har birini
 * o'lchaydi — jadvalda sukut bo'yicha tovar HAQIQATAN chiqqan so'zlar
 * turadi. Ilgari bu yerda SEO tahlili taxmin qilgan so'zlar edi va
 * ularning ko'pchiligida tovar umuman chiqmasdi ("сумку", "sumka"),
 * 4-o'rinda turgan «mini oyna» esa ro'yxatda yo'q edi.
 *
 * Uch holat uch xil chiziladi: raqam — topildi; `·` — o'lchandi, TOP-100
 * da yo'q; bo'sh katak — o'sha kuni o'lchov bo'lmagan. Ularni aralashtirish
 * tarixni yolg'on qiladi.
 */
export function PositionsBlock({ productId }: { productId: number }) {
  const [data, setData] = React.useState<SeoPositionsTable | null>(null);
  const [days, setDays] = React.useState<number>(30);
  const [loading, setLoading] = React.useState(true);
  /** Ruxsati yo'q (403) yoki eski backend — blok umuman ko'rsatilmaydi. */
  const [hidden, setHidden] = React.useState(false);
  const [starting, setStarting] = React.useState(false);
  const [phrase, setPhrase] = React.useState("");
  const [adding, setAdding] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<string[]>([]);
  const [tab, setTab] = React.useState<Tab | null>(null);
  const [query, setQuery] = React.useState("");
  /** "Nega pastdaman?" oynasi qaysi so'z uchun ochilgan. */
  const [why, setWhy] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      setData(await fetchSeoPositionTable(productId, days));
    } catch (err) {
      if (err instanceof ApiError && [403, 404, 405, 422].includes(err.status)) setHidden(true);
    } finally {
      setLoading(false);
    }
  }, [productId, days]);

  React.useEffect(() => {
    void load();
  }, [load]);

  /** Uzumning o'z takliflari — xaridor haqiqatan yozadigan so'rovlar. */
  const loadTips = React.useCallback(async () => {
    try {
      setTips(await fetchSeoSuggestions(productId));
    } catch {
      // Taklif — qulaylik. Yo'qligi qo'lda yozishga xalaqit bermaydi.
      setTips([]);
    }
  }, [productId]);

  React.useEffect(() => {
    void loadTips();
  }, [loadTips]);

  // Fonda o'lchov ketayotganda jadval so'rab turiladi. Tugagani
  // `running` true → false o'tishidan bilinadi (bir marta xabar).
  const running = Boolean(data?.job.running);
  const wasRunning = React.useRef(false);
  React.useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [running, load]);
  React.useEffect(() => {
    if (wasRunning.current && !running && data) {
      if (data.job.error) toast.error(data.job.error);
      else toast.success(`O'lchandi: tovar ${data.summary.visible} ta so'zda TOP-100 da`);
    }
    wasRunning.current = running;
  }, [running, data]);

  const measure = async () => {
    setStarting(true);
    try {
      setData(await measureSeoPositions(productId, days));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'lchovni boshlab bo'lmadi.");
    } finally {
      setStarting(false);
    }
  };

  const add = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setAdding(clean);
    try {
      setData(await addSeoPhrase(productId, clean, days));
      setPhrase("");
      setTab("manual");
      void loadTips();
      toast.success(`"${clean}" kuzatuvga qo'shildi`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Qo'shib bo'lmadi.");
    } finally {
      setAdding(null);
    }
  };

  const drop = async (text: string) => {
    try {
      setData(await dropSeoPhrase(productId, text, days));
      void loadTips();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Olib tashlanmadi.");
    }
  };

  const rows = data?.rows;
  const counts = React.useMemo(() => {
    const all = rows ?? [];
    return {
      visible: all.filter((r) => r.status === "visible").length,
      manual: all.filter((r) => r.manual).length,
      all: all.length,
    };
  }, [rows]);
  // Sukut: ko'ringan so'zlar bo'lsa — ular; bo'lmasa hammasi (bo'sh jadval
  // "hech narsa yo'q" deb o'qilmasin).
  const activeTab: Tab = tab ?? (counts.visible > 0 ? "visible" : "all");

  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (rows ?? []).filter((row) => {
      if (activeTab === "visible" && row.status !== "visible") return false;
      if (activeTab === "manual" && !row.manual) return false;
      return !needle || row.phrase.includes(needle);
    });
  }, [rows, activeTab, query]);

  const { page, setPage, pageItems } = usePagination(filtered, {
    param: "positions_page",
    resetKey: [activeTab, query, days],
  });

  if (loading || hidden || !data) return null;

  const { summary, job, calendar } = data;
  const progress = job.total ? Math.round((job.done / job.total) * 100) : 0;

  const adder = (
    <div className="space-y-2.5">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          void add(phrase);
        }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={phrase}
            onChange={(event) => setPhrase(event.target.value)}
            placeholder="O'z so'zingizni qo'shing — masalan: oq bolalar shim"
            className="pl-8"
            maxLength={120}
          />
        </div>
        <Button type="submit" disabled={!phrase.trim() || adding !== null} className="gap-1.5">
          {adding !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Qo&apos;shish
        </Button>
      </form>
      {tips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Uzum takliflari:</span>
          {tips.slice(0, 8).map((tip) => (
            <button
              key={tip}
              type="button"
              onClick={() => void add(tip)}
              disabled={adding !== null}
              className="rounded-full border px-2.5 py-1 text-xs transition-colors hover:bg-accent disabled:opacity-50"
            >
              {adding === tip ? "…" : tip}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">Qidiruvdagi o&apos;rin</CardTitle>
            <CardDescription>
              {summary.candidates === 0
                ? "Tovar qaysi so'zlarda chiqishini topish uchun “Hozir o'lchash” ni bosing."
                : `Tovar ${summary.visible} ta so'zda TOP-100 da · ${summary.candidates} ta so'z tekshirilgan. `}
              {summary.candidates > 0 && "Har kuni o'zi o'lchanadi."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Davr" className="inline-flex rounded-lg border p-0.5">
              {PERIODS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={days === value}
                  onClick={() => setDays(value)}
                  className={cn(
                    "min-h-8 rounded-md px-2.5 text-xs font-medium tabular-nums transition-colors",
                    days === value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {value} kun
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={measure}
              disabled={starting || running}
            >
              {starting || running ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Activity className="h-3.5 w-3.5" />
              )}
              {running
                ? job.stage === "discover" ? "So'zlar qidirilmoqda…" : `O'lchanmoqda ${progress}%`
                : "Hozir o'lchash"}
            </Button>
          </div>
        </div>
        {running && (
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${job.stage === "discover" ? 4 : Math.max(progress, 4)}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {summary.candidates > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="TOP-100 da" value={formatNumber(summary.visible)} note="so'z davrda" />
            <Stat label="TOP-10" value={formatNumber(summary.top10)} note="oxirgi o'lchov" tone={summary.top10 ? "ok" : undefined} />
            <Stat label="TOP-30" value={formatNumber(summary.top30)} note="oxirgi o'lchov" />
            <Stat
              label="O'rtacha o'rin"
              value={summary.avgPosition === null ? "—" : formatNumber(summary.avgPosition)}
              note="ko'ringan so'zlar"
            />
            <Stat label="Ko'tarildi" value={formatNumber(summary.improved)} note="oldingi o'lchovga" tone={summary.improved ? "ok" : undefined} />
            <Stat label="Tushdi" value={formatNumber(summary.worsened)} note="oldingi o'lchovga" tone={summary.worsened ? "bad" : undefined} />
          </div>
        )}

        {adder}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="tablist" aria-label="So'zlar" className="inline-flex flex-wrap gap-1">
            {([
              ["visible", "Chiqayotgan", counts.visible],
              ["manual", "Qo'shganlarim", counts.manual],
              ["all", "Hammasi", counts.all],
            ] as const).map(([key, label, count]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={activeTab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "min-h-9 rounded-lg px-3 text-sm transition-colors",
                  activeTab === key ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label} <span className="tabular-nums text-muted-foreground">{count}</span>
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="So'z bo'yicha qidirish"
              className="h-9 pl-8"
            />
          </div>
        </div>

        <Legend />

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            {activeTab === "manual"
              ? "Hali o'zingiz so'z qo'shmagansiz."
              : summary.candidates === 0
                ? "So'zlar hali tekshirilmagan."
                : "Bu davrda tovar TOP-100 da chiqqan so'z yo'q."}
          </p>
        ) : (
          <>
            <CardList>
              {pageItems.map((row) => (
                <MobileRow
                  key={row.phrase}
                  row={row}
                  calendar={calendar}
                  onWhy={() => setWhy(row.phrase)}
                  onDrop={() => void drop(row.phrase)}
                />
              ))}
            </CardList>

            <div className="hidden overflow-x-auto rounded-xl border md:block">
              <table className="w-max min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="sticky left-0 z-20 w-56 min-w-56 max-w-56 border-b bg-[var(--color-card)] px-3 py-2 font-medium">
                      Kalit so&apos;z
                    </th>
                    <th className="sticky left-56 z-20 w-20 min-w-20 max-w-20 border-b bg-[var(--color-card)] px-2 py-2 text-right font-medium" title="Birinchi 20 natijaning buyurtma va sharhlari — so'rov ortidagi xarid">
                      Talab
                    </th>
                    <th className="sticky left-[19rem] z-20 w-20 min-w-20 max-w-20 border-b border-r bg-[var(--color-card)] px-2 py-2 text-right font-medium" title="Davrda topilgan kunlar bo'yicha o'rtacha">
                      O&apos;rtacha
                    </th>
                    {calendar.map((day, index) => (
                      <th key={day} className="w-9 border-b px-0.5 py-1.5 text-center font-medium" title={formatDate(day)}>
                        <span className="block text-[11px] tabular-nums text-foreground">{day.slice(8)}</span>
                        <span className="block text-[9px] leading-none">
                          {index === 0 || day.endsWith("-01") ? formatDate(day).slice(3) : " "}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((row) => (
                    <DesktopRow
                      key={row.phrase}
                      row={row}
                      calendar={calendar}
                      onWhy={() => setWhy(row.phrase)}
                      onDrop={() => void drop(row.phrase)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <Pagination page={page} total={filtered.length} onPage={setPage} label="Kalit so'zlar sahifalari" />
        <p className="text-xs text-muted-foreground">
          {"O'rin — xaridor ko'radigan joy (reklama bilan birga). Katak ustiga bossangiz reklamasiz o'rin chiqadi. "}
          {"Tovar chiqqan so'zlar har kuni, chiqmaganlari siyrakroq tekshiriladi. "}
          {"Kun-ba-kun sotuv bilan birga — pastdagi “Kunlik tarix” jadvalida."}
        </p>

        <WhyDialog productId={productId} phrase={why} onOpenChange={(open) => !open && setWhy(null)} />
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone?: "ok" | "bad";
}) {
  return (
    <div className="rounded-xl border px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-lg font-semibold tabular-nums",
          tone === "ok" && "text-[color:var(--ok)]",
          tone === "bad" && "text-[color:var(--bad)]",
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground">{note}</p>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-sm bg-[color:var(--ok)]/20" />
        oldingi o&apos;lchovdan yuqoriga
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-sm bg-[color:var(--bad)]/20" />
        pastga
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block size-3 rounded-sm ring-1 ring-inset ring-violet-500" />
        Boost (reklama o&apos;rni)
      </span>
      <span>· — o&apos;lchandi, TOP-100 da yo&apos;q</span>
      <span>bo&apos;sh — o&apos;sha kuni o&apos;lchanmagan</span>
    </div>
  );
}

function cellTitle(cell: SeoPositionCell): string {
  const parts = [formatDate(cell.day)];
  if (cell.position === null) parts.push("TOP-100 da topilmadi");
  else {
    parts.push(`${cell.position}-o'rin`);
    if (cell.organic !== null && cell.organic !== cell.position) parts.push(`reklamasiz ${cell.organic}-o'rin`);
    if (cell.ad) parts.push("Boost (reklama)");
  }
  const move = {
    up: "oldingi o'lchovdan yuqoriga",
    down: "oldingi o'lchovdan pastga",
    new: "TOP-100 ga kirdi",
    lost: "TOP-100 dan chiqdi",
  } as const;
  if (cell.move) parts.push(move[cell.move]);
  return parts.join(" · ");
}

function PositionCell({ cell }: { cell: SeoPositionCell | undefined }) {
  if (!cell) return <td className="border-b px-0.5 py-1" />;
  const good = cell.move === "up" || cell.move === "new";
  const bad = cell.move === "down" || cell.move === "lost";
  return (
    <td className="border-b px-0.5 py-1 text-center" title={cellTitle(cell)}>
      <span
        className={cn(
          "inline-flex h-6 min-w-7 items-center justify-center rounded px-1 text-xs tabular-nums",
          good && "bg-[color:var(--ok)]/15",
          bad && "bg-[color:var(--bad)]/15",
          cell.ad && "ring-1 ring-inset ring-violet-500",
          cell.position === null
            ? "text-muted-foreground/50"
            : cell.position <= TOP
              ? "font-semibold text-foreground"
              : "text-foreground/80",
        )}
      >
        {cell.position ?? "·"}
      </span>
    </td>
  );
}

function PhraseName({
  row,
  onWhy,
  onDrop,
}: {
  row: SeoPositionTableRow;
  onWhy: () => void;
  onDrop: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <button
          type="button"
          onClick={onWhy}
          className="break-words text-left font-medium hover:underline"
          title="Nega shu o'rinda? — yetakchilar bilan solishtirish"
        >
          {row.phrase}
        </button>
        <p className="text-[11px] text-muted-foreground">
          {SOURCE_LABEL[row.source] ?? row.source}
          {row.bestEver !== null && ` · eng yaxshisi ${row.bestEver}`}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
        <a
          href={`https://uzum.uz/uz/search?query=${encodeURIComponent(row.phrase)}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Uzum'da ochish"
          className="text-muted-foreground/0 transition-colors group-hover:text-muted-foreground hover:!text-foreground"
        >
          <Search className="h-3.5 w-3.5" />
        </a>
        <button
          type="button"
          aria-label="Nega shu o'rinda?"
          onClick={onWhy}
          className="text-muted-foreground/0 transition-colors group-hover:text-muted-foreground hover:!text-foreground"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Kuzatuvdan chiqarish"
          onClick={onDrop}
          className="text-muted-foreground/0 transition-colors group-hover:text-muted-foreground hover:!text-destructive"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </span>
    </div>
  );
}

function StatusNote({ row }: { row: SeoPositionTableRow }) {
  if (row.status === "pending") return <>Hali o&apos;lchanmagan — navbatda</>;
  return (
    <>
      {`${row.lastCheckedOn ? formatDate(row.lastCheckedOn) : "—"} da tekshirildi — TOP-100 da yo'q`}
      {row.lastFoundOn && ` · oxirgi marta ${formatDate(row.lastFoundOn)} da chiqqan`}
    </>
  );
}

function DesktopRow({
  row,
  calendar,
  onWhy,
  onDrop,
}: {
  row: SeoPositionTableRow;
  calendar: string[];
  onWhy: () => void;
  onDrop: () => void;
}) {
  const byDay = new Map(row.cells.map((cell) => [cell.day, cell]));
  // `bg-card` KLASSI emas, uning rangi: tovar sahifasining CSS moduli
  // `.workspace .bg-card` ga 1rem radius beradi va u `.rounded-none` dan
  // kuchliroq (brauzerda o'lchandi) — sticky kataklar qutichaga aylanardi.
  const sticky = "sticky z-10 border-b bg-[var(--color-card)] group-hover:bg-muted";
  return (
    <tr className="group">
      <td className={cn(sticky, "left-0 w-56 min-w-56 max-w-56 px-3 py-1.5")}>
        <PhraseName row={row} onWhy={onWhy} onDrop={onDrop} />
      </td>
      <td
        className={cn(sticky, "left-56 w-20 min-w-20 max-w-20 px-2 py-1.5 text-right tabular-nums text-muted-foreground")}
        title={row.products !== null ? `Uzum'da ${formatNumber(row.products)} ta tovar` : undefined}
      >
        {row.demand === null ? "—" : formatNumber(row.demand)}
      </td>
      <td className={cn(sticky, "left-[19rem] w-20 min-w-20 max-w-20 border-r px-2 py-1.5 text-right")}>
        <span className="inline-flex items-center justify-end gap-1">
          <span className={cn("tabular-nums font-medium", row.avgPosition !== null && row.avgPosition <= TOP && "text-[color:var(--ok)]")}>
            {row.avgPosition === null ? "—" : formatNumber(row.avgPosition)}
          </span>
          {row.change !== null && row.change !== 0 && (
            row.change < 0 ? (
              <TrendingUp className="h-3 w-3 text-[color:var(--ok)]" aria-label="ko'tarildi" />
            ) : (
              <TrendingDown className="h-3 w-3 text-[color:var(--bad)]" aria-label="tushdi" />
            )
          )}
        </span>
      </td>
      {row.status === "visible" || row.cells.length > 0 ? (
        calendar.map((day) => <PositionCell key={day} cell={byDay.get(day)} />)
      ) : (
        <td colSpan={calendar.length} className="border-b px-3 py-1.5 text-xs text-muted-foreground">
          <StatusNote row={row} />
        </td>
      )}
    </tr>
  );
}

function MobileRow({
  row,
  calendar,
  onWhy,
  onDrop,
}: {
  row: SeoPositionTableRow;
  calendar: string[];
  onWhy: () => void;
  onDrop: () => void;
}) {
  const byDay = new Map(row.cells.map((cell) => [cell.day, cell]));
  // 390px ga 30 ta ustun sig'maydi — oxirgi 7 kun, eskisi chapda.
  const recent = calendar.slice(0, 7).reverse();
  return (
    <DataCard>
      <CardHead
        title={row.phrase}
        note={`${SOURCE_LABEL[row.source] ?? row.source}${row.demand !== null ? ` · talab ${formatNumber(row.demand)}` : ""}`}
        right={
          <span className="inline-flex items-center gap-1">
            <span
              className={cn(
                "text-lg font-semibold tabular-nums",
                row.current === null ? "text-muted-foreground" : row.current <= TOP && "text-[color:var(--ok)]",
              )}
            >
              {row.current ?? "—"}
            </span>
            {row.change !== null && row.change !== 0 && (
              row.change < 0 ? (
                <ArrowUp className="h-3.5 w-3.5 text-[color:var(--ok)]" aria-label="ko'tarildi" />
              ) : (
                <ArrowDown className="h-3.5 w-3.5 text-[color:var(--bad)]" aria-label="tushdi" />
              )
            )}
            <button type="button" aria-label="Nega shu o'rinda?" onClick={onWhy} className="ml-1 p-1 text-muted-foreground">
              <HelpCircle className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Kuzatuvdan chiqarish" onClick={onDrop} className="p-1 text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
          </span>
        }
      />
      {row.status === "visible" || row.cells.length > 0 ? (
        <div className="mt-3 flex items-end justify-between gap-1">
          {recent.map((day) => {
            const cell = byDay.get(day);
            return (
              <div key={day} className="flex-1 text-center" title={cell ? cellTitle(cell) : undefined}>
                <div
                  className={cn(
                    "mx-auto flex h-7 items-center justify-center rounded text-xs tabular-nums",
                    (cell?.move === "up" || cell?.move === "new") && "bg-[color:var(--ok)]/15",
                    (cell?.move === "down" || cell?.move === "lost") && "bg-[color:var(--bad)]/15",
                    cell?.ad && "ring-1 ring-inset ring-violet-500",
                    !cell || cell.position === null ? "text-muted-foreground/50" : "",
                  )}
                >
                  {cell ? cell.position ?? "·" : ""}
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground/70">{day.slice(8)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          <StatusNote row={row} />
        </p>
      )}
    </DataCard>
  );
}
