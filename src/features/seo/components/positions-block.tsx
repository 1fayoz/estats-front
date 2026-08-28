"use client";

import * as React from "react";
import { Activity, Loader2, Plus, Search, TrendingDown, TrendingUp, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHead, CardList, DataCard } from "@/components/dashboard/data-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ApiError,
  addSeoPhrase,
  dropSeoPhrase,
  fetchSeoPositions,
  fetchSeoSuggestions,
  trackSeoPositions,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SeoPositionRow } from "@/lib/types";

/** Nechanchi o'ringacha "yaxshi" hisoblanadi. */
const TOP = 10;

/**
 * Qidiruvdagi o'rin: qaysi so'z bilan izlaganda tovar nechanchi chiqadi.
 *
 * Ball — bashorat, o'rin — natija. Matnni o'zgartirgandan keyin
 * haqiqatan yuqoriga chiqdimi degan savolga faqat shu javob beradi.
 *
 * So'rovlar ro'yxati ikki manbadan: SEO tahlili topgan yadro va
 * sotuvchining o'zi yozgani. Ikkinchisi shuning uchun kerak — sotuvchi
 * o'z xaridorining qaysi so'z bilan izlashini ko'pincha tahlildan
 * yaxshiroq biladi, va u so'z tahlil yadrosiga tushmagan bo'lishi
 * mumkin.
 *
 * "Topilmadi" ATAYLAB bo'sh katak: uni nol yoki 999 qilib ko'rsatish
 * grafikda yolg'on ko'tarilish yoki tushish yasagan bo'lardi.
 */
export function PositionsBlock({ productId }: { productId: number }) {
  const [rows, setRows] = React.useState<SeoPositionRow[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  /** Ruxsati yo'q (403) — blok umuman ko'rsatilmaydi. */
  const [hidden, setHidden] = React.useState(false);
  const [phrase, setPhrase] = React.useState("");
  const [adding, setAdding] = React.useState<string | null>(null);
  const [tips, setTips] = React.useState<string[]>([]);

  React.useEffect(() => {
    fetchSeoPositions(productId)
      .then(setRows)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 403) setHidden(true);
      })
      .finally(() => setLoading(false));
  }, [productId]);

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

  const measure = async () => {
    setBusy(true);
    try {
      setRows(await trackSeoPositions(productId));
      toast.success("O'rinlar o'lchandi");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'lchanmadi.");
    } finally {
      setBusy(false);
    }
  };

  const add = async (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setAdding(clean);
    try {
      setRows(await addSeoPhrase(productId, clean));
      setPhrase("");
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
      setRows(await dropSeoPhrase(productId, text));
      void loadTips();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Olib tashlanmadi.");
    }
  };

  if (loading || hidden) return null;

  const days = [...new Set(rows.flatMap((r) => r.points.map((p) => p.day)))].sort().slice(-14);
  const inTop = rows.filter((r) => r.current !== null && r.current <= TOP).length;

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
            placeholder="Xaridor qaysi so'z bilan izlaydi? Masalan: oq bolalar shim"
            className="pl-8"
            maxLength={120}
          />
        </div>
        <Button type="submit" disabled={!phrase.trim() || adding !== null} className="gap-1.5">
          {adding !== null ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
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

  if (rows.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Qidiruvdagi o&apos;rin</CardTitle>
          <CardDescription>
            Qaysi so&apos;z bilan izlaganda tovaringiz nechanchi o&apos;rinda
            chiqishi. Bir marta qo&apos;shilgan so&apos;z keyin har kuni
            o&apos;zi o&apos;lchanadi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adder}
          <div className="flex items-center gap-2 border-t pt-4">
            <Button variant="outline" className="gap-1.5" onClick={measure} disabled={busy}>
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Activity className="h-4 w-4" />
              )}
              SEO tahlili topgan so&apos;zlarni o&apos;lchash
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Qidiruvdagi o&apos;rin</CardTitle>
            <CardDescription>
              {`${rows.length} ta kalit so'z kuzatilmoqda · TOP-${TOP} da ${inTop} tasi. `}
              Har kuni o&apos;zi o&apos;lchanadi.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={measure} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Activity className="h-3.5 w-3.5" />}
            Hozir o&apos;lchash
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {adder}

        {/* Telefonda: har so'rov — kartochka. Kunlar ustuni o'rniga
            oxirgi bir necha kunlik qator, chunki 30 ta ustun 390px ga
            hech qanday holda sig'maydi. */}
        <CardList>
          {rows.map((row) => {
            const byDay = new Map(row.points.map((p) => [p.day, p.position]));
            const recent = days.slice(-7);
            return (
              <DataCard key={row.phrase}>
                <CardHead
                  title={row.phrase}
                  note={row.measured ? `talab ${formatNumber(row.coverage)}` : "hali o'lchanmagan"}
                  right={
                    <span className="inline-flex items-center gap-1">
                      <span
                        className={cn(
                          "text-lg font-semibold tabular-nums",
                          row.current === null
                            ? "text-muted-foreground"
                            : row.current <= TOP
                              ? "text-emerald-600 dark:text-emerald-500"
                              : "",
                        )}
                      >
                        {row.current ?? "—"}
                      </span>
                      {row.change !== null && row.change !== 0 && (
                        row.change < 0 ? (
                          <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-500" />
                        ) : (
                          <TrendingDown className="h-3.5 w-3.5 text-destructive" />
                        )
                      )}
                      <button
                        type="button"
                        aria-label="Kuzatuvdan chiqarish"
                        onClick={() => void drop(row.phrase)}
                        className="ml-1 text-muted-foreground/60 transition-colors hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  }
                />
                {recent.length > 0 && (
                  <div className="mt-3 flex items-end gap-1.5 overflow-x-auto">
                    {recent.map((d) => {
                      const value = byDay.get(d);
                      return (
                        <div key={d} className="shrink-0 text-center">
                          <div
                            className={cn(
                              "text-xs tabular-nums",
                              value == null
                                ? "text-muted-foreground/40"
                                : value <= TOP
                                  ? "text-emerald-600 dark:text-emerald-500"
                                  : "text-muted-foreground",
                            )}
                          >
                            {value ?? "·"}
                          </div>
                          <div className="text-[10px] text-muted-foreground/60">{d.slice(8)}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </DataCard>
            );
          })}
        </CardList>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3 font-medium">Kalit so&apos;z</th>
                <th className="pb-2 pr-3 text-right font-medium">Talab</th>
                <th className="pb-2 pr-3 text-right font-medium">Hozir</th>
                {days.map((d) => (
                  <th key={d} className="pb-2 pr-1.5 text-right text-[10px] font-medium">
                    {d.slice(8)}
                  </th>
                ))}
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const byDay = new Map(row.points.map((p) => [p.day, p.position]));
                return (
                  <tr key={row.phrase} className="group border-b last:border-0">
                    <td className="py-2 pr-3 font-medium">{row.phrase}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-muted-foreground">
                      {row.measured ? formatNumber(row.coverage) : "—"}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className={cn(
                            "tabular-nums font-medium",
                            row.current === null
                              ? "text-muted-foreground"
                              : row.current <= TOP
                                ? "text-emerald-600 dark:text-emerald-500"
                                : "",
                          )}
                        >
                          {row.current ?? "—"}
                        </span>
                        {row.change !== null && row.change !== 0 && (
                          row.change < 0 ? (
                            <TrendingUp className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-destructive" />
                          )
                        )}
                      </span>
                    </td>
                    {days.map((d) => {
                      const value = byDay.get(d);
                      return (
                        <td
                          key={d}
                          className={cn(
                            "py-2 pr-1.5 text-right text-xs tabular-nums",
                            value == null
                              ? "text-muted-foreground/40"
                              : value <= TOP
                                ? "text-emerald-600 dark:text-emerald-500"
                                : "text-muted-foreground",
                          )}
                        >
                          {value ?? "·"}
                        </td>
                      );
                    })}
                    <td className="py-2 pl-2 text-right">
                      <button
                        type="button"
                        aria-label="Kuzatuvdan chiqarish"
                        onClick={() => void drop(row.phrase)}
                        className="text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60 hover:!text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted-foreground">
          {"Bo'sh katak — o'sha kuni birinchi 100 ta natija ichida topilmadi. "}
          {"Kichikroq raqam — yuqoriroq o'rin."}
        </p>
      </CardContent>
    </Card>
  );
}
