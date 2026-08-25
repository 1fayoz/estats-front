"use client";

import * as React from "react";
import { Check, Loader2, Send, Tag } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError, publishToSocial } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { NetworkIcon } from "@/components/brand/network-icons";
import { PLATFORM_LABEL } from "@/lib/platforms";
import { useBroadcastStore } from "@/stores/broadcast-store";
import { cn } from "@/lib/utils";
import type { SocialAccount, WarehouseProduct } from "@/lib/types";

/**
 * Bitta tovarni bir necha tarmoqqa joylash.
 *
 * Tugma bosilgach oyna DARHOL yopiladi: e'lon serverda ketadi va uni
 * kutib turishning hojati yo'q. Holat pastdagi panelda ko'rinadi va u
 * sahifa almashsa ham joyida qoladi.
 */
export function PublishEverywhereDialog({
  product,
  accounts,
  onOpenChange,
}: {
  product: WarehouseProduct | null;
  accounts: SocialAccount[];
  onOpenChange: (open: boolean) => void;
}) {
  const put = useBroadcastStore((s) => s.put);
  const usable = accounts.filter((a) => a.canPublish);
  const [chosen, setChosen] = React.useState<Set<number>>(new Set());
  const [caption, setCaption] = React.useState("");
  const [withPrice, setWithPrice] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    if (!product) return;
    // Sukut bo'yicha hammasi tanlangan — "bitta tugma bilan hamma joyga"
    // eng ko'p uchraydigan holat.
    setChosen(new Set(usable.map((a) => a.id)));
    setCaption("");
    setWithPrice(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const toggle = (id: number) =>
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onSubmit = async () => {
    if (!product || chosen.size === 0) return;
    setSending(true);
    try {
      const broadcast = await publishToSocial({
        productId: product.id,
        accountIds: [...chosen],
        caption: caption.trim() || undefined,
        withPrice,
      });
      put(broadcast);
      onOpenChange(false);
      toast.success(`${chosen.size} ta tarmoqqa yuborilmoqda`, {
        description: "Kutib turish shart emas — boshqa bo'limga o'tsangiz ham davom etadi.",
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Yuborilmadi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tarmoqlarga joylash</DialogTitle>
          <DialogDescription className="line-clamp-2">
            {product?.title}
          </DialogDescription>
        </DialogHeader>

        {usable.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            E&apos;lon qiladigan akkaunt yo&apos;q. Integratsiyalar sahifasida tarmoq ulang.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              {usable.map((account) => {
                const on = chosen.has(account.id);
                return (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => toggle(account.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                      on ? "border-primary bg-primary/5" : "hover:bg-accent",
                    )}
                  >
                    <NetworkIcon platform={account.platform} colored className="h-4 w-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {account.name ?? account.username ?? PLATFORM_LABEL[account.platform]}
                    </span>
                    {account.isDefault && <Badge variant="secondary">Asosiy</Badge>}
                    <span
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                        on && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      {on && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Narx SUKUT BO'YICHA yozilmaydi: Uzum'dagi narx aksiya bilan
                tez-tez o'zgaradi, e'lon esa kanalda oylab turadi — eskirgan
                narx "aldadi" degan taassurot qoldiradi. Havola baribir tovar
                sahifasiga olib boradi, u yerdagi narx doim to'g'ri. */}
            <button
              type="button"
              onClick={() => setWithPrice((v) => !v)}
              disabled={caption.trim().length > 0}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors",
                withPrice ? "border-primary bg-primary/5" : "hover:bg-accent",
                caption.trim().length > 0 && "cursor-not-allowed opacity-50",
              )}
            >
              <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm">Narx bilan</span>
                <span className="block text-xs text-muted-foreground">
                  {caption.trim().length > 0
                    ? "O'z matningiz yozilgan — narx unga qo'shilmaydi"
                    : withPrice
                      ? formatSum(product?.marketplacePrice ?? 0) + " matnga yoziladi"
                      : "Narx yozilmaydi — u Uzum'da tez o'zgaradi"}
                </span>
              </span>
              <span
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                  withPrice ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all",
                    withPrice ? "left-[1.125rem]" : "left-0.5",
                  )}
                />
              </span>
            </button>

            <div className="space-y-1.5">
              <label htmlFor="caption" className="text-xs text-muted-foreground">
                Matn — bo&apos;sh qoldirsangiz tovar nomi va havolasidan o&apos;zi yasaladi
              </label>
              <textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                placeholder="O'z matningizni yozing…"
                className="w-full resize-none rounded-md border bg-background p-2.5 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={onSubmit} disabled={sending || chosen.size === 0} className="gap-1.5">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {chosen.size > 0 ? `${chosen.size} ta tarmoqqa joylash` : "Tarmoq tanlang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
