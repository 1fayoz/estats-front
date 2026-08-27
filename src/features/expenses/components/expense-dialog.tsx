"use client";

import * as React from "react";
import { Loader2, Receipt } from "lucide-react";
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
import { ApiError, createExpense, updateExpense } from "@/lib/api";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { RecurringExpense } from "@/lib/types";

import { CATEGORIES, MONTHS, PERIODS } from "./labels";

export function ExpenseDialog({
  open,
  onOpenChange,
  onSaved,
  expense,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  /** Bo'sh bo'lsa — yangi to'lov qo'shiladi. */
  expense?: RecurringExpense | null;
}) {
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [category, setCategory] = React.useState("tax");
  const [period, setPeriod] = React.useState("monthly");
  const [dueDay, setDueDay] = React.useState("10");
  const [anchorMonth, setAnchorMonth] = React.useState("1");
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle(expense?.title ?? "");
    setAmount(expense ? String(expense.amount) : "");
    setCategory(expense?.category ?? "tax");
    setPeriod(expense?.period ?? "monthly");
    setDueDay(String(expense?.dueDay ?? 10));
    setAnchorMonth(String(expense?.anchorMonth ?? 1));
    setNote(expense?.note ?? "");
  }, [open, expense]);

  const value = Number(amount);
  const day = Number(dueDay);
  const valid =
    title.trim().length > 0 &&
    Number.isFinite(value) &&
    value > 0 &&
    Number.isInteger(day) &&
    day >= 1 &&
    day <= 31;

  // Yillik to'lov aslida har oy qancha yuk beradi — kiritayotganda darhol ko'rinadi.
  const monthly = period === "yearly" ? value / 12 : period === "quarterly" ? value / 3 : value;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) {
      toast.error("Nom, summa va to'lov kunini to'g'ri kiriting.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        amount: value,
        category,
        period,
        dueDay: day,
        anchorMonth: Number(anchorMonth) || 1,
        note: note.trim() || null,
      };
      if (expense) {
        await updateExpense(expense.id, payload);
        toast.success("Yangilandi");
      } else {
        await createExpense(payload);
        toast.success("To'lov qo'shildi");
      }
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
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {expense ? "To'lovni tahrirlash" : "Yangi doimiy to'lov"}
          </DialogTitle>
          <DialogDescription>
            Tovar sotilmasa ham to&apos;lanadigan xarajat: soliq, arenda, oylik.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ex-title">Nomi</Label>
            <Input
              id="ex-title"
              autoFocus
              placeholder="Aylanma soliq"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Turkumi</Label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setCategory(item.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm transition-colors",
                    category === item.value ? "border-primary bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ex-amount">Summa (so&apos;m)</Label>
            <Input
              id="ex-amount"
              inputMode="numeric"
              placeholder="1200000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {Number.isFinite(value) && value > 0 && (
              <p className="text-xs text-muted-foreground">
                {formatSum(value)}
                {period !== "monthly" && (
                  <>
                    {" · oyiga o'rtacha "}
                    <span className="font-medium text-foreground">{formatSum(monthly)}</span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Qanchalik tez-tez</Label>
            <div className="flex flex-wrap gap-1.5">
              {PERIODS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPeriod(item.value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                    period === item.value ? "border-primary bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ex-day">Oyning nechanchi kuni</Label>
              <Input
                id="ex-day"
                inputMode="numeric"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Oyda shuncha kun bo&apos;lmasa — oxirgi kunga suriladi.
              </p>
            </div>

            {period !== "monthly" && (
              <div className="space-y-1.5">
                <Label htmlFor="ex-anchor">
                  {period === "yearly" ? "Qaysi oyda" : "Qaysi oydan boshlab"}
                </Label>
                <select
                  id="ex-anchor"
                  value={anchorMonth}
                  onChange={(e) => setAnchorMonth(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                  {MONTHS.map((name, index) => (
                    <option key={name} value={index + 1}>
                      {name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  {period === "quarterly"
                    ? "Shu oydan boshlab har 3 oyda."
                    : "Yiliga bir marta shu oyda."}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ex-note">Izoh</Label>
            <Input
              id="ex-note"
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
