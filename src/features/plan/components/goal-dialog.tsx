"use client";

import * as React from "react";
import { Loader2, Target } from "lucide-react";
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
import { ApiError, createGoal } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";

// Tez tanlash uchun — nol kiritishning eng ko'p uchraydigan xatosi shu yerda oldi olinadi.
const PRESETS = ["📱", "💻", "🚗", "🏠", "✈️", "🎓", "⌚️", "🎁"];

export function GoalDialog({
  open,
  onOpenChange,
  onSaved,
  dailyProfit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  dailyProfit: number;
}) {
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [emoji, setEmoji] = React.useState(PRESETS[0]);
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setTitle("");
      setAmount("");
      setEmoji(PRESETS[0]);
      setNote("");
    }
  }, [open]);

  const target = Number(amount);
  const valid = title.trim().length > 0 && Number.isFinite(target) && target > 0;
  // Foydalanuvchi summani yozayotganda darhol ko'radi — bu real maqsadmi yo'qmi.
  const days = valid && dailyProfit > 0 ? Math.ceil(target / dailyProfit) : null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error("Nom va summani to'g'ri kiriting.");
      return;
    }
    setSaving(true);
    try {
      await createGoal({
        title: title.trim(),
        emoji,
        targetAmount: target,
        note: note.trim() || null,
      });
      toast.success("Maqsad qo'shildi");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-4 w-4" /> Yangi maqsad
          </DialogTitle>
          <DialogDescription>
            Nimaga yig&apos;yapsiz va qancha kerak? Qolgani o&apos;zi hisoblanadi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="goal-title">Nomi</Label>
            <Input
              id="goal-title"
              autoFocus
              placeholder="Yangi telefon"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-amount">Kerakli summa (so&apos;m)</Label>
            <Input
              id="goal-amount"
              inputMode="numeric"
              placeholder="12000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {valid && (
              <p className="text-xs text-muted-foreground">
                {formatSum(target)}
                {days != null && (
                  <>
                    {" "}· hozirgi sur&apos;atda{" "}
                    <span className="font-medium text-foreground">
                      {days} kun ({(days / 30).toFixed(1)} oy)
                    </span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Belgi</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEmoji(item)}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors",
                    emoji === item ? "border-primary bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-note">Izoh</Label>
            <Input
              id="goal-note"
              placeholder="ixtiyoriy"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

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
