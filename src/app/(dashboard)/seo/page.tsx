"use client";

import * as React from "react";
import Link from "next/link";
import type { Route } from "next";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Search, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreRing } from "@/features/seo/components/score-ring";
import { ApiError, fetchAiKey, fetchSeoList, runSeoAnalyse } from "@/lib/api";
import { formatNumber } from "@/lib/format";
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
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(true);

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

  const analyse = async (productId: number) => {
    setBusy(productId);
    try {
      await runSeoAnalyse(productId);
      await load();
      toast.success("Tahlil tayyor");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Tahlil qilinmadi.");
    } finally {
      setBusy(null);
    }
  };

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

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tovar qidirish…"
          className="pl-8"
        />
      </div>

      <div className="space-y-2">
        {visible.map((row, i) => (
          <motion.div
            key={row.productId}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: Math.min(i, 12) * 0.02 }}
            className="flex flex-wrap items-center gap-3 rounded-lg border p-3"
          >
            <ScoreRing score={row.score} size={52} />

            {row.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.image} alt="" className="h-12 w-12 shrink-0 rounded-md border object-cover" />
            ) : (
              <div className="h-12 w-12 shrink-0 rounded-md border bg-muted" />
            )}

            <div className="min-w-0 flex-1">
              <Link
                href={`/seo/${row.productId}` as Route}
                className="block truncate text-sm font-medium hover:underline"
              >
                {row.title}
              </Link>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {row.analyzedAt ? (
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

            {row.analyzedAt ? (
              <Link href={`/seo/${row.productId}` as Route}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  Ochish <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <Button
                size="sm"
                className="gap-1.5"
                onClick={() => analyse(row.productId)}
                disabled={busy !== null}
              >
                {busy === row.productId ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )}
                Tahlil qilish
              </Button>
            )}
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
