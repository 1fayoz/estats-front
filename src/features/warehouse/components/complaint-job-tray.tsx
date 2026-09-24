"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MessageSquare,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComplaintJob } from "@/lib/types";
import { jobIsActive } from "./job-progress";

interface ComplaintJobTrayProps {
  job: ComplaintJob;
  onOpen: () => void;
  onDismiss: () => void;
  title?: string;
  hasAiTray?: boolean;
}

/**
 * O'ng-pastki burchakdagi suzuvchi panel — Uzum moderatsiya operatoriga
 * fonda xabar yuborish jarayonini (progress bar va har bir qadamni)
 * sahifa qayerga aylantirilmasin yoki modal yopilsa ham ko'rsatib turadi.
 */
export function ComplaintJobTray({ job, onOpen, onDismiss, title, hasAiTray }: ComplaintJobTrayProps) {
  const [collapsed, setCollapsed] = React.useState(false);
  const active = jobIsActive(job);
  const isDone = job.status === "done";
  const isFailed = job.status === "failed";
  const hasReply = Boolean(job.replyText);

  const headerTitle =
    job.status === "running"
      ? "Operatorga yozilmoqda"
      : job.status === "queued"
      ? "Navbatda kutmoqda"
      : job.status === "scheduled"
      ? "Yuborish rejalashtirildi"
      : hasReply
      ? "Operator javob berdi!"
      : isDone
      ? "Operatorga uzatildi"
      : isFailed
      ? "Xatolik yuz berdi"
      : "Operator so‘rovi";

  return (
    <div
      role="region"
      aria-label="Telegram operator jarayoni"
      className={cn(
        "fixed inset-x-3 z-40 animate-slide-up sm:inset-x-auto sm:right-4 sm:w-[380px]",
        hasAiTray
          ? "bottom-[calc(4.5rem+env(safe-area-inset-bottom))] lg:bottom-20"
          : "bottom-3 lg:bottom-4",
      )}
    >
      <div
        className={cn(
          "overflow-hidden rounded-2xl border shadow-xl backdrop-blur-xl transition-all duration-300",
          hasReply
            ? "border-emerald-500/40 bg-card/95 shadow-emerald-500/10"
            : isFailed
            ? "border-destructive/40 bg-card/95 shadow-destructive/10"
            : active
            ? "border-primary/40 bg-card/95 shadow-primary/10"
            : "border-border bg-card/95",
        )}
      >
        {/* Sarlavha qatori (Header) */}
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="relative flex shrink-0 items-center justify-center">
            {active ? (
              <span className="relative flex size-7 items-center justify-center">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/30" />
                <span className="relative inline-flex size-7 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Loader2 className="size-4 animate-spin" />
                </span>
              </span>
            ) : hasReply ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <MessageSquare className="size-4" />
              </span>
            ) : isDone ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </span>
            ) : isFailed ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertCircle className="size-4" />
              </span>
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
                <Clock className="size-4" />
              </span>
            )}
          </div>

          <div
            className="min-w-0 flex-1 cursor-pointer select-none"
            onClick={() => setCollapsed((v) => !v)}
          >
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-semibold leading-tight text-foreground">
                {headerTitle}
              </p>
              {active && (
                <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-primary">
                  {job.percent}%
                </span>
              )}
            </div>
            <p className="truncate text-[11px] text-muted-foreground mt-0.5">
              {job.step || (hasReply ? "Yangi xabar mavjud" : "Telegram @umarket_business_bot")}
            </p>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpen}
              className="h-7 px-2 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
              title="Batafsil ochish"
            >
              Ko‘rish
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((v) => !v)}
              className="size-7 text-muted-foreground"
              aria-label={collapsed ? "Kengaytirish" : "Yig‘ish"}
            >
              {collapsed ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </Button>
            {(!active || isDone || isFailed) && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onDismiss}
                className="size-7 text-muted-foreground hover:text-foreground"
                aria-label="Yopish"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar (har doim ko'rinadi) */}
        <div className="h-1.5 w-full bg-muted/60 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out",
              hasReply
                ? "bg-emerald-500"
                : isFailed
                ? "bg-destructive"
                : isDone
                ? "bg-emerald-500"
                : "bg-primary relative overflow-hidden",
            )}
            style={{ width: `${Math.max(4, isDone ? 100 : job.percent)}%` }}
          />
        </div>

        {/* Yoyilgan tana (collapsed bo'lmaganda) */}
        {!collapsed && (
          <div className="space-y-2.5 p-3 text-xs border-t bg-muted/20">
            {title && (
              <p className="font-medium text-foreground line-clamp-1">{title}</p>
            )}

            {/* Qadamlar yo'li */}
            {job.path.length > 0 && (
              <div className="rounded-lg bg-background/80 p-2 text-muted-foreground">
                <span className="font-medium text-foreground">Bosqichlar: </span>
                <span>{job.path.join(" → ")}</span>
              </div>
            )}

            {/* Operator javobi */}
            {job.replyText && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-emerald-950 dark:text-emerald-100">
                <div className="mb-1 flex items-center justify-between gap-1 font-semibold text-[11px] text-emerald-800 dark:text-emerald-300">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="size-3" /> Operator javobi:
                  </span>
                  {job.replyAt && (
                    <span className="text-[10px] font-normal opacity-80">
                      {new Date(job.replyAt).toLocaleTimeString("uz-UZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                <p className="line-clamp-4 whitespace-pre-wrap leading-relaxed">
                  {job.replyText}
                </p>
              </div>
            )}

            {/* Xatolik */}
            {job.error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-2.5 text-destructive">
                <p className="font-semibold text-[11px] mb-0.5">Xatolik:</p>
                <p className="leading-relaxed">{job.error}</p>
              </div>
            )}

            {/* Pastki tugmalar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground">
                {active
                  ? "Fonda uzatilmoqda…"
                  : isDone
                  ? (hasReply ? "Javob olindi" : "Javob kutilmoqda")
                  : isFailed
                  ? "Jarayon to‘xtagan"
                  : ""}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 rounded-lg text-xs"
                onClick={onOpen}
              >
                Batafsil oyna
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
