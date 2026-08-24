"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Flag, Lock, Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatSum } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types";

/**
 * Goals drawn as a path of stages.
 *
 * The ladder is ordered by price and measured against ONE balance, so a seller
 * sees what they can actually afford next rather than every wish creeping up at
 * the same rate. Reached stages stay lit: the point of the path is the sense of
 * having got somewhere.
 */
export function GoalJourney({
  goals,
  onAdd,
  onAchieve,
  onDelete,
}: {
  goals: Goal[];
  onAdd: () => void;
  onAchieve: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
}) {
  if (!goals.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Flag className="h-6 w-6 text-primary" />
        </div>
        <div className="font-medium">Hali maqsad qo&apos;yilmagan</div>
        <p className="max-w-sm text-sm text-muted-foreground">
          &quot;12 mln to&apos;plansa — yangi telefon&quot; kabi maqsad qo&apos;ying.
          Har biriga qancha qolgani va hozirgi sur&apos;atda necha kunda yetishingiz
          o&apos;zi hisoblanadi.
        </p>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> Maqsad qo&apos;shish
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Bosqichlarni bog'lab turuvchi chiziq */}
      <div className="absolute bottom-6 left-[27px] top-6 w-px bg-border" aria-hidden />

      <ol className="space-y-3">
        {goals.map((goal, index) => (
          <motion.li
            key={goal.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: "easeOut" }}
            className="relative flex gap-4"
          >
            <StageMarker goal={goal} index={index} />

            <div
              className={cn(
                "min-w-0 flex-1 rounded-xl border p-4 transition-colors",
                goal.isAchieved && "border-emerald-500/40 bg-emerald-500/5",
                goal.isCurrent && "border-primary/50 bg-primary/5",
                !goal.isAchieved && !goal.isCurrent && "opacity-70"
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {goal.emoji && <span className="text-lg leading-none">{goal.emoji}</span>}
                    <span className="truncate font-medium">{goal.title}</span>
                    {goal.isAchieved && (
                      <Badge variant="success" className="text-[10px]">yig&apos;ildi</Badge>
                    )}
                    {goal.isCurrent && (
                      <Badge variant="info" className="text-[10px]">hozirgi bosqich</Badge>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-muted-foreground">
                    {formatSum(goal.targetAmount)}
                    {goal.note ? ` · ${goal.note}` : ""}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {goal.isAchieved && !goal.achievedAt && (
                    <Button size="sm" variant="outline" onClick={() => onAchieve(goal)}>
                      <Check className="h-3.5 w-3.5" /> Oldim
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => onDelete(goal)}
                    aria-label="Maqsadni o'chirish"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn(
                      "h-full rounded-full",
                      goal.isAchieved
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-primary to-info"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(goal.progress, 100)}%` }}
                    transition={{ delay: 0.15 + index * 0.07, duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-3 text-xs">
                  <span className="font-medium tabular-nums">
                    {goal.progress.toFixed(0)}%
                  </span>
                  {goal.isAchieved ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-3 w-3" /> Yetdingiz
                    </span>
                  ) : goal.daysLeft != null ? (
                    <span className="text-muted-foreground">
                      yana {formatSum(goal.remaining)} · hozirgi sur&apos;atda{" "}
                      <span className="font-medium text-foreground">
                        {goal.daysLeft} kun
                      </span>
                      {goal.reachDate ? ` (${goal.reachDate})` : ""}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      yana {formatSum(goal.remaining)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ol>

      <div className="mt-4 flex justify-center">
        <Button size="sm" variant="outline" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" /> Yangi maqsad
        </Button>
      </div>
    </div>
  );
}

function StageMarker({ goal, index }: { goal: Goal; index: number }) {
  return (
    <div className="relative z-10 flex h-14 w-14 shrink-0 items-start justify-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.07, type: "spring", stiffness: 260, damping: 18 }}
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-full border-2 bg-background text-sm font-semibold",
          goal.isAchieved && "border-emerald-500 text-emerald-600 dark:text-emerald-400",
          goal.isCurrent && "border-primary text-primary",
          !goal.isAchieved && !goal.isCurrent && "border-border text-muted-foreground"
        )}
      >
        {goal.isAchieved ? (
          <Check className="h-5 w-5" />
        ) : goal.isCurrent ? (
          index + 1
        ) : (
          <Lock className="h-4 w-4" />
        )}
      </motion.div>

      {/* Hozirgi bosqich sekin "nafas oladi" — ko'z o'zi shu yerga tushadi. */}
      {goal.isCurrent && (
        <motion.span
          className="absolute top-0 h-12 w-12 rounded-full border-2 border-primary"
          animate={{ scale: [1, 1.25], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          aria-hidden
        />
      )}
    </div>
  );
}
