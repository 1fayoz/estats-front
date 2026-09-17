"use client";

import * as React from "react";
import { ArrowLeft, Check, Layers, Link2, Loader2, Package, Search } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, fetchProducts, linkStockGroup, mediaUrl } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WarehouseProduct } from "@/lib/types";

/**
 * «Bu tovar mana shular bilan aslida bitta» — sotuvchining O'Z qarori.
 *
 * Tizim hech narsa taklif qilmaydi va "o'xshash" deb saralamaydi
 * (foydalanuvchi talabi: tavsiya va ogohlantirish kerak emas — qaysi
 * e'lonlar bitta tovar ekanini sotuvchi o'zi biladi). Oddiy ro'yxat:
 * do'kondagi hamma kartochka, arxivdagilari ham, qidiruv bilan.
 *
 * Ikki qadam: avval bir yoki bir nechta kartochka belgilanadi (ikkita,
 * uchta — hammasi bitta tovar bo'ladi), keyin rang juftlari ko'rsatiladi.
 * Juft sukut bo'yicha rang NOMI bir xil bo'lsa to'ldiriladi — bu taklif
 * emas, shunchaki bir xil nom; noto'g'ri bo'lsa sotuvchi o'zgartiradi.
 */

interface Card {
  key: string;
  head: WarehouseProduct;
  variants: WarehouseProduct[];
  archived: boolean;
}

function cardKey(item: WarehouseProduct): string {
  return item.externalProductId ? `p:${item.externalProductId}` : `s:${item.id}`;
}

function groupCards(items: WarehouseProduct[], archivedIds: Set<number>): Card[] {
  const map = new Map<string, WarehouseProduct[]>();
  for (const item of items) {
    // SKU'siz o'rinbosar qator — unda sotuv ham, rang ham yo'q.
    if (item.externalSkuId?.startsWith("card:")) continue;
    const key = cardKey(item);
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return [...map.entries()]
    .map(([key, variants]) => {
      const sorted = [...variants].sort((a, b) => a.id - b.id);
      return { key, head: sorted[0], variants: sorted, archived: sorted.every((v) => archivedIds.has(v.id)) };
    })
    .sort((a, b) => Number(a.archived) - Number(b.archived) || a.head.title.localeCompare(b.head.title));
}

function variantKey(item: WarehouseProduct): string {
  return (item.variantName ?? "").toLowerCase().replace(/[ʻʼ'‘’`]/g, "").replace(/\s+/g, " ").trim();
}

/** Mening variantim id → shu kartochkaning varianti id (0 — bog'lanmaydi). */
function defaultPairs(mine: WarehouseProduct[], other: WarehouseProduct[]): Record<number, number> {
  const out: Record<number, number> = {};
  if (mine.length === 1 && other.length === 1) {
    out[mine[0].id] = other[0].id;
    return out;
  }
  const used = new Set<number>();
  for (const variant of mine) {
    const match = other.find((o) => !used.has(o.id) && variantKey(o) === variantKey(variant));
    out[variant.id] = match ? match.id : 0;
    if (match) used.add(match.id);
  }
  return out;
}

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
  const [items, setItems] = React.useState<WarehouseProduct[]>([]);
  // Mahsulot javobida arxiv belgisi yo'q — qaysi ro'yxatdan kelgani bo'yicha.
  const [archivedIds, setArchivedIds] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [step, setStep] = React.useState<"pick" | "pairs">("pick");
  /** kartochka kaliti → (mening variantim → uning varianti). */
  const [pairs, setPairs] = React.useState<Record<string, Record<number, number>>>({});
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected([]);
      setStep("pick");
      setPairs({});
      return;
    }
    let cancelled = false;
    setLoading(true);
    // Arxivdagilar ham kerak: eski, bloklanib arxivga tushgan nusxa ko'pincha
    // aynan o'sha tovarning birinchi e'loni bo'ladi.
    Promise.all([
      fetchProducts({ size: 500, sync: false }),
      fetchProducts({ size: 500, sync: false, archived: true }),
    ])
      .then(([active, archived]) => {
        if (cancelled) return;
        setItems([...active.results, ...archived.results]);
        setArchivedIds(new Set(archived.results.map((item) => item.id)));
      })
      .catch((reason) => {
        if (!cancelled) toast.error(reason instanceof ApiError ? reason.message : "Tovarlarni yuklab bo'lmadi.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [open]);

  const cards = React.useMemo(() => groupCards(items, archivedIds), [items, archivedIds]);
  const current = items.find((item) => item.id === productId) ?? null;
  const mine = current ? cards.find((card) => card.key === cardKey(current)) ?? null : null;

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((card) => {
      if (mine && card.key === mine.key) return false;
      if (!q) return true;
      return card.variants.some((v) =>
        [v.title, v.skuCode, v.barcode, v.externalProductId, v.variantName]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(q)),
      );
    });
  }, [cards, mine, query]);

  const chosen = selected
    .map((key) => cards.find((card) => card.key === key))
    .filter((card): card is Card => Boolean(card));

  const toggle = (key: string) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const goPairs = () => {
    if (!mine) return;
    const next: Record<string, Record<number, number>> = {};
    for (const card of chosen) next[card.key] = pairs[card.key] ?? defaultPairs(mine.variants, card.variants);
    setPairs(next);
    setStep("pairs");
  };

  const flat = chosen.flatMap((card) =>
    Object.entries(pairs[card.key] ?? {})
      .filter(([, other]) => other > 0)
      .map(([mineId, other]) => [Number(mineId), other]),
  );
  // Bitta kartochkaning bir varianti ikki marta tanlanmasin.
  const clash = chosen.some((card) => {
    const values = Object.values(pairs[card.key] ?? {}).filter((v) => v > 0);
    return new Set(values).size !== values.length;
  });

  const submit = async () => {
    if (!flat.length) {
      toast.error("Kamida bitta rangni juftlang.");
      return;
    }
    if (clash) {
      toast.error("Bitta variantni ikki marta tanlab bo'lmaydi.");
      return;
    }
    setSaving(true);
    try {
      await linkStockGroup(flat);
      toast.success(`${chosen.length + 1} ta e'lon bitta tovar deb belgilandi — kirim va qoldiq endi umumiy`);
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
            {step === "pick"
              ? "Shu tovar bilan aslida bitta bo'lgan e'lonlarni belgilang — bittasini ham, bir nechtasini ham. Kirim va qoldiq umumiy bo'ladi, statistika alohida qoladi."
              : "Qaysi rang qaysi rang bilan bir xil ekanini tekshiring."}
          </DialogDescription>
        </DialogHeader>

        {!loading && items.length > 0 && !mine ? (
          <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
            Bu tovar katalogda topilmadi — sahifani yangilab qayta urinib ko&apos;ring.
          </p>
        ) : loading || !mine ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : step === "pick" ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nomi, SKU, barkod yoki Uzum ID bo'yicha qidirish…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="h-11 rounded-xl pl-9 text-base sm:text-sm"
                aria-label="Tovarlarni qidirish"
              />
            </div>
            <div className="max-h-[50dvh] space-y-2 overflow-y-auto pr-1">
              {visible.length === 0 ? (
                <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
                  Bunday tovar topilmadi.
                </p>
              ) : (
                visible.map((card) => {
                  const active = selected.includes(card.key);
                  return (
                    <button
                      key={card.key}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggle(card.key)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/40",
                        active && "border-primary/50 bg-primary/5",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-md border",
                          active && "border-primary bg-primary text-primary-foreground",
                        )}
                      >
                        {active && <Check className="size-3.5" />}
                      </span>
                      <CardRow card={card} />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setStep("pick")}>
              <ArrowLeft className="h-3.5 w-3.5" /> Tanlovga qaytish
            </Button>
            {chosen.map((card) => (
              <div key={card.key} className="space-y-2 rounded-xl border p-3">
                <CardRow card={card} />
                {mine.variants.map((variant) => (
                  <div key={variant.id} className="flex flex-wrap items-center gap-2 border-t pt-2">
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="font-medium">{variant.variantName || "Yagona variant"}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{variant.skuCode ?? ""}</span>
                    </span>
                    <span aria-hidden className="text-muted-foreground">↔</span>
                    <select
                      aria-label={`${variant.variantName || "Variant"} uchun juft`}
                      className="h-11 min-w-44 rounded-xl border bg-background px-3 text-sm"
                      value={pairs[card.key]?.[variant.id] ?? 0}
                      onChange={(event) =>
                        setPairs((prev) => ({
                          ...prev,
                          [card.key]: { ...prev[card.key], [variant.id]: Number(event.target.value) },
                        }))
                      }
                    >
                      <option value={0}>— bog&apos;lanmaydi —</option>
                      {card.variants.map((other) => (
                        <option key={other.id} value={other.id}>
                          {other.variantName || other.skuCode || `#${other.id}`}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        <DialogFooter className="items-center border-t pt-4">
          {step === "pick" && selected.length > 0 && (
            <span className="mr-auto text-xs text-muted-foreground">
              {`${selected.length} ta e'lon tanlandi`}
            </span>
          )}
          <Button variant="outline" className="h-11 rounded-xl" disabled={saving} onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          {step === "pick" ? (
            <Button className="h-11 rounded-xl" disabled={!selected.length || !mine} onClick={goPairs}>
              Davom etish
            </Button>
          ) : (
            <Button className="h-11 gap-2 rounded-xl" disabled={saving || !flat.length} onClick={() => void submit()}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              Bir xil tovar deb belgilash
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CardRow({ card }: { card: Card }) {
  const prices = card.variants.map((v) => v.marketplacePrice).filter((p): p is number => p != null && p > 0);
  const price = prices.length
    ? Math.min(...prices) === Math.max(...prices)
      ? formatSum(prices[0])
      : `${formatSum(Math.min(...prices))} – ${formatSum(Math.max(...prices))}`
    : "—";
  const sold = card.variants.reduce((sum, v) => sum + (v.totalSoldQuantity || 0), 0);
  const grouped = card.variants.some((v) => v.stockGroupId != null);
  const meta = [
    card.head.externalProductId ? `Uzum ${card.head.externalProductId}` : card.head.skuCode,
    price,
    `${formatNumber(sold)} dona sotilgan`,
    card.variants.length > 1 ? card.variants.map((v) => v.variantName).filter(Boolean).join(", ") : card.head.variantName,
  ].filter(Boolean);
  return (
    <span className="flex min-w-0 flex-1 items-center gap-3">
      {card.head.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={mediaUrl(card.head.image)} alt="" loading="lazy" className="size-12 shrink-0 rounded-lg border object-cover" />
      ) : (
        <span className="grid size-12 shrink-0 place-items-center rounded-lg border bg-muted">
          <Package className="size-5 text-muted-foreground" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="line-clamp-2 text-sm font-medium">{card.head.title}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{meta.join(" · ")}</span>
        {(card.archived || grouped) && (
          <span className="mt-1.5 flex flex-wrap gap-1.5">
            {card.archived && <Badge variant="secondary">arxiv</Badge>}
            {grouped && <Badge variant="outline">guruhda</Badge>}
          </span>
        )}
      </span>
    </span>
  );
}
