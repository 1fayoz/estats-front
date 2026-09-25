"use client";

import { motion } from "framer-motion";
import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import type { ModerationJob } from "@/lib/types";
import { moderationJobActive } from "@/stores/moderation-job-store";

/**
 * «Uzum sababini aniqlash» jarayoni: foiz chizig'i, hozirgi qadam va
 * bosqichlar ro'yxati. Tovar kartasida ham, burchakdagi «Fon ishlari»
 * panelida ham BIR XIL ko'rinadi.
 *
 * Kabinetni o'qish paytida foiz vaqt bo'yicha o'sadi — `estats-publish`
 * brauzer ichidagi qadamlarni bildirmaydi; shuning uchun qadam matnida
 * o'tgan soniyalar turadi (backend `waiting_percent`).
 */
export function ModerationJobProgress({
  job,
  compact = false,
}: {
  job: ModerationJob;
  compact?: boolean;
}) {
  const active = moderationJobActive(job);
  const failed = job.status === "failed";
  const done = job.status === "done";
  const percent = done ? 100 : Math.max(3, Math.min(100, job.percent));
  const stages = job.stages.filter((stage) => stage.state !== "skipped");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className={cn("min-w-0 truncate", failed ? "text-destructive" : "text-muted-foreground")}>
          {failed ? "To'xtadi" : job.step || "Boshlanmoqda"}
        </span>
        {active && <span className="shrink-0 font-semibold tabular-nums text-primary">{`${percent}%`}</span>}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn(
            "h-full rounded-full",
            failed ? "bg-destructive" : done ? "bg-emerald-500" : "bg-primary",
          )}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
      {!compact && (
        <ol className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {stages.map((stage) => (
            <li
              key={stage.key}
              className={cn(
                "inline-flex items-center gap-1",
                stage.state === "done" && "text-emerald-600 dark:text-emerald-500",
                stage.state === "active" && "font-medium text-foreground",
                stage.state === "failed" && "font-medium text-destructive",
                stage.state === "pending" && "text-muted-foreground",
              )}
            >
              {stage.state === "done" ? (
                <Check className="h-3 w-3" aria-hidden="true" />
              ) : stage.state === "active" ? (
                <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              ) : stage.state === "failed" ? (
                <AlertCircle className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Circle className="h-3 w-3" aria-hidden="true" />
              )}
              {stage.label}
            </li>
          ))}
        </ol>
      )}
      {failed && job.error && <p className="text-xs leading-relaxed text-destructive">{job.error}</p>}
      {done && job.message && <p className="text-xs leading-relaxed text-muted-foreground">{job.message}</p>}
    </div>
  );
}
