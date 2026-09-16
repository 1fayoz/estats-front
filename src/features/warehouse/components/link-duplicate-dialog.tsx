"use client";

import * as React from "react";
import { ArrowLeft, Layers, Link2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, fetchProductDuplicates, linkStockGroup, mediaUrl } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DuplicateCard, DuplicateSuggestion } from "@/lib/types";

/**
 * «Bu tovarni boshqa e'lon bilan bir xil deb belgilash».
 *
 * Ikki qadam ATAYLAB: avval KARTOCHKA tanlanadi (sotuvchi Uzum'da aynan
 * shuni ko'radi), keyin variantlar juftlanadi. Rang bo'yicha juftlash
 * sukut bilan to'ldiriladi, lekin har doim ko'rinib turadi va
 * o'zgartirsa bo'ladi: "Qora" ni "Oq" bilan bog'lash — ombor
 * hisobini jimgina buzadigan xato, uni ko'rmasdan qilib bo'lmasligi kerak.
 */
export function LinkDuplicateDialog({
  productId,
  open,
  onOpenChange,
  onLinked,
}: {
  productId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked: () => void;
}) {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<DuplicateSuggestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [picked, setPicked] = React.useState<DuplicateSuggestion | null>(null);
  /** Mening variantim id → tanlangan kartochkaning varianti id (0 — bog'lanmaydi). */
  const [pairs, setPairs] = React.useState<Record<number, number>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setPicked(null);
      setRows([]);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open || productId == null) return;
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(() => {
      fetchProductDuplicates(productId, query.trim() || undefined)
        .then((found) => !cancelled && setRows(found))
        .catch(() => !cancelled && setRows([]))
        .finally(() => !cancelled && setLoading(false));
    }, query ? 350 : 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, productId, query]);

  const choose = (row: DuplicateSuggestion) => {
    const initial: Record<number, number> = {};
    for (const variant of row.a.variants) {
      const match = row.pairs.find(([mine]) => mine === variant.id);
      initial[variant.id] = match ? match[1] : 0;
    }
    // Ikkalasida bittadan variant bo'lsa — tanlashga hojat yo'q.
    if (row.a.variants.length === 1 && row.b.variants.length === 1) {
      initial[row.a.variants[0].id] = row.b.variants[0].id;
    }
    setPairs(initial);
    setPicked(row);
  };

  const selected = Object.entries(pairs).filter(([, other]) => other > 0);
  const duplicated = new Set<number>();
  const clashing = selected.some(([, other]) => {
    if (duplicated.has(other)) return true;
    duplicated.add(other);
    return false;
  });

  const submit = async () => {
    if (!selected.length) {
      toast.error("Kamida bitta variantni juftlang.");
      return;
    }
    if (clashing) {
      toast.error("Bitta variantni ikki marta tanlab bo'lmaydi.");
      return;
    }
    setSaving(true);
    try {
      await linkStockGroup(selected.map(([mine, other]) => [Number(mine), other]));
      toast.success("Bir xil tovar deb belgilandi — ombor va kirim endi umumiy");
      onLinked();
      onOpenChange(false);
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "Bog'lab bo'lmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-2xl p-5 sm:p-6">
        <DialogHeader>
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Layers className="h-5 w-5" />
          </span>
          <DialogTitle className="pr-8">Bir xil tovar deb belgilash</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Shu tovarni Uzum&apos;da ikkinchi marta qo&apos;ygan bo&apos;lsangiz, ikkala
            e&apos;lonni bog&apos;lang: kirim va qoldiq umumiy bo&apos;ladi, statistika esa
            alohida qoladi.
          </DialogDescription>
        </DialogHeader>

        {picked ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setPicked(null)}>
              <ArrowLeft className="h-3.5 w-3.5" /> Boshqa e&apos;lon tanlash
            </Button>

            <CardSummary card={picked.b} reasons={picked.reasons} score={picked.score} />

            <div className="space-y-2">
              <p className="text-sm font-medium">Qaysi variant qaysi bilan bir xil?</p>
              {picked.a.variants.map((mine) => (
                <div key={mine.id} className="flex flex-wrap items-center gap-2 rounded-xl border p-3">
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-medium">{mine.variantName || "Yagona variant"}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{mine.skuCode ?? ""}</span>
                  </span>
                  <span aria-hidden className="text-muted-foreground">↔</span>
                  <select
                    aria-label={`${mine.variantName || "Variant"} uchun juft`}
                    className="h-11 min-w-44 rounded-xl border bg-background px-3 text-sm"
                    value={pairs[mine.id] ?? 0}
                    onChange={(event) =>
                      setPairs((prev) => ({ ...prev, [mine.id]: Number(event.target.value) }))
                    }
                  >
                    <option value={0}>— bog&apos;lanmaydi —</option>
                    {picked.b.variants.map((other) => (
                      <option key={other.id} value={other.id}>
                        {other.variantName || other.skuCode || `#${other.id}`}
                        {other.stockGroupId ? " (guruhda)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tovar nomi, SKU yoki barkod bo'yicha qidirish…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 rounded-xl pl-9 text-base sm:text-sm"
                aria-label="E'lonlarni qidirish"
              />
            </div>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                {query
                  ? "Bunday e'lon topilmadi."
                  : "O'xshash e'lon topilmadi. Nomi bilan qidirib ko'ring — arxivdagi eski kartochkalar ham chiqadi."}
              </p>
            ) : (
              rows.map((row) => (
                <button
                  key={row.b.externalProductId ?? row.b.variants[0]?.id}
                  type="button"
                  onClick={() => choose(row)}
                  disabled={row.alreadyLinked}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-60",
                  )}
                >
                  <CardSummary card={row.b} reasons={row.reasons} score={row.score} linked={row.alreadyLinked} />
                </button>
              ))
            )}
          </div>
        )}

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" className="h-11 rounded-xl" disabled={saving} onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          {picked && (
            <Button className="h-11 gap-2 rounded-xl" disabled={saving} onClick={() => void submit()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Bir xil tovar deb belgilash
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function CardSummary({
  card,
  reasons,
  score,
  linked,
}: {
  card: DuplicateCard;
  reasons?: string[];
  score?: number;
  linked?: boolean;
}) {
  const price =
    card.priceMin && card.priceMax
      ? card.priceMin === card.priceMax
        ? formatSum(card.priceMin)
        : `${formatSum(card.priceMin)} – ${formatSum(card.priceMax)}`
      : "—";
  return (
    <div className="flex min-w-0 items-start gap-3">
      {card.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mediaUrl(card.image)}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg border object-cover"
          loading="lazy"
        />
      ) : (
        <div className="h-14 w-14 shrink-0 rounded-lg border bg-muted" />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium">{card.title}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {card.externalProductId && <span>Uzum {card.externalProductId}</span>}
          <span>· {price}</span>
          <span>· {formatNumber(card.totalSoldQuantity)} dona sotilgan</span>
          {card.variants.length > 1 && <span>· {card.variants.length} variant</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {card.isArchived && <Badge variant="secondary">arxiv</Badge>}
          {card.isBlocked && <Badge variant="destructive">bloklangan</Badge>}
          {linked && <Badge variant="outline">allaqachon bog&apos;langan</Badge>}
          {score !== undefined && score > 0 && (
            <Badge variant="outline">o&apos;xshashlik {Math.round(score * 100)}%</Badge>
          )}
          {(reasons ?? []).map((reason) => (
            <span key={reason} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
              {reason}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
