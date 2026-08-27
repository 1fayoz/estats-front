"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, fetchProducts, linkSocialPost } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { SocialPost, WarehouseProduct } from "@/lib/types";

/** «Bu e'lon shu tovarga tegishli» — istalgan tarmoqda. */
export function LinkPostDialog({
  post,
  onOpenChange,
  onSaved,
}: {
  post: SocialPost | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}) {
  const [products, setProducts] = React.useState<WarehouseProduct[]>([]);
  const [query, setQuery] = React.useState("");
  const [chosen, setChosen] = React.useState<Set<number>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!post) return;
    setChosen(new Set());
    setQuery("");
    setLoading(true);
    fetchProducts({ page: 1, size: 200 })
      .then((res) => setProducts(res.results))
      .catch(() => toast.error("Tovarlar yuklanmadi."))
      .finally(() => setLoading(false));
  }, [post]);

  const linked = new Set((post?.products ?? []).map((p) => p.id));
  const filtered = products.filter(
    (p) => !linked.has(p.id) && p.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  const onSubmit = async () => {
    if (!post || chosen.size === 0) return;
    setSaving(true);
    try {
      await linkSocialPost(post.id, [...chosen]);
      toast.success("Bog'landi");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={post != null} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Qaysi tovar?</DialogTitle>
          <DialogDescription>
            Bog&apos;langandan keyin bu e&apos;lonning natijasi tovar sahifasida
            ko&apos;rinadi.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tovar nomi"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="max-h-80 space-y-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Tovar topilmadi.</p>
          ) : (
            filtered.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() =>
                  setChosen((prev) => {
                    const next = new Set(prev);
                    if (next.has(product.id)) next.delete(product.id);
                    else next.add(product.id);
                    return next;
                  })
                }
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                  chosen.has(product.id) ? "border-primary bg-primary/5" : "hover:bg-accent"
                )}
              >
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image} alt="" className="h-9 w-9 rounded-md border object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-md border bg-muted" />
                )}
                <span className="min-w-0 flex-1 truncate text-sm">{product.title}</span>
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border",
                    chosen.has(product.id) && "border-primary bg-primary"
                  )}
                />
              </button>
            ))
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Bekor qilish
          </Button>
          <Button onClick={onSubmit} disabled={saving || chosen.size === 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {chosen.size > 0 ? `${chosen.size} ta tovarni bog'lash` : "Bog'lash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
