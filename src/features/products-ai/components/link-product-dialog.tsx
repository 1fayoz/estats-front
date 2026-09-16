"use client";

import * as React from "react";
import { Link2, Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ApiError, fetchProducts, linkAiDraftProduct, mediaUrl } from "@/lib/api";
import { formatNumber, formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiDraft, WarehouseProduct } from "@/lib/types";

/**
 * «Mavjud tovarni yangilash» — qoralamani do'kondagi tovarga bog'laydi.
 *
 * Sotuvchi talabi (2026-09-16): AI bilan tayyorlangan kartochka har doim
 * YANGI e'lon bo'lishi shart emas — uni tanlangan tovarga bog'lab, o'sha
 * tovarni shu ma'lumotlar bilan yangilash kerak. Ro'yxat ombor
 * katalogidan (Uzum'dan sinxronlangan): begona tovarni tahrirlab
 * bo'lmaydi, kabinet ham ruxsat bermaydi.
 */
export function LinkProductDialog({
  draft,
  open,
  onOpenChange,
  onLinked,
}: {
  draft: AiDraft;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLinked: (draft: AiDraft) => void;
}) {
  const [query, setQuery] = React.useState("");
  const [rows, setRows] = React.useState<WarehouseProduct[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    setRows(null);
    // Har harfda emas — 350 ms tinchlikdan keyin (bozor ro'yxatlaridagi naqsh).
    const timer = setTimeout(() => {
      fetchProducts({ search: query.trim() || undefined, size: 40 })
        .then((page) => {
          if (!alive) return;
          // Bitta kartochkaning bir necha SKU'si bitta tovar — takrorini olib tashlaymiz.
          const seen = new Set<string>();
          setRows(
            page.results.filter((item) => {
              const key = item.externalProductId ?? `row:${item.id}`;
              if (!item.externalProductId || seen.has(key)) return false;
              seen.add(key);
              return true;
            }),
          );
        })
        .catch(() => alive && setRows([]));
    }, query ? 350 : 0);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [open, query]);

  const link = async (value: string, label: string) => {
    if (busy) return;
    setBusy(value);
    try {
      onLinked(await linkAiDraftProduct(draft.id, value));
      toast.success(`«${label}» tovariga bog'landi — «Uzumda yangilash» bilan yuboring.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "Bog'lanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const manual = query.trim();
  const manualLooksLikeId = /^\d{5,}$/.test(manual) || /uzum\.uz/i.test(manual);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] w-[calc(100%-2rem)] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="border-b p-5 pb-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Link2 className="size-4" /> Mavjud tovarni yangilash
          </DialogTitle>
          <DialogDescription>
            {"Yangi e'lon yaratilmaydi — tanlangan tovar shu qoralamaning nomi, tavsifi, bo'limlari va (xohlasangiz) rasmlari bilan yangilanadi."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tovar nomi, SKU yoki Uzum havolasi/ID"
              className="pl-9"
            />
          </div>

          {manualLooksLikeId && (
            <Button
              variant="outline"
              className="min-h-11 w-full rounded-xl"
              disabled={busy !== null}
              onClick={() => void link(manual, manual)}
            >
              {busy === manual ? <Loader2 className="animate-spin" /> : <Link2 />}
              {`«${manual}» ga bog'lash`}
            </Button>
          )}

          <div className="max-h-[52vh] space-y-1.5 overflow-y-auto">
            {rows === null && (
              <p className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Katalog yuklanmoqda…
              </p>
            )}
            {rows?.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                Tovar topilmadi. Uzum havolasini yoki tovar ID&apos;sini kiritib ko&apos;ring.
              </p>
            )}
            {rows?.map((row) => {
              const id = row.externalProductId!;
              return (
                <button
                  key={row.id}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => void link(id, row.title)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition hover:bg-muted/50 disabled:opacity-60",
                  )}
                >
                  {row.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(row.image)} alt="" className="size-12 shrink-0 rounded-lg border object-cover" />
                  ) : (
                    <span className="size-12 shrink-0 rounded-lg border bg-muted" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium">{row.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {`Uzum ${id}`}
                      {row.marketplacePrice ? ` · ${formatSum(row.marketplacePrice)}` : ""}
                      {row.marketplaceStock !== null ? ` · ${formatNumber(row.marketplaceStock)} dona` : ""}
                    </span>
                  </span>
                  {busy === id ? <Loader2 className="size-4 shrink-0 animate-spin" /> : <Link2 className="size-4 shrink-0 text-muted-foreground" />}
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
