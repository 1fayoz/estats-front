"use client";

import * as React from "react";
import { Info, Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, createIntake } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { WarehouseProduct } from "@/lib/types";

interface IntakeDialogProps {
  product: WarehouseProduct | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function todayInput(): string {
  return new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export function IntakeDialog({ product, onOpenChange, onSaved }: IntakeDialogProps) {
  const [quantity, setQuantity] = React.useState("");
  const [costPrice, setCostPrice] = React.useState("");
  const [supplier, setSupplier] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [receivedAt, setReceivedAt] = React.useState(todayInput());
  const [saving, setSaving] = React.useState(false);
  const savingRef = React.useRef(false);

  React.useEffect(() => {
    if (product) {
      setQuantity("");
      setCostPrice(product.lastCost != null ? String(product.lastCost) : "");
      setSupplier("");
      setReference("");
      setReceivedAt(todayInput());
    }
  }, [product]);

  const parsedQuantity = Number(quantity);
  const parsedCost = Number(costPrice);
  const total = Number.isFinite(parsedQuantity) && Number.isFinite(parsedCost) ? parsedQuantity * parsedCost : 0;
  const valid = quantity.trim() !== "" && costPrice.trim() !== "" && parsedQuantity > 0 && parsedCost >= 0 && Number.isFinite(parsedQuantity) && Number.isFinite(parsedCost) && Number.isFinite(total) && receivedAt !== "";
  const close = (open: boolean) => { if (!savingRef.current) onOpenChange(open); };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (savingRef.current) return;
    if (!product || !valid) {
      toast.error("Miqdor, tan narx va sanani to‘g‘ri kiriting.");
      return;
    }
    savingRef.current = true;
    setSaving(true);
    try {
      await createIntake({
        warehouseProductId: product.id,
        quantity: parsedQuantity,
        costPrice: parsedCost,
        supplier: supplier.trim() || null,
        reference: reference.trim() || null,
        receivedAt: `${receivedAt}T12:00:00+05:00`,
      });
      toast.success(`${parsedQuantity} dona kirim qilindi — jami ${formatSum(total)}`);
      onSaved();
      onOpenChange(false);
    } catch (reason) {
      toast.error(reason instanceof ApiError ? reason.message : "Kirim saqlanmadi.");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={close}>
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:p-6 [&>button]:right-2 [&>button]:top-2 [&>button]:grid [&>button]:size-11 [&>button]:place-items-center", saving && "[&>button]:hidden")}>
        <DialogHeader>
          <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"><PackagePlus className="h-5 w-5" /></span>
          <DialogTitle className="pr-8">Kirim qo‘shish</DialogTitle>
          <DialogDescription className="break-words leading-relaxed">{product?.title}{product?.variantName ? ` · ${product.variantName}` : ""}</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4" aria-busy={saving}>
          <fieldset disabled={saving} className="space-y-4 disabled:opacity-70 [&_input]:h-11 [&_input]:min-w-0 [&_input]:rounded-xl [&_input]:text-base sm:[&_input]:text-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2"><Label htmlFor="intake-quantity">Nechta keldi</Label><Input id="intake-quantity" inputMode="decimal" type="number" min="0" step="any" required placeholder="Masalan, 10" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></div>
              <div className="min-w-0 space-y-2"><Label htmlFor="intake-cost">Tan narxi / dona (so‘m)</Label><Input id="intake-cost" inputMode="decimal" type="number" min="0" step="any" required placeholder="Masalan, 12 000" value={costPrice} onChange={(event) => setCostPrice(event.target.value)} /></div>
            </div>
            <div role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"><div className="text-xs text-muted-foreground">Jami kirim summasi</div><div className="mt-1 break-words text-xl font-semibold tabular-nums [overflow-wrap:anywhere]">{formatSum(total)}</div></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="min-w-0 space-y-2"><Label htmlFor="intake-date">Kirim sanasi</Label><Input id="intake-date" type="date" required value={receivedAt} onChange={(event) => setReceivedAt(event.target.value)} /></div>
              <div className="min-w-0 space-y-2"><Label htmlFor="intake-supplier">Yetkazib beruvchi</Label><Input id="intake-supplier" placeholder="Ixtiyoriy" value={supplier} onChange={(event) => setSupplier(event.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label htmlFor="intake-reference">Faktura / nakladnoy</Label><Input id="intake-reference" placeholder="Hujjat raqami (ixtiyoriy)" value={reference} onChange={(event) => setReference(event.target.value)} /></div>
          </fieldset>
          <p className="flex items-start gap-2 rounded-xl bg-muted/50 p-3 text-xs leading-relaxed text-muted-foreground"><Info className="mt-0.5 h-4 w-4 shrink-0" />Har bir kirim alohida partiya sifatida saqlanadi. Sotuvlar eng eski partiyadan boshlab hisoblanadi (FIFO).</p>
          <DialogFooter className="border-t pt-4">
            <Button type="button" variant="outline" className="h-11 rounded-xl" disabled={saving} onClick={() => close(false)}>Bekor qilish</Button>
            <Button type="submit" className="h-11 rounded-xl bg-[#00904d] text-white hover:bg-[#007d43]" disabled={saving || !valid}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <PackagePlus className="h-4 w-4" />}{saving ? "Saqlanmoqda…" : "Kirimni saqlash"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
