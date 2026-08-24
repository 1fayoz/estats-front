"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExpenseDialog } from "@/features/expenses/components/expense-dialog";
import {
  CATEGORIES,
  categoryLabel,
  periodLabel,
  prettyPeriod,
} from "@/features/expenses/components/labels";
import {
  ApiError,
  deleteExpense,
  fetchExpenseBurn,
  fetchExpenseMonth,
  fetchExpenses,
  fetchPlan,
  payExpense,
  unpayExpense,
} from "@/lib/api";
import { formatSum } from "@/lib/format";
import { useAutoRefresh } from "@/lib/use-auto-refresh";
import { useCountUp } from "@/lib/use-count-up";
import { cn } from "@/lib/utils";
import type { ExpenseBurn, ExpenseMonth, RecurringExpense } from "@/lib/types";

/** "2026-08" — bugungi oy, sahifa shundan boshlanadi. */
function currentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function shiftPeriod(key: string, months: number): string {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(year, month - 1 + months, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default function ExpensesPage() {
  const [period, setPeriod] = React.useState(currentPeriod);
  const [month, setMonth] = React.useState<ExpenseMonth | null>(null);
  const [expenses, setExpenses] = React.useState<RecurringExpense[]>([]);
  const [burn, setBurn] = React.useState<ExpenseBurn | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editing, setEditing] = React.useState<RecurringExpense | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  // Bosilayotgan qatorni belgilab turadi: ikki marta bosilsa ikkinchisi o'tmaydi.
  const [busy, setBusy] = React.useState<number | null>(null);

  const load = React.useCallback(async () => {
    try {
      const plan = await fetchPlan().catch(() => null);
      const [monthData, list, burnData] = await Promise.all([
        fetchExpenseMonth(period),
        fetchExpenses(),
        fetchExpenseBurn(plan?.rate.dailyProfit ?? 0),
      ]);
      setMonth(monthData);
      setExpenses(list);
      setBurn(burnData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, [period]);

  React.useEffect(() => {
    void load();
  }, [load]);
  useAutoRefresh(load);

  const togglePaid = async (expenseId: number, isPaid: boolean) => {
    if (busy !== null) return;
    setBusy(expenseId);
    try {
      if (isPaid) {
        await unpayExpense(expenseId, period);
      } else {
        await payExpense(expenseId, period);
      }
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Saqlanmadi.");
    } finally {
      setBusy(null);
    }
  };

  const onDelete = async (expense: RecurringExpense) => {
    setBusy(expense.id);
    try {
      await deleteExpense(expense.id);
      toast.success(`«${expense.title}» o'chirildi`);
      await load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "O'chirilmadi.");
    } finally {
      setBusy(null);
    }
  };

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (expense: RecurringExpense) => {
    setEditing(expense);
    setDialogOpen(true);
  };

  if (loading && !month) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !month) {
    return (
      <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        {error ?? "Ma'lumot yo'q"}
      </div>
    );
  }

  const isThisMonth = period === currentPeriod();
  const paidCount = month.items.filter((i) => i.isPaid).length;
  const overdue = month.items.filter((i) => i.isOverdue);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doimiy to'lovlar"
        description="Soliq, arenda, oylik — tovar sotilmasa ham to'lanadigan pul. Shu yerda kompaniya haqiqatan plyusdami yoki minusda ekani ko'rinadi."
        actions={
          <Button onClick={openNew} className="gap-1.5">
            <Plus className="h-4 w-4" /> To&apos;lov qo&apos;shish
          </Button>
        }
      />

      {/* ── Oy tanlash ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => setPeriod(shiftPeriod(period, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-44 text-center">
          <div className="font-semibold">{prettyPeriod(period)}</div>
          {!isThisMonth && (
            <button
              type="button"
              onClick={() => setPeriod(currentPeriod())}
              className="text-xs text-primary hover:underline"
            >
              Shu oyga qaytish
            </button>
          )}
        </div>
        <Button variant="outline" size="icon" onClick={() => setPeriod(shiftPeriod(period, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ── Asosiy javob: minusdami yoki plyusda ─────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card
          className={cn(
            "overflow-hidden",
            month.isProfitable
              ? "border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent"
              : "border-destructive/40 bg-gradient-to-br from-destructive/10 via-transparent to-transparent"
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {month.isProfitable ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {month.isProfitable
                ? "Kompaniya plyusda"
                : "Kompaniya minusda"}
            </div>
            <BigNumber
              value={month.netProfit}
              tone={month.isProfitable ? "positive" : "negative"}
            />
            <p className="mt-1 text-sm text-muted-foreground">
              {`${formatSum(month.grossProfit)} tovar foydasi − ${formatSum(month.fixedPlanned)} doimiy xarajat`}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Mini label="Tovar foydasi" value={month.grossProfit} tone="positive" />
              <Mini label="Rejadagi xarajat" value={month.fixedPlanned} />
              <Mini label="To'langan" value={month.fixedPaid} tone="positive" />
              <Mini label="To'lanmagan" value={month.fixedUnpaid} tone={month.fixedUnpaid > 0 ? "negative" : undefined} />
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Sof natija <b>rejadagi</b>{" "}xarajatdan hisoblanadi, to&apos;langanidan emas:
              to&apos;lanmagan soliq ham baribir qarz, uni hisobga olmaslik oyni
              yaxshiroq ko&apos;rsatib qo&apos;yadi.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Zarardan chiqish nuqtasi ─────────────────────────────────────── */}
      {burn && burn.monthlyFixed > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nolga chiqish nuqtasi</CardTitle>
            <CardDescription>
              Doimiy xarajatlarni qoplash uchun kuniga qancha sof foyda kerak. Yillik va
              chorakli to&apos;lovlar oylarga teng taqsimlangan — aks holda raqam faqat
              soliq tushgan oyda sakrab ketib, qolgan kunlarga yaroqsiz bo&apos;lardi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Oyiga o'rtacha xarajat" value={formatSum(burn.monthlyFixed)} />
              <Stat label="Kuniga kerak" value={formatSum(burn.breakEvenDailyProfit)} accent />
              <Stat
                label="Hozirgi kunlik foyda"
                value={formatSum(burn.currentDailyProfit)}
                tone={burn.isCovered ? "positive" : "negative"}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Xarajat qoplanishi</span>
                <span
                  className={cn(
                    "font-medium tabular-nums",
                    burn.isCovered ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                  )}
                >
                  {`${burn.coveragePercent.toFixed(0)}%`}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    burn.isCovered ? "bg-emerald-500" : "bg-destructive"
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(burn.coveragePercent, 100)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {burn.isCovered
                  ? burn.breakEvenDayOfMonth != null
                    ? `Hozirgi sur'atda oyning ${burn.breakEvenDayOfMonth}-kunida barcha doimiy xarajat qoplanadi, undan keyingisi — sof foyda.`
                    : "Kunlik foyda doimiy xarajatni qoplayapti."
                  : `Kunlik foyda xarajatdan ${formatSum(burn.breakEvenDailyProfit - burn.currentDailyProfit)} kam. Shu farqni yopmaguncha oy minusda tugaydi.`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Shu oyning to'lovlari ────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">{prettyPeriod(period)} to&apos;lovlari</CardTitle>
              <CardDescription>
                To&apos;langanini belgilab boring — hisob shunga qarab yuritiladi.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {overdue.length > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {`${overdue.length} ta muddati o'tgan`}
                </Badge>
              )}
              <Badge variant={paidCount === month.items.length ? "success" : "secondary"}>
                {`${paidCount} / ${month.items.length} to'langan`}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {month.items.length === 0 ? (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              Bu oyda to&apos;lanadigan doimiy xarajat yo&apos;q.
            </p>
          ) : (
            month.items.map((item, index) => {
              const cat = categoryLabel(item.category);
              return (
                <motion.div
                  key={item.expenseId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.3 }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-3",
                    item.isPaid && "border-emerald-500/40 bg-emerald-500/5",
                    item.isOverdue && "border-destructive/40 bg-destructive/5"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => togglePaid(item.expenseId, item.isPaid)}
                    disabled={busy !== null}
                    aria-label={item.isPaid ? "To'lovni bekor qilish" : "To'langan deb belgilash"}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50",
                      item.isPaid
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "hover:border-primary hover:bg-primary/10"
                    )}
                  >
                    {busy === item.expenseId ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : item.isPaid ? (
                      <Check className="h-4 w-4" />
                    ) : null}
                  </button>

                  <span className="text-lg">{cat.emoji}</span>

                  <div className="min-w-0 flex-1">
                    <div
                      className={cn(
                        "truncate text-sm font-medium",
                        item.isPaid && "text-muted-foreground line-through"
                      )}
                    >
                      {item.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {`${cat.label} · ${item.dueDate} muddat`}
                      {item.isPaid && item.paidAmount != null && item.paidAmount !== item.amount
                        ? ` · ${formatSum(item.paidAmount)} to'langan`
                        : ""}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-sm font-semibold tabular-nums">
                      {formatSum(item.amount)}
                    </div>
                    {item.isOverdue && (
                      <div className="text-xs text-destructive">muddati o&apos;tgan</div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* ── Barcha doimiy to'lovlar ──────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" /> Barcha doimiy to&apos;lovlar
          </CardTitle>
          <CardDescription>
            Bir marta kiritiladi, keyin har oy o&apos;zi paydo bo&apos;ladi.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {expenses.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Hali doimiy to&apos;lov kiritilmagan. Soliq va arendani kiritsangiz, foyda
                hisobi haqiqatga yaqinlashadi.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {CATEGORIES.slice(0, 4).map((c) => (
                  <Badge key={c.value} variant="secondary">
                    {`${c.emoji} ${c.label}`}
                  </Badge>
                ))}
              </div>
              <Button onClick={openNew} className="mt-4 gap-1.5">
                <Plus className="h-4 w-4" /> Birinchisini qo&apos;shish
              </Button>
            </div>
          ) : (
            expenses.map((expense) => {
              const cat = categoryLabel(expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <span className="text-lg">{cat.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{expense.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {`${periodLabel(expense.period)} · ${expense.dueDay}-kuni`}
                      {expense.period !== "monthly"
                        ? ` · oyiga ~${formatSum(expense.monthlyEquivalent)}`
                        : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-sm font-semibold tabular-nums">
                    {formatSum(expense.amount)}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEdit(expense)}
                      aria-label="Tahrirlash"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(expense)}
                      disabled={busy !== null}
                      aria-label="O'chirish"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={load}
        expense={editing}
      />
    </div>
  );
}

function BigNumber({ value, tone }: { value: number; tone: "positive" | "negative" }) {
  const animated = useCountUp(value);
  return (
    <div
      className={cn(
        "mt-1 text-4xl font-bold tabular-nums tracking-tight md:text-5xl",
        tone === "positive"
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-destructive"
      )}
    >
      {formatSum(animated)}
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "positive" | "negative";
}) {
  return (
    <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-destructive"
        )}
      >
        {formatSum(value)}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  tone,
}: {
  label: string;
  value: string;
  accent?: boolean;
  tone?: "positive" | "negative";
}) {
  return (
    <div className={cn("rounded-lg border p-4", accent && "border-primary/40 bg-primary/5")}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold tabular-nums",
          accent && "text-primary",
          tone === "positive" && "text-emerald-600 dark:text-emerald-400",
          tone === "negative" && "text-destructive"
        )}
      >
        {value}
      </div>
    </div>
  );
}
