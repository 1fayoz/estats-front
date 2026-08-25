"use client";

import * as React from "react";
import { AlertTriangle, Check, ExternalLink, ImagePlus, Loader2, Send, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ApiError, fetchPublishPreview, fetchSocialAccounts, publishToSocial,
} from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BroadcastResult, PublishPreview, SocialAccount } from "@/lib/types";

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
};

/**
 * Tovarni bir necha tarmoqqa yuborish.
 *
 * Matn va rasmlar bitta marta tanlanadi, keyin har tarmoq o'z
 * imkoniyatiga qarab moslaydi (masalan Telegram 10 ta rasm oladi,
 * LinkedIn faqat matn). Natija HAR AKKAUNT uchun alohida ko'rsatiladi:
 * birida ketmasligi odatiy hol va uni umumiy "xato" bilan yashirish
 * sotuvchini chalg'itadi.
 */
export function BroadcastDialog({
  productId,
  onOpenChange,
  onPublished,
}: {
  productId: number | null;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}) {
  const [preview, setPreview] = React.useState<PublishPreview | null>(null);
  const [accounts, setAccounts] = React.useState<SocialAccount[]>([]);
  const [chosenAccounts, setChosenAccounts] = React.useState<Set<number>>(new Set());
  const [caption, setCaption] = React.useState("");
  const [images, setImages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [result, setResult] = React.useState<BroadcastResult | null>(null);

  React.useEffect(() => {
    if (productId == null) return;
    setLoading(true);
    setResult(null);
    Promise.all([fetchPublishPreview(productId), fetchSocialAccounts()])
      .then(([p, list]) => {
        setPreview(p);
        setCaption(p.caption);
        setImages(p.images.slice(0, 10));
        const usable = list.filter((a) => a.canPublish);
        setAccounts(usable);
        // Standart tanlov — har tarmoqning asosiy akkaunti.
        setChosenAccounts(new Set(usable.filter((a) => a.isDefault).map((a) => a.id)));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklanmadi."))
      .finally(() => setLoading(false));
  }, [productId]);

  const toggleAccount = (id: number) =>
    setChosenAccounts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleImage = (url: string) =>
    setImages((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url].slice(0, 10)
    );

  const onSend = async () => {
    if (productId == null || chosenAccounts.size === 0) return;
    setSending(true);
    try {
      const res = await publishToSocial({
        productId,
        accountIds: [...chosenAccounts],
        caption,
        images,
      });
      setResult(res);
      if (res.sent > 0) {
        toast.success(`${res.sent} ta tarmoqqa joylandi`);
        onPublished();
      }
      if (res.failed > 0 && res.sent === 0) toast.error("Hech qayerga joylanmadi.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Joylanmadi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={productId != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4" /> Tarmoqlarga joylash
          </DialogTitle>
          <DialogDescription>
            Matn va rasm bir marta tanlanadi — har tarmoq o&apos;z imkoniyatiga
            moslaydi.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : result ? (
          <div className="space-y-2">
            {result.items.map((item) => (
              <div
                key={item.accountId}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 text-sm",
                  item.ok
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-destructive/40 bg-destructive/5"
                )}
              >
                {item.ok ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {`${PLATFORM_LABEL[item.platform] ?? item.platform} · ${item.account}`}
                  </div>
                  {item.error && (
                    <div className="mt-0.5 text-muted-foreground">{item.error}</div>
                  )}
                </div>
                {item.permalink && (
                  <a
                    href={item.permalink}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {accounts.length === 0 ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                <span className="text-muted-foreground">
                  E&apos;lon qiladigan akkaunt yo&apos;q. Sozlamalar → Tarmoqlar
                  bo&apos;limida tarmoq ulang.
                </span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>{`Qayerga (${chosenAccounts.size} ta tanlandi)`}</Label>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {accounts.map((account) => {
                    const on = chosenAccounts.has(account.id);
                    return (
                      <button
                        key={account.id}
                        type="button"
                        onClick={() => toggleAccount(account.id)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border p-2.5 text-left transition-colors",
                          on ? "border-primary bg-primary/5" : "hover:bg-accent"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                            on && "border-primary bg-primary text-primary-foreground"
                          )}
                        >
                          {on && <Check className="h-3 w-3" />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {account.name ?? account.username ?? account.externalId}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {`${PLATFORM_LABEL[account.platform] ?? account.platform} · ${formatNumber(account.followers)} obunachi`}
                          </span>
                        </span>
                        {account.isDefault && <Badge variant="secondary">asosiy</Badge>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {preview.images.length > 0 && (
              <div className="space-y-1.5">
                <Label>{`Rasmlar (${images.length} tanlandi)`}</Label>
                <div className="grid grid-cols-6 gap-2">
                  {preview.images.map((url) => {
                    const index = images.indexOf(url);
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => toggleImage(url)}
                        className={cn(
                          "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors",
                          index >= 0 ? "border-primary" : "border-transparent opacity-60"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                        {index >= 0 && (
                          <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                            {index + 1}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="bc-caption">Matn</Label>
              <textarea
                id="bc-caption"
                rows={8}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <p className="text-xs text-muted-foreground">
                {`${caption.length} belgi · uzunroq matn tarmoq chegarasiga qarab qisqartiriladi`}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          {result ? (
            <Button onClick={() => onOpenChange(false)}>Yopish</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Bekor qilish
              </Button>
              <Button
                onClick={onSend}
                disabled={sending || chosenAccounts.size === 0 || images.length === 0}
                className="gap-1.5"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
                {chosenAccounts.size > 1
                  ? `${chosenAccounts.size} ta tarmoqqa joylash`
                  : "Joylash"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
