"use client";

import * as React from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ApiError, fetchPublishPreview, publishToInstagram } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PublishPreview } from "@/lib/types";

/**
 * Tovarni Instagram'ga joylash.
 *
 * Matn oldindan yasaladi va TAHRIRLASH mumkin: avtomatik matn yaxshi
 * boshlanish nuqtasi, lekin sotuvchi o'z tovarini yaxshiroq biladi.
 * Rasmlar ham tanlanadi — Uzum galereyasida ba'zan o'lchov jadvali kabi
 * lentaga to'g'ri kelmaydigan rasmlar bo'ladi.
 */
export function PublishDialog({
  productId,
  onOpenChange,
  onPublished,
}: {
  productId: number | null;
  onOpenChange: (open: boolean) => void;
  onPublished: () => void;
}) {
  const [preview, setPreview] = React.useState<PublishPreview | null>(null);
  const [caption, setCaption] = React.useState("");
  const [chosen, setChosen] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (productId == null) return;
    setLoading(true);
    setPreview(null);
    fetchPublishPreview(productId)
      .then((data) => {
        setPreview(data);
        setCaption(data.caption);
        setChosen(data.images.slice(0, 10));
      })
      .catch((err) => toast.error(err instanceof ApiError ? err.message : "Yuklanmadi."))
      .finally(() => setLoading(false));
  }, [productId]);

  const toggleImage = (url: string) => {
    setChosen((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url].slice(0, 10)
    );
  };

  const onSubmit = async () => {
    if (productId == null || chosen.length === 0) return;
    setSaving(true);
    try {
      await publishToInstagram({ productId, caption, images: chosen });
      toast.success("Instagram'ga joylandi");
      onPublished();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Joylanmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={productId != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImagePlus className="h-4 w-4" /> Instagram&apos;ga joylash
          </DialogTitle>
          <DialogDescription>
            Rasm va matn Uzum&apos;dan olinadi. Joylashdan oldin o&apos;zgartirsangiz
            bo&apos;ladi.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : preview ? (
          <div className="space-y-4">
            {!preview.canPublish && preview.reason && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {preview.reason}
              </div>
            )}

            <div className="space-y-1.5">
              <Label>
                {`Rasmlar (${chosen.length} tanlandi${chosen.length >= 2 ? " — karusel" : ""})`}
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {preview.images.map((url) => {
                  const index = chosen.indexOf(url);
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
                        <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                          {index + 1}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Tartib bosish tartibida. Ko&apos;pi bilan 10 ta.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ig-caption">Matn</Label>
              <textarea
                id="ig-caption"
                rows={9}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full rounded-md border border-input bg-transparent p-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              />
              <p className="text-xs text-muted-foreground">
                {`${caption.length} / 2200 belgi`}
              </p>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button
            onClick={onSubmit}
            disabled={saving || !preview?.canPublish || chosen.length === 0}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Joylash
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
