"use client";

import * as React from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, Link2, Loader2, Package, Search } from "lucide-react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, fetchProducts } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { LinkedProduct, WarehouseProduct } from "@/lib/types";
import styles from "./post-card.module.css";

export function ProductLinkPicker({
  caption,
  linkedProducts,
  onOpenChange,
  onSaved,
  onSave,
}: {
  caption: string | null;
  linkedProducts: LinkedProduct[];
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onSave: (productIds: number[]) => Promise<unknown>;
}) {
  const [products, setProducts] = React.useState<WarehouseProduct[]>([]);
  const [query, setQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [pages, setPages] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [retry, setRetry] = React.useState(0);
  const [chosen, setChosen] = React.useState<Set<number>>(() => new Set());
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const savingRef = React.useRef(false);
  const mountedRef = React.useRef(false);
  const restoreFocusRef = React.useRef<HTMLElement | null>(null);
  const searchId = React.useId();

  React.useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setProducts([]);
    const timer = window.setTimeout(() => {
      fetchProducts({ search: query.trim() || undefined, page, size: 24 })
        .then((response) => {
          if (!active) return;
          setProducts(response.results);
          setPages(response.pages);
          setCount(response.count);
        })
        .catch((reason: unknown) => {
          if (!active) return;
          setError(reason instanceof ApiError ? reason.message : "Tovarlar yuklanmadi. Qayta urinib ko‘ring.");
        })
        .finally(() => { if (active) setLoading(false); });
    }, query.trim() ? 300 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, page, retry]);

  const linked = new Set(linkedProducts.map((product) => product.id));
  const chosenIds = [...chosen].filter((productId) => !linked.has(productId));

  const close = (open: boolean) => { if (!savingRef.current) onOpenChange(open); };
  const toggle = (productId: number) => {
    if (savingRef.current || linked.has(productId)) return;
    setChosen((previous) => {
      const next = new Set(previous);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const submit = async () => {
    if (savingRef.current || chosenIds.length === 0) return;
    savingRef.current = true;
    setSaving(true);
    try {
      await onSave(chosenIds);
      if (!mountedRef.current) return;
      toast.success(`${chosenIds.length} ta tovar bog‘landi.`);
      onSaved();
      onOpenChange(false);
    } catch (reason) {
      if (mountedRef.current) toast.error(reason instanceof ApiError ? reason.message : "Tovarlar bog‘lanmadi. Qayta urinib ko‘ring.");
    } finally {
      savingRef.current = false;
      if (mountedRef.current) setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={close}>
      <DialogContent
        className={cn(styles.picker, "w-[calc(100%-2rem)] rounded-2xl p-5 sm:max-w-xl sm:p-6 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center", saving && "[&>button]:hidden")}
        aria-busy={saving}
        onOpenAutoFocus={() => { if (document.activeElement instanceof HTMLElement) restoreFocusRef.current = document.activeElement; }}
        onCloseAutoFocus={(event) => { event.preventDefault(); restoreFocusRef.current?.focus(); }}
        onEscapeKeyDown={(event) => { if (savingRef.current) event.preventDefault(); }}
        onPointerDownOutside={(event) => { if (savingRef.current) event.preventDefault(); }}
      >
        <DialogHeader className="shrink-0">
          <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Link2 className="size-5" aria-hidden="true" /></span>
          <DialogTitle className="pr-8">E’longa tovar bog‘lash</DialogTitle>
          <DialogDescription className="leading-relaxed">Bir yoki bir nechta tovarni tanlang. E’lon natijalari ularning sahifasida ham ko‘rinadi.</DialogDescription>
          {caption && <p className="mt-2 line-clamp-2 rounded-xl bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{caption}</p>}
        </DialogHeader>

        <div className="relative shrink-0">
          <label htmlFor={searchId} className="sr-only">Tovar nomi yoki SKU bo‘yicha qidirish</label>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id={searchId} placeholder="Tovar nomi yoki SKU" value={query} disabled={saving} onChange={(event) => { setQuery(event.target.value); setPage(1); }} className="h-11 rounded-xl pl-10 text-base sm:text-sm" />
        </div>

        <div className="flex min-h-6 shrink-0 flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground" aria-live="polite">
          <span>{chosenIds.length ? `${chosenIds.length} ta tovar tanlandi` : "Bir nechta tovarni tanlashingiz mumkin"}</span>
          {chosenIds.length > 0 && <button type="button" disabled={saving} onClick={() => setChosen(new Set())} className="min-h-11 rounded-lg px-2 font-medium text-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-ring">Tanlovni tozalash</button>}
        </div>

        <div className={styles.pickerResults} aria-busy={loading} aria-label="Tovarlar ro‘yxati">
          {loading ? (
            <div role="status" className="flex min-h-40 flex-col items-center justify-center gap-3 text-xs text-muted-foreground"><Loader2 className="size-5 animate-spin" aria-hidden="true" />Tovarlar yuklanmoqda…</div>
          ) : error ? (
            <div role="alert" className="flex min-h-40 flex-col items-center justify-center gap-3 p-3 text-center"><AlertCircle className="size-6 text-destructive" aria-hidden="true" /><p className="text-sm">{error}</p><Button type="button" variant="outline" className="h-11 rounded-xl" disabled={saving} onClick={() => setRetry((previous) => previous + 1)}>Qayta urinish</Button></div>
          ) : products.length === 0 ? (
            <div role="status" className="flex min-h-40 flex-col items-center justify-center gap-2 p-3 text-center"><Package className="mb-1 size-7 text-muted-foreground" aria-hidden="true" /><p className="text-sm font-medium">{query.trim() ? "Tovar topilmadi" : "Omborda tovarlar yo‘q"}</p><p className="text-xs leading-relaxed text-muted-foreground">{query.trim() ? "Boshqa nom yoki SKU bilan qidirib ko‘ring." : "Avval omborga tovar qo‘shing, so‘ng uni e’longa bog‘lang."}</p></div>
          ) : products.map((product) => (
            <button key={product.id} type="button" className={styles.pickerItem} aria-pressed={chosen.has(product.id)} disabled={saving || linked.has(product.id)} onClick={() => toggle(product.id)}>
              <ProductThumbnail source={product.image} />
              <span className={styles.pickerItemText}><strong>{product.title}</strong><small>{[product.variantName, product.sellerSku || product.skuCode].filter(Boolean).join(" · ") || `Tovar #${product.id}`}</small></span>
              {linked.has(product.id) ? <span className="shrink-0 text-[10px] text-muted-foreground">Bog‘langan</span> : <span className={styles.pickerCheck}>{chosen.has(product.id) && <Check size={13} aria-hidden="true" />}</span>}
            </button>
          ))}
        </div>

        {!error && (pages > 1 || !loading && count > 0) && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-t pt-3">
            <p className="text-xs tabular-nums text-muted-foreground">{loading ? "Yuklanmoqda…" : `${count} ta natija · ${page} / ${Math.max(pages, 1)}`}</p>
            <div className="flex gap-1"><Button type="button" variant="outline" className="size-11 rounded-xl p-0" aria-label="Oldingi sahifa" disabled={saving || loading || page <= 1} onClick={() => setPage((previous) => previous - 1)}><ChevronLeft aria-hidden="true" /></Button><Button type="button" variant="outline" className="size-11 rounded-xl p-0" aria-label="Keyingi sahifa" disabled={saving || loading || page >= pages} onClick={() => setPage((previous) => previous + 1)}><ChevronRight aria-hidden="true" /></Button></div>
          </div>
        )}

        <DialogFooter className="shrink-0 border-t pt-4">
          <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={saving} onClick={() => close(false)}>Bekor qilish</Button>
          <Button type="button" className="h-11 rounded-xl" disabled={saving || chosenIds.length === 0} onClick={submit}>{saving ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Link2 aria-hidden="true" />}{saving ? "Bog‘lanmoqda…" : chosenIds.length ? `${chosenIds.length} ta tovarni bog‘lash` : "Tovarlarni bog‘lash"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ProductThumbnail({ source }: { source: string | null }) {
  const [failedSource, setFailedSource] = React.useState<string | null>(null);
  return <span className={styles.pickerThumb}>{source && source !== failedSource ? <img src={source} alt="" loading="lazy" onError={() => setFailedSource(source)} /> : <Package size={19} aria-hidden="true" />}</span>;
}
