"use client";

import * as React from "react";
import { Loader2, PackagePlus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, createIntake } from "@/lib/api";
import { formatSum } from "@/lib/format";
import type { WarehouseProduct } from "@/lib/types";

interface IntakeDialogProps {
  product: WarehouseProduct | null;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

/** Today's date in Tashkent, as the `YYYY-MM-DD` an <input type="date"> expects. */
function todayInput(): string {
  return new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/**
 * "Tovar keldi" form: how many arrived and what one unit cost.
 *
 * Each save is its own batch — entering two deliveries at different prices keeps them
 * separate, which is exactly what FIFO consumes from later.
 */
export function IntakeDialog({ product, onOpenChange, onSaved }: IntakeDialogProps) {
  const [quantity, setQuantity] = React.useState("");
  const [costPrice, setCostPrice] = React.useState("");
  const [supplier, setSupplier] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [receivedAt, setReceivedAt] = React.useState(todayInput());
  const [saving, setSaving] = React.useState(false);

  // Reset the form each time a different good is opened.
  React.useEffect(() => {
    if (product) {
      setQuantity("");
      setCostPrice(product.lastCost ? String(product.lastCost) : "");
      setSupplier("");
      setReference("");
      setReceivedAt(todayInput());
    }
  }, [product]);

  const qty = Number(quantity);
  const cost = Number(costPrice);
  const total = Number.isFinite(qty) && Number.isFinite(cost) ? qty * cost : 0;
  const valid = qty > 0 && cost >= 0 && Number.isFinite(qty) && Number.isFinite(cost);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !valid) {
      toast.error("Miqdor va tan narxni to'g'ri kiriting.");
      return;
    }
    setSaving(true);
    try {
      await createIntake({
        warehouseProductId: product.id,
        quantity: qty,
        costPrice: cost,
        supplier: supplier.trim() || null,
        reference: reference.trim() || null,
        // Send local noon so the day can't slip across the timezone boundary.
        receivedAt: `${receivedAt}T12:00:00+05:00`,
      });
      toast.success(`${qty} dona kirim qilindi — jami ${formatSum(total)}`);
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Kirim saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4" /> Kirim qo'shish
          </DialogTitle>
          <DialogDescription className="line-clamp-2">
            {product?.title}
            {product?.variantName ? ` — ${product.variantName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qty">Nechta keldi</Label>
              <Input
                id="qty"
                autoFocus
                inputMode="numeric"
                placeholder="10"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cost">Tan narxi (1 dona)</Label>
              <Input
                id="cost"
                inputMode="decimal"
                placeholder="12000"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Jami kirim summasi: </span>
            <span className="font-semibold">{formatSum(total)}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Kirim sanasi</Label>
              <Input
                id="date"
                type="date"
                value={receivedAt}
                onChange={(e) => setReceivedAt(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="supplier">Yetkazib beruvchi</Label>
              <Input
                id="supplier"
                placeholder="ixtiyoriy"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ref">Faktura / nakladnoy</Label>
            <Input
              id="ref"
              placeholder="ixtiyoriy"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <p className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
            Har bir kirim alohida partiya bo'lib saqlanadi. Sotuvlar eng eski partiyadan
            boshlab hisoblanadi (FIFO), shuning uchun turli narxdagi kelishlar
            aralashib ketmaydi.
          </p>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" disabled={saving || !valid}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Saqlash
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
