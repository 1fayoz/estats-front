"use client";

import * as React from "react";
import { CheckCircle2, Clock, Loader2, MessageSquare, XCircle } from "lucide-react";

import type { ComplaintJob } from "@/lib/types";

// «Qabul qilindi» (ish vaqtidan tashqari) ham KUZATILADI: ish vaqti
// boshlanganda holat o'zi «yozilmoqda»ga o'tadi va sotuvchi buni
// sahifani yangilamasdan ko'radi.
const ACTIVE = new Set(["queued", "running", "scheduled"]);

export const jobIsActive = (job: ComplaintJob | null) =>
  job !== null && ACTIVE.has(job.status);

/**
 * Operatorga yozish fon vazifasining ko'rinishi — foiz, qadam,
 * bosilgan tugmalar, xato va OPERATOR javobi.
 *
 * Ikki oynada ishlatiladi (tovar bo'yicha shikoyat va do'kon
 * so'rovi), shuning uchun alohida komponent: ikkalasida ham bir xil
 * ko'rinishi kerak — sotuvchi bir marta o'rganib olsin.
 */
export function JobProgress({ job }: { job: ComplaintJob }) {
  const active = jobIsActive(job);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2 text-sm">
        {active && <Loader2 className="h-4 w-4 shrink-0 animate-spin" />}
        {job.status === "done" && (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        )}
        {job.status === "failed" && <XCircle className="h-4 w-4 shrink-0 text-destructive" />}
        {job.status === "scheduled" && <Clock className="h-4 w-4 shrink-0 text-amber-600" />}
        <span className="font-medium">
          {job.status === "scheduled" && "Qabul qilindi"}
          {job.status === "queued" && "Navbatda"}
          {job.status === "running" && "Yozilmoqda"}
          {job.status === "done" && (job.reachedOperator ? "Operatorga yuborildi" : "Yuborildi")}
          {job.status === "failed" && "To'xtadi"}
        </span>
        <span className="text-muted-foreground">— {job.step}</span>
        {active && <span className="ml-auto tabular-nums">{job.percent}%</span>}
      </div>

      {active && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max(4, job.percent)}%` }}
          />
        </div>
      )}

      {job.resumed && (
        <p className="text-xs text-muted-foreground">
          Suhbat yarim yo&apos;lda qolgan edi — boshidan emas, o&apos;sha joydan davom
          etildi.
        </p>
      )}

      {job.path.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Bosilgan qadamlar: {job.path.join(" → ")}
        </p>
      )}

      {job.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/5 p-2 text-sm">
          {job.error}
        </p>
      )}

      {job.status === "scheduled" && (
        <p className="text-xs text-muted-foreground">
          Uzum qo&apos;llab-quvvatlashi 09:00–21:00 ishlaydi. So&apos;rov qabul
          qilindi va ish vaqti boshlanishi bilan avtomatik yuboriladi — qayta
          kirib bosish shart emas.
        </p>
      )}

      {job.status === "done" && !job.replyText && (
        <p className="text-xs text-muted-foreground">
          Operatorning javobi kutilmoqda — kelganda shu yerda ko&apos;rinadi.
        </p>
      )}

      {job.replyText && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
          <div className="mb-1 flex items-center gap-1.5 font-medium">
            <MessageSquare className="h-3.5 w-3.5" /> Operator javobi
            {job.replyAt && (
              <span className="font-normal text-muted-foreground">
                · {new Date(job.replyAt).toLocaleString("uz-UZ")}
              </span>
            )}
          </div>
          <p className="whitespace-pre-wrap">{job.replyText}</p>
        </div>
      )}
    </div>
  );
}
