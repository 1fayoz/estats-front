"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowRight, Check, Loader2, Search, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/features/seo/components/score-ring";
import { ApiError, fetchAiKey, fetchSeoList, runSeoBulk } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { queuedProductIds, useSeoJobStore } from "@/stores/seo-job-store";
import { useQueryState } from "@/lib/use-query-state";
import { cn } from "@/lib/utils";
import type { AiKeyState, SeoAuditRow } from "@/lib/types";

/**
 * Katalogdagi hamma tovarning SEO holati.
 *
 * Tovarni qo'lda kiritish YO'Q: ro'yxat Uzum'dan kelgan katalogdan
 * chiqadi. Sotuvchi faqat qaysi tovarni tahlil qilishni tanlaydi.
 */
export default function SeoPage() {
  const [rows, setRows] = React.useState<SeoAuditRow[]>([]);
  const [aiKey, setAiKey] = React.useState<AiKeyState | null>(null);
  const [query, setQuery] = useQueryState("q", "");
  const [chosen, setChosen] = React.useState<Set<number>>(new Set());
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const put = useSeoJobStore((s) => s.put);
  const jobs = useSeoJobStore((s) => s.jobs);
  const queued = React.useMemo(() => queuedProductIds(jobs), [jobs]);
  const running = jobs.find((j) => j.active) ?? null;

  const load = React.useCallback(async () => {
    try {
      const [list, ai] = await Promise.all([
        fetchSeoList(),
        fetchAiKey().catch(() => null),
      ]);
      setRows(list);
      setAiKey(ai);
    } catch {
      /* qisman yuklansa ham sahifa ishlashi kerak */
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void load();
  }, [load]);
  // Vazifa tugagach ro'yxatni bir marta yangilaymiz: ballar o'zgargan.
  const activeCount = jobs.filter((j) => j.active).length;
  const previous = React.useRef(activeCount);
  React.useEffect(() => {
    if (previous.current > 0 && activeCount === 0) void load();
    previous.current = activeCount;
  }, [activeCount, load]);

  const analyse = async (ids: number[]) => {
    if (ids.length === 0) return;
    setBusy(true);
    try {
      put(await runSeoBulk({ productIds: ids }));
      setChosen(new Set());
      toast.success(`${ids.length} ta tovar navbatga qo'yildi`, {
        description: "Kutib turish shart emas — boshqa bo'limga o'tsangiz ham davom etadi.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Navbatga qo'yilmadi.");
    } finally {
      setBusy(false);
    }
  };

  const toggle = (id: number) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const visible = rows.filter((r) =>
    r.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const done = rows.filter((r) => r.score !== null);
  const average = done.length
    ? Math.round(done.reduce((sum, r) => sum + (r.score ?? 0), 0) / done.length)
    : null;
  const missed = done.reduce((sum, r) => sum + r.coverageMissed, 0);
  const worst = [...done].sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO audit"
        description="Kartochkangiz qidiruvda topiladimi va qancha talab qo'ldan ketyapti"
        actions={
          !aiKey?.configured && (
            <Link href={"/integrations" as Route}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Sparkles className="h-3.5 w-3.5" /> AI kalitini ulash
              </Button>
            </Link>
          )
        }
      />

      {done.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-xl border p-4">
            <ScoreRing score={average} size={64} />
            <div className="min-w-0">
              <div className="text-xs text-muted-foreground">O&apos;rtacha ball</div>
              <div className="text-sm">{`${done.length} / ${rows.length} tovar tahlil qilingan`}</div>
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Qo&apos;ldan ketayotgan talab</div>
            <div className="mt-1 text-2xl font-bold tabular-nums text-destructive">
              {formatNumber(missed)}
            </div>
            <div className="text-xs text-muted-foreground">
              ishlatilmagan kalit so&apos;zlar ortidagi savdo
            </div>
          </div>
          <div className="rounded-xl border p-4">
            <div className="text-xs text-muted-foreground">Eng past ball</div>
            {worst && (
              <>
                <Link
                  href={`/seo/${worst.productId}` as Route}
                  className="mt-1 block truncate text-sm font-medium hover:underline"
                >
                  {worst.title}
                </Link>
                <div className="text-xs text-muted-foreground">{`${worst.score} ball`}</div>
              </>
            )}
          </div>
        </div>
      )}

      {running && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3 text-sm">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
          <span className="min-w-0 flex-1">
            {`Tahlil ketmoqda: ${running.done + running.failed}/${running.total}`}
            {running.failed > 0 && (
              <span className="text-destructive">{` · ${running.failed} xato`}</span>
            )}
          </span>
          <span className="text-xs text-muted-foreground">
            Kutib turish shart emas — boshqa bo&apos;limga o&apos;tsangiz ham davom etadi.
          </span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tovar qidirish…"
            className="pl-8"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setChosen(
              chosen.size === visible.length
                ? new Set()
                : new Set(visible.map((r) => r.productId)),
            )
          }
        >
          {chosen.size === visible.length && visible.length > 0
            ? "Bekor qilish"
            : "Hammasini tanlash"}
        </Button>

        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => analyse([...chosen])}
          disabled={busy || chosen.size === 0}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5" />}
          {chosen.size > 0 ? `${chosen.size} tani tahlil qilish` : "Tanlanganini tahlil qilish"}
        </Button>
      </div>

      <div className="space-y-2">
        {visible.map((row, i) => (
          <motion.div
            key={row.productId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 12) * 0.02 }}
            className={cn(
              "flex flex-wrap items-center gap-3 rounded-lg border p-3 transition-colors",
              chosen.has(row.productId) && "border-primary bg-primary/5",
            )}
          >
            <button
              type="button"
              onClick={() => toggle(row.productId)}
              aria-label="Tanlash"
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                chosen.has(row.productId)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "hover:bg-accent",
              )}
            >
              {chosen.has(row.productId) && <Check className="h-3.5 w-3.5" />}
            </button>

            <ScoreRing score={row.score} size={52} />

            {row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.image} alt="" className="h-12 w-12 shrink-0 rounded-md border object-cover" />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-md border bg-muted" />
            )}

            {/* `basis-40`: telefonda matnga o'z joyi qoladi va tugma
                pastdagi qatorga o'tadi. Aks holda nom "Ayollar so…"
                bo'lib qisqarib, izohi to'rt qatorga cho'zilardi. */}
            <div className="min-w-0 flex-1 basis-40">
              <Link
                href={`/seo/${row.productId}` as Route}
                className="line-clamp-2 text-sm font-medium hover:underline md:block md:truncate"
              >
                {row.title}
              </Link>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {queued.has(row.productId) ? (
                  <span className="inline-flex items-center gap-1 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" /> navbatda…
                  </span>
                ) : row.analyzedAt ? (
                  <>
                    {`${row.keywordsUsed}/${row.keywordsTotal} kalit so'z ishlatilgan`}
                    {row.coverageMissed > 0 && (
                      <span className="text-destructive">
                        {` · ${formatNumber(row.coverageMissed)} qo'ldan ketyapti`}
                      </span>
                    )}
                  </>
                ) : (
                  "Hali tahlil qilinmagan"
                )}
              </div>
            </div>

            <div className="w-full sm:w-auto">
              {row.analyzedAt ? (
                <Link href={`/seo/${row.productId}` as Route} className="block">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 sm:w-auto">
                    Ochish <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="sm"
                  className="w-full gap-1.5 sm:w-auto"
                  onClick={() => analyse([row.productId])}
                  disabled={busy || queued.has(row.productId)}
                >
                  <Wand2 className="h-3.5 w-3.5" /> Tahlil qilish
                </Button>
              )}
            </div>
          </motion.div>
        ))}

        {visible.length === 0 && (
          <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            {rows.length === 0
              ? "Katalogda tovar yo'q — avval Uzum bilan sinxronlang."
              : "Bunday tovar topilmadi."}
          </p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        <Badge variant="secondary">Qamrov</Badge>
        {" — so'rov ortidagi talab: shu so'rovga chiqqan tovarlarning jami buyurtma va "}
        {"sharhlari. Sharh sotuvning izi — uni faqat sotib olgan odam qoldiradi. Tovarlar "}
        {"SONI bunga kirmaydi, u alohida ustunda: u raqobat zichligini bildiradi. Bu "}
        {"so'rovlar CHASTOTASI emas — uni Uzum tashqariga bermaydi."}
      </p>
    </div>
  );
}
